import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';
import { CategoryService } from '../../service/category.service';
import { CartService } from '../../service/cart.service';
import { User } from '../../model/auth.model';
import { Category } from '../../model/category.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  currentUser: User | null = null;
  cartCount: number = 0; // Sepetteki ürün sayısı için
  categories: Category[] = []; // Backend'den gelen kategoriler
  isDropdownOpen: boolean = false; // Dropdown durumu
  private clickListener?: (event: Event) => void;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService, 
    private categoryService: CategoryService,
    private cartService: CartService,
    private elementRef: ElementRef,
    private router: Router
  ) {
    // Kullanıcı durumunu izle
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
    });

    // Sepet sayısını izle
    this.cartService.cartItemCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.cartCount = count;
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    
    // Document click listener ekle
    this.clickListener = (event: Event) => {
      const target = event.target as HTMLElement;
      const dropdown = this.elementRef.nativeElement.querySelector('#categoriesDropdown');
      const dropdownMenu = this.elementRef.nativeElement.querySelector('.categories-dropdown');
      
      // Dropdown veya dropdown menüsüne tıklanmadıysa kapat
      if (!dropdown?.contains(target) && !dropdownMenu?.contains(target)) {
        this.isDropdownOpen = false;
      }
    };
    
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    // Subject'i temizle
    this.destroy$.next();
    this.destroy$.complete();
    
    // Click listener'ı temizle
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  // Kategorileri backend'den yükle
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response: any) => {
        console.log('Kategoriler yüklendi:', response);
        // CategoryService Page<CategoryIndex> dönüyor, content property'sini kullan
        this.categories = response.content || [];
      },
      error: (error: any) => {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
        // Backend olmadığında test için mock data
        this.categories = [
          { id: 1, name: 'Elektronik', description: 'Teknoloji ürünleri' },
          { id: 2, name: 'Giyim & Moda', description: 'Giyim ve aksesuar' },
          { id: 3, name: 'Ev & Yaşam', description: 'Ev eşyaları' },
          { id: 4, name: 'Müzik', description: 'Müzik aletleri' },
          { id: 5, name: 'Oyun Konsolları', description: 'Oyun ve eğlence' },
          { id: 6, name: 'Spor & Outdoor', description: 'Spor malzemeleri' },
          { id: 7, name: 'Kitap & Hobi', description: 'Kitap ve hobi ürünleri' }
        ];
        console.log('Mock kategoriler yüklendi:', this.categories);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Sepete git
  goToCart(): void {
    console.log('🛒 goToCart() çağrıldı');
    console.log('🗺️ Current URL before navigation:', this.router.url);
    console.log('🔐 Auth durumu:', {
      token: !!this.authService.getToken(),
      user: this.authService.getCurrentUser()?.username,
      authenticated: this.authService.isAuthenticated()
    });
    
    console.log('🎯 Navigating to /cart...');
    
    // Navigation'ı 500ms geciktir ki debug log'larını görebilelim
    setTimeout(() => {
      this.router.navigate(['/cart']).then((success) => {
        console.log('🚀 Navigation result:', success ? 'SUCCESS' : 'FAILED');
        console.log('🗺️ Current URL after navigation:', this.router.url);
        
        if (!success) {
          console.error('❌ Navigation başarısız! Muhtemelen guard engelliyor.');
        }
        
        // 2 saniye sonra durum kontrolü
        setTimeout(() => {
          console.log('⏰ 2 saniye sonra durum:');
          console.log('🗺️ Final URL:', this.router.url);
          console.log('🔐 Auth hala valid?', this.authService.isAuthenticated());
        }, 2000);
        
      }).catch((error) => {
        console.error('💥 Navigation error:', error);
      });
    }, 500);
  }

  // Siparişlere git  
  goToOrders(): void {
    console.log('Siparişlere gidiliyor...');
    // TODO: Siparişler sayfası oluşturulduğunda bu route'u aktifleştir
    // this.router.navigate(['/orders']);
  }

  // Kategoriye git
  goToCategory(category: Category, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Dropdown'ı kapat
    this.isDropdownOpen = false;
    
    // Kategori sayfasına yönlendir
    console.log('Kategoriye gidiliyor:', category.name, 'ID:', category.id);
    this.router.navigate(['/category', category.id]);
  }

  // Dropdown'ı manuel kapatma (isteğe bağlı)
  closeDropdown(): void {
    const dropdown = document.getElementById('categoriesDropdown');
    if (dropdown) {
      const bsDropdown = (window as any).bootstrap?.Dropdown?.getInstance(dropdown);
      if (bsDropdown) {
        bsDropdown.hide();
      }
    }
    this.isDropdownOpen = false;
  }

  // Dropdown toggle - manuel kontrol için
  toggleDropdown(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Kategori için uygun ikon döndür
  getCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();
    
    if (name.includes('elektronik')) return 'fas fa-laptop';
    if (name.includes('giyim') || name.includes('moda')) return 'fas fa-tshirt';
    if (name.includes('ev') || name.includes('yaşam')) return 'fas fa-home';
    if (name.includes('spor') || name.includes('outdoor')) return 'fas fa-running';
    if (name.includes('kitap') || name.includes('hobi')) return 'fas fa-book';
    if (name.includes('müzik')) return 'fas fa-music';
    if (name.includes('oyun') || name.includes('konsol')) return 'fas fa-gamepad';
    if (name.includes('sağlık') || name.includes('güzellik')) return 'fas fa-heart';
    if (name.includes('bebek') || name.includes('çocuk')) return 'fas fa-baby';
    if (name.includes('otomobil') || name.includes('araç')) return 'fas fa-car';
    
    // Default ikon
    return 'fas fa-tag';
  }
}
