import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../../service/product.service';
import { CategoryService } from '../../service/category.service';
import { CartService } from '../../service/cart.service';
import { AuthService } from '../../service/auth.service';
import { ProductIndex } from '../../model/product.model';
import { CategoryIndex } from '../../model/category.model';
import { Page } from '../../model/response.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class CategoryPage implements OnInit, OnDestroy {
  categoryId!: string;
  category: CategoryIndex | null = null;
  products: ProductIndex[] = [];
  private destroy$ = new Subject<void>();
  loading = false;
  error: string | null = null;

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  // Sıralama ve görünüm seçenekleri
  currentSort = 'Sıralama';
  currentView = 'grid'; // 'grid' veya 'list'
  showSortDropdown = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      console.log('🏷️ Kategori ID:', this.categoryId);
      this.loadCategory();
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategory(): void {
    this.categoryService.getCategoryById(+this.categoryId).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (error) => {
        console.error('Error loading category:', error);
      }
    });
  }

  loadProducts(page: number = 0, sort?: string): void {
    this.loading = true;
    this.error = null;

    console.log('🚀 loadProducts çağrıldı - page:', page, 'sort:', sort);

    // Backend çağrısında sorting parametresi ekle
    this.productService.getProductsByCategory(+this.categoryId, page, 12, sort).subscribe({
      next: (response: Page<ProductIndex>) => {
        this.products = response.content;
        console.log('🔍 Backend\'den gelen ürünler:', this.products.length, 'adet');
        console.log('� İlk 3 ürün:', this.products.slice(0, 3).map(p => `${p.name}: ${p.price}₺`));
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
        
        // Backend sorting çalışmadıysa veya sort parametresi yoksa frontend'de sırala
        if (sort && this.currentSort !== 'Sıralama') {
          console.log('🔧 Backend sorting başarısız, frontend sıralama yapılıyor...');
          this.applySorting(this.currentSort);
        }
      },
      error: (error) => {
        this.error = 'Ürünler yüklenirken hata oluştu';
        this.loading = false;
        console.error('❌ Backend error:', error);
        console.log('🔄 Frontend sıralama deneniyor...');
        
        // Backend hata verirse ve mevcut ürünler varsa frontend'de sırala
        if (this.products.length > 0 && this.currentSort !== 'Sıralama') {
          this.applySorting(this.currentSort);
        }
      }
    });
  }

  onPageChange(page: number): void {
    this.loadProducts(page);
  }

  // Dropdown'ı aç/kapat
  toggleSortDropdown(): void {
    this.showSortDropdown = !this.showSortDropdown;
  }

  // Dışına tıklandığında dropdown'ı kapat
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.sort-dropdown');

    if (!dropdown) {
      this.showSortDropdown = false;
    }
  }

  // Sıralama değiştirildiğinde çalışacak
  onSortChange(sortType: string): void {
    this.currentSort = sortType;
    this.showSortDropdown = false; // Dropdown'ı kapat
    console.log('🔄 Sıralama değişti:', sortType);
    
    // Önce backend'den sıralanmış veri çekmeye çalış
    const sortParam = this.getSortParameter(sortType);
    console.log('📤 Backend sort parametresi:', sortParam);
    
    // Backend'e sort parametresi ile yeniden çağrı yap
    this.loadProducts(0, sortParam);
  }

  // Sıralama tipi için uygun ikonu döndür
  getSortIcon(sortType: string): string {
    switch(sortType) {
      case 'Sıralama': return 'fas fa-sort';
      case 'En Popüler': return 'fas fa-fire';
      case 'En Yeniler': return 'fas fa-clock';
      case 'Fiyat: Artan': return 'fas fa-sort-amount-up';
      case 'Fiyat: Azalan': return 'fas fa-sort-amount-down';
      case 'En Çok Değerlendirilen': return 'fas fa-star';
      default: return 'fas fa-sort';
    }
  }

  // Gerçek sıralama işlemini uygula (Frontend fallback)
  applySorting(sortType: string): void {
    console.log('🔧 Frontend sıralama başladı:', sortType, 'Ürün sayısı:', this.products.length);
    
    if (this.products.length === 0) {
      console.log('⚠️ Sıralanacak ürün yok');
      return;
    }

    // Orijinal sırayı kaydet
    const originalOrder = this.products.map(p => ({ id: p.id, name: p.name, price: p.price }));
    console.log('📋 Orijinal sıra (ilk 3):', originalOrder.slice(0, 3));
    
    let sortedProducts = [...this.products]; // Kopya oluştur
    
    switch(sortType) {
      case 'Fiyat: Artan':
        sortedProducts = sortedProducts.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceA - priceB;
        });
        break;
        
      case 'Fiyat: Azalan':
        sortedProducts = sortedProducts.sort((a, b) => {
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceB - priceA;
        });
        break;
        
      case 'En Yeniler':
        sortedProducts = sortedProducts.sort((a, b) => {
          const idA = parseInt(a.id);
          const idB = parseInt(b.id);
          return idB - idA; // Yüksek ID = yeni
        });
        break;
        
      case 'En Çok Değerlendirilen':
        sortedProducts = sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
        
      case 'En Popüler':
      default:
        sortedProducts = sortedProducts.sort((a, b) => {
          const stockA = a.stock || 0;
          const stockB = b.stock || 0;
          return stockB - stockA; // Yüksek stok = popüler
        });
        break;
    }
    
    // Sıralanmış ürünleri ata - Angular change detection için yeni referans
    this.products = sortedProducts;
    
    console.log('� Yeni sıra (ilk 3):', this.products.slice(0, 3).map(p => ({ id: p.id, name: p.name, price: p.price })));
    
    // Sıralamanın değişip değişmediğini kontrol et
    const orderChanged = !this.products.every((product, index) => 
      originalOrder[index] && product.id === originalOrder[index].id
    );
    
    console.log('🔄 Sıralama değişti mi?', orderChanged ? '✅ EVET' : '❌ HAYIR');
    
    if (orderChanged) {
      console.log('✅ Frontend sıralama BAŞARIYLA tamamlandı:', sortType);
    } else {
      console.log('⚠️ Sıralama değişmedi - zaten bu sırada olabilir');
    }
  }

  // Backend'e gönderilecek sıralama parametresini döndür
  getSortParameter(sortType: string): string {
    switch(sortType) {
      case 'Fiyat: Artan': return 'price,asc';
      case 'Fiyat: Azalan': return 'price,desc';
      case 'En Yeniler': return 'createdDate,desc';
      case 'En Çok Değerlendirilen': return 'rating,desc';
      case 'En Popüler': return 'score,desc';
      default: return 'id,desc';
    }
  }

  // Görünüm değiştirildiğinde çalışacak
  onViewChange(viewType: 'grid' | 'list'): void {
    this.currentView = viewType;
    console.log('👁️ Görünüm değişti:', viewType);
    // TODO: Grid/List view toggle functionality
  }

  // Sepete ürün ekle
  addToCart(product: ProductIndex): void {
    // Login kontrolü
    if (!this.authService.isAuthenticated()) {
      alert('Sepete ürün eklemek için giriş yapmalısınız.');
      this.router.navigate(['/login']);
      return;
    }

    if (product.stock <= 0) {
      alert('Bu ürün stokta yok.');
      return;
    }

    this.cartService.addToCart(Number(product.id), 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Ürün sepete eklendi:', response);
          // Başarı mesajı göster
          alert(`"${product.name}" sepete eklendi!`);
        },
        error: (error) => {
          console.error('❌ Sepete ekleme hatası:', error);
          if (error.status === 401) {
            alert('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
            this.router.navigate(['/login']);
          } else {
            alert('Ürün sepete eklenirken hata oluştu.');
          }
        }
      });
  }
}
