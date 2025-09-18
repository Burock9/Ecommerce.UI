import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cart, CartItem, AddToCartRequest, CartAnalytics } from '../model/cart.model';
import { ResponseWrapper } from '../model/response.model';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

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
    private authService: AuthService,
    private apiService: ApiService
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
   * Kullanıcının sepetini backend'den yükle
   */
  loadCart(): Observable<Cart> {
    console.log('🔄 loadCart() çağrıldı');
    console.log('🔑 Token:', this.authService.getToken() ? 'Mevcut' : 'YOK!');
    
    // Sıralı sonuç için veritabanı endpoint'ini kullan (ID sırasına göre sıralı!)
    return this.apiService.get<any>('/cart').pipe(
      map(response => {
        console.log('📦 Database response:', response);
        
        // Backend CartResponse formatından Cart formatına dönüştür
        let cart: Cart;
        
        if (response && response.items && Array.isArray(response.items)) {
          // CartResponse formatından Cart formatına dönüştür
          const items: CartItem[] = response.items.map((item: any) => ({
            productId: parseInt(item.productId),
            productName: item.productName,
            quantity: item.quantity,
            price: item.price, // CartResponse'da price olarak geliyor
            imageUrl: item.imageUrl // Backend'den gelen imageUrl'yi direkt kullan
          }));
          
          cart = {
            items: items,
            totalPrice: response.totalPrice || 0
          };
          
          console.log('✅ Sepet başarıyla dönüştürüldü (DATABASE):', cart);
        } else {
          console.log('📭 Boş sepet response\'u (DATABASE)');
          cart = { items: [], totalPrice: 0 };
        }
        
        console.log('📦 Database cart (sıralı):', cart);
        this.updateCartState(cart);
        return cart;
      }),
      catchError(error => {
        console.error('❌ Database hatası:', error);
        
        if (error.status === 403 || error.status === 404) {
          console.log('📝 Sepet bulunamadı (Database), boş sepet oluşturuluyor');
          const emptyCart: Cart = { items: [], totalPrice: 0 };
          this.updateCartState(emptyCart);
          return of(emptyCart);
        }
        
        throw error;
      })
    );
  }

  /**
   * Sepet durumunu güncelle
   */
  private updateCartState(cart: Cart): void {
    console.log('🔄 updateCartState çağrıldı, gelen cart:', cart);
    console.log('📊 Sepet item sayısı:', cart.items.length);
    console.log('💰 Toplam fiyat:', cart.totalPrice);
    
    this.cartSubject.next(cart);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartItemCountSubject.next(totalItems);
    
    console.log('📤 BehaviorSubject güncellendi, toplam item:', totalItems);
    console.log('🛒 Mevcut cartSubject value:', this.cartSubject.value);
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
    console.log('🛒 addToCart() çağrıldı - productId:', productId, 'quantity:', quantity);
    const request: AddToCartRequest = { productId, quantity };
    
    return this.apiService.post<ResponseWrapper<string>>('/cart/add', request).pipe(
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
    console.log('🗑️ removeFromCart() - productId:', productId);
    console.log('🔑 Auth token:', this.authService.getToken() ? 'Mevcut' : 'YOK');
    
    if (!this.authService.getToken()) {
      console.log('⚠️ Token yok, API çağrısı yapılamıyor');
      return of({ data: 'Token yok', message: 'Token bulunamadı' } as ResponseWrapper<string>);
    }
    
    return this.apiService.delete<ResponseWrapper<string>>(`/cart/remove/${productId}`).pipe(
      tap(response => {
        console.log('✅ Ürün silindi, sepet yeniden yükleniyor...');
        // Sepeti yeniden yükle
        this.loadCart().subscribe();
      }),
      catchError(error => {
        console.error('❌ removeFromCart API hatası:', error);
        console.error('❌ Hata detayları:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        throw error;
      })
    );
  }

  /**
   * Sepeti tamamen temizle (Backend'e istek gönder)
   */
  clearCartOnServer(): Observable<ResponseWrapper<string>> {
    console.log('🗑️ clearCartOnServer() çağrıldı');
    return this.apiService.delete<ResponseWrapper<string>>('/cart/clear').pipe(
      tap(response => {
        console.log('🗑️ Sepet tamamen temizlendi:', response);
        // Local state'i de temizle
        this.clearCart();
      })
    );
  }

  /**
   * Sepetteki ürün miktarını güncelle
   */
  updateQuantity(productId: number, newQuantity: number): Observable<ResponseWrapper<string>> {
    console.log('🔢 updateQuantity() - productId:', productId, 'newQuantity:', newQuantity);
    console.log('🔑 Auth token:', this.authService.getToken() ? 'Mevcut' : 'YOK');
    
    if (!this.authService.getToken()) {
      console.log('⚠️ Token yok, API çağrısı yapılamıyor');
      return of({ data: 'Token yok', message: 'Token bulunamadı' } as ResponseWrapper<string>);
    }
    
    return this.apiService.put<ResponseWrapper<string>>('/cart/update', { 
      productId: productId, 
      quantity: newQuantity 
    }).pipe(
      tap(response => {
        console.log('✅ Miktar güncellendi, sepet yeniden yükleniyor...');
        // Sepeti yeniden yükle
        this.loadCart().subscribe();
      }),
      catchError(error => {
        console.error('❌ updateQuantity API hatası:', error);
        console.error('❌ Hata detayları:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        throw error;
      })
    );
  }

  /**
   * Sepet analizi getir (Elasticsearch'ten)
   */
  getCartAnalytics(): Observable<CartAnalytics> {
    console.log('📊 getCartAnalytics() çağrıldı');
    return this.apiService.get<CartAnalytics>('/cart/my-cart/analytics');
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

  /**
   * Test için sepete örnek veri ekle (Development only)
   */
  addTestData(): void {
    console.log('🧪 Test verileri ekleniyor...');
    const testCart: Cart = {
      items: [
        { productId: 1, productName: 'Test Ürün 1', quantity: 2, price: 100 },
        { productId: 2, productName: 'Test Ürün 2', quantity: 1, price: 50 },
        { productId: 3, productName: 'Test Ürün 3', quantity: 3, price: 200 }
      ],
      totalPrice: 350
    };
    
    this.updateCartState(testCart);
    console.log('✅ Test verileri eklendi:', testCart);
  }
}