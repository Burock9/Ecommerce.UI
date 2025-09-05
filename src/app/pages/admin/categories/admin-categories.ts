import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../service/category.service';
import { CategoryIndex } from '../../../model/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-categories">
      <div class="page-header">
        <h2><i class="fas fa-tags me-2"></i>Kategori Yönetimi</h2>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="fas fa-plus me-1"></i>Yeni Kategori Ekle
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Kategori ara..." 
            [(ngModel)]="searchTerm" 
            (input)="searchCategories()">
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-spinner" *ngIf="isLoading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Kategoriler yükleniyor...</span>
      </div>

      <!-- Categories Table -->
      <div class="categories-table" *ngIf="!isLoading">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kategori Adı</th>
              <th>Açıklama</th>
              <th>Ürün Sayısı</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of filteredCategories" class="category-row">
              <td>{{ category.id }}</td>
              <td class="category-name">{{ category.name }}</td>
              <td class="category-description">{{ category.description || 'Açıklama yok' }}</td>
              <td class="product-count">
                <span class="count-badge">{{ category.productCount || 0 }}</span>
              </td>
              <td class="category-actions">
                <button class="btn btn-sm btn-outline-primary me-1" (click)="openEditModal(category)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteCategory(category)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredCategories.length === 0 && !isLoading">
          <i class="fas fa-tags"></i>
          <h4>Kategori bulunamadı</h4>
          <p>Henüz kategori eklenmemiş veya arama kriterlerinize uygun kategori bulunamadı.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-categories { padding: 30px; }
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 30px; 
      padding: 20px; 
      background: white; 
      border-radius: 15px; 
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); 
    }
    .page-header h2 { margin: 0; color: #2d3748; font-weight: 600; }
    .search-section { margin-bottom: 25px; }
    .search-box { position: relative; max-width: 400px; }
    .search-box i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #718096; }
    .search-box input { padding-left: 45px; border-radius: 10px; border: 2px solid #e2e8f0; transition: all 0.3s ease; }
    .search-box input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .loading-spinner { display: flex; align-items: center; justify-content: center; padding: 50px; background: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); }
    .loading-spinner i { font-size: 24px; color: #667eea; margin-right: 10px; }
    .categories-table { background: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); overflow: hidden; }
    .table { margin: 0; }
    .table thead { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .table th { border: none; padding: 15px; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
    .table td { padding: 15px; vertical-align: middle; border-bottom: 1px solid #e2e8f0; }
    .category-row:hover { background-color: #f7fafc; }
    .category-name { font-weight: 600; color: #2d3748; }
    .category-description { color: #718096; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .count-badge { background: #48bb78; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .category-actions { white-space: nowrap; }
    .btn-sm { padding: 6px 12px; border-radius: 6px; }
    .empty-state { text-align: center; padding: 50px; color: #718096; }
    .empty-state i { font-size: 64px; margin-bottom: 20px; color: #e2e8f0; }
    .empty-state h4 { margin-bottom: 10px; color: #4a5568; }
    .btn { padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3); }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  categories: CategoryIndex[] = [];
  filteredCategories: CategoryIndex[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories(0, 100).subscribe({
      next: (response: any) => {
        this.categories = response.content || [];
        this.filteredCategories = this.categories;
        this.isLoading = false;
        console.log('Kategoriler backend\'den başarıyla yüklendi:', this.categories.length);
      },
      error: (error: any) => {
        console.error('Backend\'den kategoriler yüklenirken hata:', error);
        this.categories = [];
        this.filteredCategories = [];
        this.isLoading = false;
        alert('Kategoriler yüklenirken hata oluştu. Backend bağlantısını kontrol edin.');
      }
    });
  }

  searchCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = this.categories;
      return;
    }

    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  openAddModal(): void {
    console.log('Add category modal - not implemented yet');
  }

  openEditModal(category: CategoryIndex): void {
    console.log('Edit category modal - not implemented yet:', category);
  }

  deleteCategory(category: CategoryIndex): void {
    if (confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)) {
      console.log('Delete category - not implemented yet:', category);
    }
  }
}
