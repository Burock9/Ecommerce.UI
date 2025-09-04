import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { CategoryService } from '../../service/category.service';
import { ProductIndex } from '../../model/product.model';
import { CategoryIndex } from '../../model/category.model';
import { Page } from '../../model/response.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  // Backend'den gelecek ürünler
  products: ProductIndex[] = [];
  loading = false;
  error: string | null = null;

  // Backend'den gelecek kategoriler
  categories: CategoryIndex[] = [];
  categoriesLoading = false;
  categoriesError: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    
    this.productService.getAllProducts(0, 8).subscribe({
      next: (response: Page<ProductIndex>) => {
        this.products = response.content;
        console.log('🔍 Backend\'ten gelen ürünler:', this.products);
        console.log('🖼️ İlk ürünün imageUrl\'si:', this.products[0]?.imageUrl);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Ürünler yüklenirken hata oluştu';
        this.loading = false;
        console.error('Error loading products:', error);
        // Hata durumunda mockData'yı kullan
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    // Backend bağlantısı olmadığında mock data kullan
    this.featuredProducts = this.featuredProducts; // Mevcut mock data
    this.loading = false;
  }

  loadCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = null;
    
    this.categoryService.getAllCategories(0, 10).subscribe({
      next: (response: Page<CategoryIndex>) => {
        this.categories = response.content;
        console.log('🏷️ Backend\'ten gelen kategoriler:', this.categories);
        this.categoriesLoading = false;
      },
      error: (error) => {
        this.categoriesError = 'Kategoriler yüklenirken hata oluştu';
        this.categoriesLoading = false;
        console.error('Error loading categories:', error);
        // Hata durumunda mock kategoriler kullan
        this.loadMockCategories();
      }
    });
  }

  private loadMockCategories(): void {
    // Backend bağlantısı olmadığında mock kategoriler
    this.categories = [
      { id: '1', name: 'Elektronik', description: 'Son teknoloji ürünler' },
      { id: '2', name: 'Giyim', description: 'Trendy kıyafetler' },
      { id: '3', name: 'Ev Aletleri', description: 'Ev dekorasyonu' },
      { id: '4', name: 'Spor', description: 'Spor ürünleri' },
      { id: '5', name: 'Kitap', description: 'Kitaplar' },
      { id: '6', name: 'Oyun', description: 'Oyun ürünleri' }
    ];
    this.categoriesLoading = false;
  }

  // Kategori kartına tıklandığında çalışacak fonksiyon
  onCategoryClick(category: CategoryIndex): void {
    this.router.navigate(['/categories', category.id]);
  }

  // Kategori ikonunu dinamik olarak getir
  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Elektronik': '📱',
      'Giyim': '👕', 
      'Ev Aletleri': '🏠',
      'Spor': '🏃‍♂️',
      'Kitap': '📚',
      'Oyun': '🎮',
      'Kozmetik': '💄',
      'Otomotiv': '🚗',
      'Müzik': '🎵',
      'Sağlık': '�'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '🏷️'; // Default icon
  }

  // Kategori rengini dinamik olarak getir
  getCategoryColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #e862ecff 0%, #8485d1ff 100%)'

    ];
    
    return colors[index % colors.length];
  }

  featuredProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      description: 'En yeni Apple teknolojisi',
      price: 45999,
      originalPrice: 49999,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      badge: 'YENİ',
      badgeColor: 'success',
      rating: 4.8,
      reviewCount: 128
    },
    {
      id: 2,
      name: 'Nike Air Max 270',
      description: 'Konforlu ve şık spor ayakkabı',
      price: 1299,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      badge: 'İNDİRİM',
      badgeColor: 'danger',
      rating: 4.6,
      reviewCount: 89
    },
    {
      id: 3,
      name: 'MacBook Air M2',
      description: 'Güçlü performans, hafif tasarım',
      price: 24999,
      originalPrice: 26999,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
      badge: 'POPÜLER',
      badgeColor: 'warning',
      rating: 4.9,
      reviewCount: 245
    },
    {
      id: 4,
      name: 'Sony WH-1000XM4',
      description: 'Noise cancelling kulaklık',
      price: 2499,
      originalPrice: 2899,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
      badge: 'EN ÇOK SATAN',
      badgeColor: 'primary',
      rating: 4.7,
      reviewCount: 167
    }
  ];
}
