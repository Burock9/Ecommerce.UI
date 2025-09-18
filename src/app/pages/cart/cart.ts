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
    
    // Test için static veri
    this.cart = { 
      items: [
        { productId: 1, productName: 'Test Ürün', quantity: 2, price: 100 }
      ], 
      totalPrice: 200 
    };
    this.loading = false;
    
    console.log('✅ CartComponent yüklemesi tamamlandı');
    
    // 5 saniye sonra kontrol et
    setTimeout(() => {
      console.log('⏰ 5 saniye sonra durum kontrolü:');
      console.log('🗺️ Current route:', this.router.url);
      console.log('🔓 Still authenticated?', this.authService.isAuthenticated());
      console.log('👤 Current user still exists?', !!this.authService.getCurrentUser());
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
    console.log('🗑️ Remove product:', productId);
    alert('Ürün çıkarma test aşamasında');
  }

  updateQuantity(productId: number, newQuantity: number): void {
    console.log('🔢 Update quantity:', productId, newQuantity);
    
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }

    // Test için ürün miktarını güncelle
    const item = this.cart.items.find(item => item.productId === productId);
    if (item) {
      const unitPrice = item.price / item.quantity; // Birim fiyat
      item.quantity = newQuantity;
      item.price = unitPrice * newQuantity; // Toplam fiyatı güncelle
      this.updateTotalPrice();
    }
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
    console.log('🗑️ Ürün sil:', productId);
    // Test için ürünü sepetten çıkar
    this.cart.items = this.cart.items.filter(item => item.productId !== productId);
    this.updateTotalPrice();
  }

  clearCart(): void {
    console.log('🗑️ Sepeti temizle');
    if (confirm('Sepeti tamamen temizlemek istediğinize emin misiniz?')) {
      this.cart.items = [];
      this.cart.totalPrice = 0;
    }
  }

  getTotalQuantity(): number {
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  private updateTotalPrice(): void {
    this.cart.totalPrice = this.cart.items.reduce((total, item) => total + item.price, 0);
  }
}