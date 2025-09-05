import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { CategoryService } from '../../service/category.service';
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
export class CategoryPage implements OnInit {
  categoryId!: string;
  category: CategoryIndex | null = null;
  products: ProductIndex[] = [];
  loading = false;
  error: string | null = null;

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  // Sıralama ve görünüm seçenekleri
  currentSort = 'En Popüler';
  currentView = 'grid'; // 'grid' veya 'list'
  showSortDropdown = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.loadCategory();
      this.loadProducts();
    });
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

  loadProducts(page: number = 0): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductsByCategory(+this.categoryId, page, 12).subscribe({
      next: (response: Page<ProductIndex>) => {
        this.products = response.content;
        console.log('🔍 Kategori sayfasında ürünler:', this.products);
        console.log('🖼️ İlk ürünün imageUrl\'si:', this.products[0]?.imageUrl);
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Ürünler yüklenirken hata oluştu';
        this.loading = false;
        console.error('Error loading products:', error);
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
    // TODO: Backend'e sıralama parametresi gönderilecek
    // this.loadProducts(0); // Sıralama ile ürünleri yeniden yükle
  }

  // Görünüm değiştirildiğinde çalışacak
  onViewChange(viewType: 'grid' | 'list'): void {
    this.currentView = viewType;
    console.log('👁️ Görünüm değişti:', viewType);
    // TODO: Grid/List view toggle functionality
  }
}
