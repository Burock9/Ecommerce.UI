import { Component, OnInit } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

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

  getPlaceholderImage(categoryName: string): string {
    const placeholderMap: { [key: string]: string } = {
      /*'Elektronik': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
      'Giyim': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
      'Ev & Yaşam': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      'Spor': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      'Kitap': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
      'Oyun': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=300&fit=crop',
      'Kozmetik': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop'*/
    };
    
    // Partial match için kategori adını kontrol et
    for (const [key, image] of Object.entries(placeholderMap)) {
      if (categoryName?.toLowerCase().includes(key.toLowerCase())) {
        return image;
      }
    }
    
    return 'https://lh5.googleusercontent.com/proxy/WyXx9KnsCHldAEhrQAeET9MHD8dkD--jYAGTDux22ROO_tw1yrv8mXeZoEOtHF5jDh328MI6mwxTvToTyJGOfrzqT4-E'; // Ürün görseli hazırlanıyor
  }
}
