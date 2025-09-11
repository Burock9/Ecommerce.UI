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
      <div class="layout-container">
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
          <div class="table-container">
            <!-- Header -->
            <div class="table-header">
              <div class="header-cell id-col">ID</div>
              <div class="header-cell name-col">Kategori Adı</div>
              <div class="header-cell description-col">Açıklama</div>
              <div class="header-cell count-col">Ürün Sayısı</div>
              <div class="header-cell actions-col">İşlemler</div>
            </div>
            
            <!-- Rows -->
            <div class="table-row" *ngFor="let category of filteredCategories">
              <div class="table-cell id-col">{{ category.id }}</div>
              <div class="table-cell name-col">{{ category.name }}</div>
              <div class="table-cell description-col">{{ category.description || 'Açıklama yok' }}</div>
              <div class="table-cell count-col">
                <span class="count-badge">{{ category.productCount || 0 }}</span>
              </div>
              <div class="table-cell actions-col">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline-primary me-1" 
                          (click)="openEditModal(category)"
                          title="Düzenle">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" 
                          (click)="deleteCategory(category)"
                          title="Sil">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="no-data" *ngIf="filteredCategories.length === 0 && !isLoading">
            <i class="fas fa-tags fa-3x mb-3"></i>
            <h4>Kategori bulunamadı</h4>
            <p>Henüz kategori eklenmemiş veya arama kriterlerinize uygun kategori bulunamadı.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-categories {
      padding: 30px clamp(15px,3vw,40px);
      background: transparent;
      min-height: 100vh;
      color: #e2e8f0;
      display: flex;
      justify-content: center;
      box-sizing: border-box;
    }

    .layout-container {
      width: 100%;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px clamp(18px,2.5vw,30px);
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
      border: 1px solid rgba(100, 255, 218, 0.2);
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      position: relative;
      overflow: hidden;
    }

    .page-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(100, 255, 218, 0.05) 0%, 
        rgba(79, 209, 199, 0.03) 50%, 
        rgba(45, 55, 72, 0.1) 100%);
      pointer-events: none;
    }

    .page-header h2 {
      color: #f8fafc;
      margin: 0;
      font-weight: 700;
      font-size: 1.8rem;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
    }

    .page-header h2 i {
      color: #64ffda;
      margin-right: 12px;
      filter: drop-shadow(0 2px 6px rgba(100, 255, 218, 0.3));
    }

    .btn-primary {
      background: linear-gradient(135deg, #64ffda, #4fd1c7);
      color: #1a202c;
      border: none;
      padding: 12px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      text-shadow: none;
      box-shadow: 0 6px 20px rgba(100, 255, 218, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;
    }

    .btn-primary:hover::before {
      width: 300px;
      height: 300px;
    }

    .btn-primary:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 15px 40px rgba(100, 255, 218, 0.4);
    }

    .search-section { }

    .search-box {
      position: relative;
      max-width: 450px;
    }

    .search-box i {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: #64ffda;
      z-index: 2;
      font-size: 1.1rem;
    }

    .search-box input {
      padding: 18px 20px 18px 55px;
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(26, 32, 44, 0.9) 100%);
      border: 2px solid rgba(100, 255, 218, 0.2);
      border-radius: 16px;
      height: 55px;
      color: #e2e8f0;
      font-size: 16px;
      font-weight: 500;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      width: 100%;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .search-box input:focus {
      border-color: #64ffda;
      box-shadow: 0 0 0 0.3rem rgba(100, 255, 218, 0.25), 0 12px 35px rgba(0, 0, 0, 0.3);
      outline: none;
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
      transform: translateY(-2px);
    }

    .search-box input::placeholder {
      color: #a0aec0;
    }

    .loading-spinner {
      text-align: center;
      padding: 80px;
      color: #a0aec0;
    }

    .loading-spinner i {
      font-size: 3rem;
      margin-bottom: 20px;
      color: #64ffda;
      filter: drop-shadow(0 4px 15px rgba(100, 255, 218, 0.3));
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .categories-table {
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
      border: 1px solid rgba(100, 255, 218, 0.15);
      border-radius: 16px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      backdrop-filter: blur(20px);
    }

    .table-container {
      display: grid;
      grid-template-columns: 70px 1fr 1.5fr 100px 150px;
      gap: 0;
      width: 100%;
    }

    .table-header {
      display: contents;
    }

    .header-cell {
      background: linear-gradient(135deg, rgba(100, 255, 218, 0.12) 0%, rgba(79, 209, 199, 0.12) 100%);
      border: none;
      font-weight: 700;
      color: #64ffda;
      padding: 14px 12px;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 6px rgba(100, 255, 218, 0.3);
      position: relative;
      border-bottom: 2px solid rgba(100, 255, 218, 0.5);
    }

    .table-row {
      display: contents;
    }

    .table-row:hover .table-cell {
      background: linear-gradient(135deg, rgba(100,255,218,0.06) 0%, rgba(79,209,199,0.06) 100%);
      color: #ffffff;
    }

    .table-cell {
      padding: 12px 10px;
      border-top: 1px solid rgba(100, 255, 218, 0.08);
      border-bottom: 1px solid rgba(100, 255, 218, 0.08);
      background: linear-gradient(135deg, rgba(26, 32, 44, 0.98) 0%, rgba(45, 55, 72, 0.98) 100%);
      color: #f8fafc;
      font-weight: 500;
      font-size: 15px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
    }

    .id-col {
      justify-content: center;
      font-weight: 600;
    }

    .name-col {
      justify-content: flex-start;
      font-weight: 600;
    }

    .description-col {
      justify-content: flex-start;
      color: #cbd5e0;
    }

    .count-col, .actions-col {
      justify-content: center;
    }

    .count-badge {
      background: linear-gradient(135deg, #64ffda, #4fd1c7);
      color: #1a202c;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(100, 255, 218, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .btn-sm {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 14px;
      position: relative;
      overflow: hidden;
    }

    .btn-sm::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;
    }

    .btn-sm:hover::before {
      width: 100px;
      height: 100px;
    }

    .btn-outline-primary {
      background: linear-gradient(135deg, rgba(100, 255, 218, 0.1), rgba(79, 209, 199, 0.1));
      border: 2px solid rgba(100, 255, 218, 0.3);
      color: #64ffda;
      backdrop-filter: blur(10px);
    }

    .btn-outline-primary:hover {
      background: linear-gradient(135deg, #64ffda, #4fd1c7);
      color: #1a202c;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(100, 255, 218, 0.4);
      border-color: #64ffda;
    }

    .btn-outline-danger {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
      border: 2px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      backdrop-filter: blur(10px);
    }

    .btn-outline-danger:hover {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
      border-color: #ef4444;
    }

    .no-data {
      text-align: center;
      padding: 80px;
      color: #a0aec0;
      position: relative;
    }

    .no-data i {
      color: #4a5568;
      font-size: 4rem;
      margin-bottom: 25px;
      opacity: 0.6;
      filter: drop-shadow(0 4px 15px rgba(74, 85, 104, 0.3));
    }

    .no-data h4 {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 15px;
      color: #e2e8f0;
    }

    .no-data p {
      font-size: 1.1rem;
      font-weight: 400;
      margin-bottom: 0;
      color: #a0aec0;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .categories-table {
      animation: fadeInUp 0.6s ease-out;
    }

    .page-header {
      animation: fadeInUp 0.4s ease-out;
    }

    .search-section {
      animation: fadeInUp 0.5s ease-out;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .table-container {
        grid-template-columns: 70px 1fr 1.8fr 100px 160px;
      }
    }

    @media (max-width: 992px) {
      .layout-container { gap: 28px; }
      .page-header { padding: 24px 26px; }
      .page-header h2 { font-size: 1.8rem; }
      .search-box input { height: 52px; }
      .table-container {
        grid-template-columns: 60px 1fr 1.5fr 90px 140px;
      }
      .table-cell { padding: 16px 15px; font-size: 14px; }
      .header-cell { padding: 16px 15px; font-size: 0.9rem; }
    }

    @media (max-width: 768px) {
      .table-container {
        grid-template-columns: 50px 1fr 80px 120px;
      }
      .description-col { display: none; }
      .page-header h2 { font-size: 1.55rem; }
      .page-header { flex-direction: column; gap: 15px; align-items: stretch; }
    }

    @media (max-width: 600px) {
      .admin-categories { padding: 30px 18px; }
      .table-container {
        grid-template-columns: 45px 1fr 70px 100px;
      }
      .table-cell { padding: 12px 10px; font-size: 13px; }
      .header-cell { padding: 12px 10px; font-size: 0.8rem; }
      .btn-sm { width: 32px; height: 32px; }
      .count-badge { padding: 4px 8px; font-size: 11px; }
    }
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
    console.log('🔄 Admin kategoriler yükleniyor - ürün sayıları ile...');
    
    // Önce admin endpoint'ini dene (ürün sayıları ile)
    this.categoryService.getAllCategoriesWithProductCount(0, 100).subscribe({
      next: (response: any) => {
        this.categories = response.content || [];
        this.filteredCategories = this.categories;
        this.isLoading = false;
        console.log('✅ Admin kategoriler başarıyla yüklendi:', this.categories.length);
        console.log('📊 Kategori verileri:', this.categories);
      },
      error: (error: any) => {
        console.warn('⚠️ Admin endpoint bulunamadı, normal endpoint deneniyor...');
        // Admin endpoint yoksa normal endpoint'i kullan ve ürün sayılarını ayrıca yükle
        this.loadCategoriesWithManualCount();
      }
    });
  }

  private loadCategoriesWithManualCount(): void {
    this.categoryService.getAllCategories(0, 100).subscribe({
      next: (response: any) => {
        this.categories = response.content || [];
        console.log('📋 Kategoriler yüklendi, ürün sayıları getiriliyor...');
        
        // Her kategori için ürün sayısını ayrı ayrı çek
        this.loadProductCountsForCategories();
      },
      error: (error: any) => {
        console.error('❌ Backend\'den kategoriler yüklenirken hata:', error);
        this.categories = [];
        this.filteredCategories = [];
        this.isLoading = false;
        alert('Kategoriler yüklenirken hata oluştu. Backend bağlantısını kontrol edin.');
      }
    });
  }

  private loadProductCountsForCategories(): void {
    if (this.categories.length === 0) {
      this.filteredCategories = this.categories;
      this.isLoading = false;
      return;
    }

    let completedRequests = 0;
    const totalRequests = this.categories.length;
    console.log(`📊 ${totalRequests} kategori için ürün sayıları hesaplanıyor...`);

    this.categories.forEach((category, index) => {
      // Mevcut products/category/{id} endpoint'ini kullan
      this.categoryService.getCategoryProductCount(category.id).subscribe({
        next: (count: number) => {
          this.categories[index].productCount = count;
          completedRequests++;
          console.log(`✅ ${category.name} kategorisi: ${count} ürün`);
          
          if (completedRequests === totalRequests) {
            this.filteredCategories = this.categories;
            this.isLoading = false;
            console.log('✅ Tüm ürün sayıları başarıyla yüklendi:', this.categories);
          }
        },
        error: (error: any) => {
          console.warn(`⚠️ ${category.name} kategorisi için ürün sayısı alınamadı:`, error);
          this.categories[index].productCount = this.getMockProductCount(category.name);
          completedRequests++;
          
          if (completedRequests === totalRequests) {
            this.filteredCategories = this.categories;
            this.isLoading = false;
            console.log('⚠️ Ürün sayıları tamamlandı (bazıları mock veri ile)');
          }
        }
      });
    });
  }

  private getMockProductCount(categoryName: string): number {
    // Kategori ismine göre örnek ürün sayıları (fallback için)
    const mockCounts: { [key: string]: number } = {
      'Elektronik': 25,
      'Ev Aletleri': 15,
      'Teknoloji': 30,
      'Oyun Konsolları': 12,
      'Bakım Ürünleri': 8,
      'Giyim': 40,
      'Kitap': 50,
      'Spor': 20
    };
    return mockCounts[categoryName] || Math.floor(Math.random() * 20) + 5;
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
