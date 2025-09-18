import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cart, CartItem, AddToCartRequest, CartAnalytics } from '../model/cart.model';
import { ResponseWrapper } from '../model/response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  
  // Sepet durumu için BehaviorSubject - header'da sepet sayısı için
  private cartSubject = new BehaviorSubject<Cart>({ items: [], totalPrice: 0 });
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  
  public cart$ = this.cartSubject.asObservable();
  public cartItemCount$ = this.cartItemCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Kullanıcı giriş yaptığında sepeti yükle
    this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.loadCart().subscribe({
          next: (cart) => {
            console.log('🔄 Otomatik sepet yüklemesi başarılı');
          },
          error: (error) => {
            console.error('⚠️ Otomatik sepet yüklemesi başarısız:', error);
            console.error('🚨 HTTP Status Code:', error.status);
            console.error('🚨 Error Body:', error.error);
            console.error('🚨 Error Headers:', error.headers);
            
            if (error.status === 403) {
              console.error('🔒 403 FORBIDDEN: Cart endpoint\'ine erişim yetkiniz yok!');
              console.error('👤 Mevcut user role\'ları kontrol edin');
            }
            
            // Hata durumunda boş sepet durumuna geç
            this.clearCart();
          }
        });
      } else {
        this.clearCart();
      }
    });
  }

  /**
   * HTTP header'larını hazırla
   */
  private getHttpHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const currentUser = this.authService.getCurrentUser();
    
    console.log('👤 Current User:', currentUser);
    console.log('👤 User Roles:', currentUser?.roles);
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Kullanıcının sepetini backend'den yükle
   */
  loadCart(): Observable<Cart> {
    console.log('🔄 loadCart() çağrıldı');
    console.log('🔗 Elasticsearch API URL:', `${this.apiUrl}/elasticsearch`);
    console.log('🔑 Token:', this.authService.getToken() ? 'Mevcut' : 'YOK!');
    
    const headers = this.getHttpHeaders();
    console.log('📤 HTTP Headers:', headers);
    
    // Önce Elasticsearch endpoint'ini dene
    return this.http.get<any>(`${this.apiUrl}/elasticsearch`, { 
      headers: headers 
    }).pipe(
      tap(response => {
        console.log('✅ Elasticsearch response:', response);
        
        // Elasticsearch response'unu Cart formatına dönüştür
        let cart: Cart;
        if (response && response.id && response.items) {
          // Elasticsearch formatından Cart formatına dönüştür
          const items: CartItem[] = response.items.map((item: any) => ({
            productId: parseInt(item.productId),
            productName: item.productName,
            quantity: item.quantity,
            price: item.subtotal
          }));
          
          cart = {
            items: items,
            totalPrice: response.totalPrice || 0
          };
        } else {
          // Boş response durumu
          cart = { items: [], totalPrice: 0 };
        }
        
        console.log('🔄 Dönüştürülmüş cart:', cart);
        this.updateCartState(cart);
        console.log('🛒 Sepet state güncellendi');
      }),
      catchError(error => {
        console.error('❌ Elasticsearch hatası:', error);
        
        // Elasticsearch hatası varsa normal endpoint'i dene
        console.log('🔄 Normal database endpoint\'i deneniyor...');
        return this.http.get<Cart>(this.apiUrl, { headers }).pipe(
          tap(cart => {
            console.log('✅ Database response:', cart);
            this.updateCartState(cart);
          }),
          catchError(dbError => {
            console.error('❌ Database hatası:', dbError);
            
            if (dbError.status === 403 || dbError.status === 404) {
              console.log('📝 Sepet bulunamadı, boş sepet oluşturuluyor');
              const emptyCart: Cart = { items: [], totalPrice: 0 };
              this.updateCartState(emptyCart);
              return of(emptyCart);
            }
            
            // Diğer hataları yukarı fırlat
            throw dbError;
          })
        );
      }),
      // Response mapping - Elasticsearch response'u Observable<Cart>'a dönüştür
      map(response => {
        if (response && response.id && response.items) {
          // Elasticsearch response
          const items: CartItem[] = response.items.map((item: any) => ({
            productId: parseInt(item.productId),
            productName: item.productName,
            quantity: item.quantity,
            price: item.subtotal
          }));
          
          return {
            items: items,
            totalPrice: response.totalPrice || 0
          } as Cart;
        } else {
          // Database response veya boş response
          return response as Cart || { items: [], totalPrice: 0 };
        }
      })
    );
  }

  /**
   * Sepet durumunu güncelle
   */
  private updateCartState(cart: Cart): void {
    this.cartSubject.next(cart);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartItemCountSubject.next(totalItems);
  }

  /**
   * Sepeti temizle (logout)
   */
  private clearCart(): void {
    this.cartSubject.next({ items: [], totalPrice: 0 });
    this.cartItemCountSubject.next(0);
  }

  /**
   * Sepete ürün ekle
   */
  addToCart(productId: number, quantity: number = 1): Observable<ResponseWrapper<string>> {
    const request: AddToCartRequest = { productId, quantity };
    
    return this.http.post<ResponseWrapper<string>>(
      `${this.apiUrl}/add`, 
      request,
      { headers: this.getHttpHeaders() }
    ).pipe(
      tap(response => {
        console.log('✅ Sepete eklendi:', response);
        // Sepeti yeniden yükle
        this.loadCart().subscribe();
      })
    );
  }

  /**
   * Sepetten ürün çıkar
   */
  removeFromCart(productId: number): Observable<ResponseWrapper<string>> {
    return this.http.delete<ResponseWrapper<string>>(
      `${this.apiUrl}/remove/${productId}`,
      { headers: this.getHttpHeaders() }
    ).pipe(
      tap(response => {
        console.log('🗑️ Sepetten çıkarıldı:', response);
        // Sepeti yeniden yükle
        this.loadCart().subscribe();
      })
    );
  }

  /**
   * Sepet analizi getir (Elasticsearch'ten)
   */
  getCartAnalytics(): Observable<CartAnalytics> {
    return this.http.get<CartAnalytics>(
      `${this.apiUrl}/my-cart/analytics`,
      { headers: this.getHttpHeaders() }
    );
  }

  /**
   * Mevcut sepet durumunu al (Observable olmadan)
   */
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Mevcut sepet item sayısını al
   */
  getCurrentCartItemCount(): number {
    return this.cartItemCountSubject.value;
  }

  /**
   * Sepette belirli bir ürün var mı kontrol et
   */
  hasProductInCart(productId: number): boolean {
    const cart = this.getCurrentCart();
    return cart.items.some(item => item.productId === productId);
  }

  /**
   * Sepetteki belirli bir ürünün miktarını al
   */
  getProductQuantityInCart(productId: number): number {
    const cart = this.getCurrentCart();
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Sepet boş mu kontrol et
   */
  isCartEmpty(): boolean {
    const cart = this.getCurrentCart();
    return cart.items.length === 0;
  }

  /**
   * Sepetteki toplam ürün miktarını al
   */
  getTotalItemCount(): number {
    return this.getCurrentCartItemCount();
  }

  /**
   * Sepetteki toplam fiyatı al
   */
  getTotalPrice(): number {
    const cart = this.getCurrentCart();
    return cart.totalPrice;
  }
}