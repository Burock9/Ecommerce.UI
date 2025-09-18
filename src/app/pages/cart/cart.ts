import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../service/cart.service';
import { AuthService } from '../../service/auth.service';
import { Cart, CartItem } from '../../model/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [], totalPrice: 0 };
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {
    console.log('🏗️ CartComponent constructor çağrıldı');
    console.log('🧭 Router instance:', !!this.router);
    console.log('🛒 CartService instance:', !!this.cartService);
    console.log('🔐 AuthService instance:', !!this.authService);
  }

  ngOnInit(): void {
    console.log('🔄 CartComponent ngOnInit çağrıldı - SAYFA BAŞARILI ŞEKILDE YÜKLENDİ!');
    console.log('🗺️ Current route:', this.router.url);
    
    // 🔍 AUTH DURUMU KONTROLü - Bu çok kritik!
    console.log('🔐 Auth kontrol başlıyor...');
    console.log('🪪 Token mevcut mu?', !!this.authService.getToken());
    console.log('🪪 Token değeri:', this.authService.getToken()?.substring(0, 20) + '...');
    console.log('👤 Current user:', this.authService.getCurrentUser());
    console.log('🔓 Is authenticated?', this.authService.isAuthenticated());
    
    // Auth durumunu sürekli izle
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      console.log('👤 Auth durumu değişti:', user ? `User: ${user.username}` : 'NULL - LOGOUT EDİLDİ!');
      
      if (!user) {
        console.log('❌ Kullanıcı oturumu kapandı - bu yüzden sayfa kapanıyor olabilir!');
      }
    });
    
    // Gerçek sepet verisini CartService'den al
    this.loading = true;
    
    // CartService'deki sepet durumunu dinle (otomatik yüklenir)
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (cart) => {
        console.log('🛒 CartService\'ten sepet verisi geldi:', cart);
        this.cart = cart;
        this.loading = false;
        
        if (cart.items.length > 0) {
          console.log('✅ Sepet dolu, ürün sayısı:', cart.items.length);
        } else {
          console.log('📪 Sepet boş');
        }
      },
      error: (error) => {
        console.error('❌ Sepet verisi yüklenirken hata:', error);
        this.error = 'Sepet verileri yüklenirken bir hata oluştu.';
        this.loading = false;
      }
    });
    
    console.log('✅ CartComponent yüklemesi tamamlandı');
    
    // 5 saniye sonra kontrol et
    setTimeout(() => {
      console.log('⏰ 5 saniye sonra durum kontrolü:');
      console.log('🗺️ Current route:', this.router.url);
      console.log('🔓 Still authenticated?', this.authService.isAuthenticated());
      console.log('👤 Current user still exists?', !!this.authService.getCurrentUser());
      console.log('🛒 Current cart state:', this.cart);
    }, 5000);
  }

  ngOnDestroy(): void {
    console.log('💀 CartComponent ngOnDestroy çağrıldı');
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    console.log('🛒 loadCart metodu çağrıldı (template için)');
    // Bu template'teki retry butonu için gerekli
    this.ngOnInit();
  }

  removeFromCart(productId: number): void {
    console.log('🗑️ removeFromCart metodu çağrıldı - productId:', productId);
    console.log('🛒 Mevcut cart durumu:', this.cart);
    
    // Test verisi mi kontrol et (backend'te olmayan veriler)
    if (this.isTestData()) {
      console.log('🧪 Test verisi tespit edildi, local olarak siliniyor');
      this.removeItemLocally(productId);
      return;
    }
    
    this.removeItem(productId);
  }

  // Test verisi mi kontrol et
  private isTestData(): boolean {
    // Test verileri genellikle "Test Ürün" prefix'i ile başlar
    return this.cart.items.some(item => item.productName.includes('Test Ürün'));
  }

  // Local test için (backend çalışmadığında)
  private removeItemLocally(productId: number): void {
    console.log('🧪 Local olarak ürün siliniyor:', productId);
    this.cart = {
      ...this.cart,
      items: this.cart.items.filter(item => item.productId !== productId),
      totalPrice: this.cart.items
        .filter(item => item.productId !== productId)
        .reduce((sum, item) => sum + item.price, 0)
    };
    console.log('✅ Local silme tamamlandı, yeni cart:', this.cart);
  }

  updateQuantity(productId: number, newQuantity: number): void {
    console.log('🔢 updateQuantity çağrıldı:', { productId, newQuantity });
    console.log('🛒 Mevcut cart durumu:', this.cart);
    
    // Test verisi mi kontrol et
    if (this.isTestData()) {
      console.log('🧪 Test verisi tespit edildi, local olarak güncelleniyor');
      this.updateQuantityLocally(productId, newQuantity);
      return;
    }
    
    // Miktar 0 veya daha küçükse ürünü sil
    if (newQuantity <= 0) {
      console.log('🗑️ Miktar 0 veya küçük, ürün siliniyor:', productId);
      this.removeItem(productId);
      return;
    }

    console.log('🔄 Backend\'e miktar güncelleme isteği gönderiliyor...');
    
    // Backend'e miktar güncelleme isteği gönder
    this.cartService.updateQuantity(productId, newQuantity).subscribe({
      next: (response) => {
        console.log('✅ Miktar başarıyla güncellendi:', response);
        // CartService otomatik olarak sepeti yeniden yükleyecek
      },
      error: (error) => {
        console.error('❌ Miktar güncellenirken hata:', error);
        this.error = 'Miktar güncellenirken bir hata oluştu.';
        
        // 3 saniye sonra hatayı temizle
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    });
  }

  // Local test için (backend çalışmadığında)
  private updateQuantityLocally(productId: number, newQuantity: number): void {
    console.log('🧪 Local olarak miktar güncelleniyor:', { productId, newQuantity });
    
    if (newQuantity <= 0) {
      console.log('🗑️ Miktar 0, ürün siliniyor');
      this.removeItemLocally(productId);
      return;
    }
    
    const newItems = this.cart.items.map(item => {
      if (item.productId === productId) {
        const pricePerItem = item.price / item.quantity;
        return {
          ...item,
          quantity: newQuantity,
          price: pricePerItem * newQuantity
        };
      }
      return item;
    });
    
    this.cart = {
      ...this.cart,
      items: newItems,
      totalPrice: newItems.reduce((sum, item) => sum + item.price, 0)
    };
    
    console.log('✅ Local güncelleme tamamlandı, yeni cart:', this.cart);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  checkout(): void {
    alert('Ödeme test aşamasında');
  }

  isEmpty(): boolean {
    return this.cart.items.length === 0;
  }

  getTotalItemCount(): number {
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  formatPrice(price: number): string {
    return price + ' ₺';
  }

  proceedToCheckout(): void {
    alert('Sipariş test aşamasında');
  }

  getItemSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  // HTML template için gerekli metodlar
  goHome(): void {
    console.log('🏠 Ana sayfaya git');
    this.router.navigate(['/']);
  }

  removeItem(productId: number): void {
    console.log('🗑️ removeItem çağrıldı - productId:', productId);
    console.log('🛒 Mevcut sepet durumu:', this.cart);
    console.log('🔄 Backend\'e silme isteği gönderiliyor...');
    
    // Loading göstermiyoruz, sadece işlemi yapıyoruz
    
    // Backend'e silme isteği gönder
    this.cartService.removeFromCart(productId).subscribe({
      next: (response) => {
        console.log('✅ Ürün başarıyla silindi:', response);
        // CartService otomatik olarak sepeti yeniden yükleyecek
      },
      error: (error) => {
        console.error('❌ Ürün silinirken hata:', error);
        console.error('❌ Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        // Hata durumunda kullanıcıya bilgi ver
        this.error = 'Ürün silinirken bir hata oluştu.';
        
        // 3 saniye sonra hatayı temizle
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    });
  }

  clearCart(): void {
    console.log('🗑️ Sepeti temizle');
    if (confirm('Sepeti tamamen temizlemek istediğinize emin misiniz?')) {
      // Backend'e sepet temizleme isteği gönder
      this.cartService.clearCartOnServer().subscribe({
        next: (response) => {
          console.log('✅ Sepet başarıyla temizlendi:', response);
          // CartService otomatik olarak sepeti güncelledi
        },
        error: (error) => {
          console.error('❌ Sepet temizlenirken hata:', error);
          this.error = 'Sepet temizlenirken bir hata oluştu.';
          
          // 3 saniye sonra hatayı temizle
          setTimeout(() => {
            this.error = null;
          }, 3000);
        }
      });
    }
  }

  getTotalQuantity(): number {
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  private updateTotalPrice(): void {
    this.cart.totalPrice = this.cart.items.reduce((total, item) => total + item.price, 0);
  }

  // Test için veri yükleme
  loadTestData(): void {
    console.log('🧪 Test verileri yükleniyor...');
    this.cartService.addTestData();
  }
}