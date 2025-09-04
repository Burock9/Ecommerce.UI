import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../service/category.service';
import { CategoryIndex } from '../../model/category.model';
import { Page } from '../../model/response.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-categories-bar',
  standalone: true,
  imports: [CommonModule, RouterLink], // CommonModule'u önce yazdım
  templateUrl: './categories-bar.html',
  styleUrl: './categories-bar.css'
})
export class CategoriesBar implements OnInit {
  categories: CategoryIndex[] = [];
  loading = false;
  error: string | null = null;
  activeCategoryId: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.trackActiveCategory();
  }

  private trackActiveCategory(): void {
    // İlk yükleme için current route'u kontrol et
    this.updateActiveCategoryFromUrl(this.router.url);
    
    // Route değişikliklerini dinle
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveCategoryFromUrl(event.url);
    });
  }

  private updateActiveCategoryFromUrl(url: string): void {
    const categoryMatch = url.match(/\/categories\/(\d+)/);
    if (categoryMatch) {
      this.activeCategoryId = categoryMatch[1];
    } else {
      this.activeCategoryId = null;
    }
  }

  isActiveCategory(categoryId: string): boolean {
    return this.activeCategoryId === categoryId;
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    
    this.categoryService.getAllCategories(0, 10).subscribe({
      next: (response: Page<CategoryIndex>) => {
        this.categories = response.content;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Kategoriler yüklenirken hata oluştu';
        this.loading = false;
        console.error('Error loading categories:', error);
        // Hata durumunda mock kategoriler kullan
        this.loadMockCategories();
      }
    });
  }

  private loadMockCategories(): void {
    this.categories = [
      { id: '1', name: 'Elektronik', description: 'Elektronik ürünler' },
      { id: '2', name: 'Giyim', description: 'Giyim ürünleri' },
      { id: '3', name: 'Ev & Yaşam', description: 'Ev ürünleri' },
      { id: '4', name: 'Spor', description: 'Spor ürünleri' },
      { id: '5', name: 'Kitap', description: 'Kitaplar' }
    ];
    this.loading = false;
  }

  trackByCategory(index: number, category: CategoryIndex): string {
    return category.id;
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Elektronik': '📱',
      'Giyim': '👕',
      'Ev & Yaşam': '🏠',
      'Spor': '🏃‍♂️',
      'Kitap': '📚',
      'Oyun': '🎮',
      'Kozmetik': '💄',
      'Otomotiv': '🚗',
      'Müzik': '🎵',
      'Sağlık': '💊'
    };
    
    // Partial match için kategori adını kontrol et
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '🏷️'; // Default icon
  }
}
