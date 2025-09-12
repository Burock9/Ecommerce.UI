import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../service/product.service';
import { Product, ProductIndex } from '../../../model/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-products">
      <div class="layout-container">
        <div class="page-header">
          <h2><i class="fas fa-box me-2"></i>Ürün Yönetimi</h2>
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fas fa-plus me-1"></i>Yeni Ürün Ekle
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Ürün ara..." 
              [(ngModel)]="searchTerm" 
              (input)="searchProducts()">
          </div>
        </div>

        <!-- Loading -->
        <div class="loading-spinner" *ngIf="isLoading">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Ürünler yükleniyor...</span>
        </div>

        <!-- Products Table -->
        <div class="products-table" *ngIf="!isLoading">
          <div class="table-container">
            <!-- Header -->
            <div class="table-header">
              <div class="header-cell image-col">Resim</div>
              <div class="header-cell name-col">Ürün Adı</div>
              <div class="header-cell description-col">Açıklama</div>
              <div class="header-cell price-col">Fiyat</div>
              <div class="header-cell stock-col">Stok</div>
              <div class="header-cell category-col">Kategori</div>
              <div class="header-cell actions-col">İşlemler</div>
            </div>
            
            <!-- Rows -->
            <div class="table-row" *ngFor="let product of filteredProducts">
              <div class="table-cell image-col">
                <img [src]="product.imageUrl" [alt]="product.name" class="product-image">
              </div>
              <div class="table-cell name-col">{{ product.name }}</div>
              <div class="table-cell description-col">{{ product.description || 'Açıklama yok' }}</div>
              <div class="table-cell price-col">{{ product.price }}₺</div>
              <div class="table-cell stock-col">
                <span class="stock-badge" [class.low-stock]="product.stock < 10">
                  {{ product.stock }}
                </span>
              </div>
              <div class="table-cell category-col">{{ product.categoryName || 'Kategori yok' }}</div>
              <div class="table-cell actions-col">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline-primary me-1" 
                          (click)="openEditModal(product)"
                          title="Düzenle">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" 
                          (click)="deleteProduct(product)"
                          title="Sil">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="no-data" *ngIf="filteredProducts.length === 0 && !isLoading">
            <i class="fas fa-box-open fa-3x mb-3"></i>
            <h4>Ürün bulunamadı</h4>
            <p>Arama kriterlerinize uygun ürün bulunamadı.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle' }}</h3>
          <button class="close-btn" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form (ngSubmit)="saveProduct()">
            <div class="form-group">
              <label for="productName">Ürün Adı *</label>
              <input 
                id="productName"
                type="text" 
                class="form-control" 
                [(ngModel)]="newProduct.name" 
                name="name"
                required>
            </div>

            <div class="form-group">
              <label for="productDescription">Açıklama</label>
              <textarea 
                id="productDescription"
                class="form-control" 
                [(ngModel)]="newProduct.description" 
                name="description"
                rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="productPrice">Fiyat *</label>
                <input 
                  id="productPrice"
                  type="number" 
                  class="form-control" 
                  [(ngModel)]="newProduct.price" 
                  name="price"
                  min="0"
                  step="0.01"
                  required>
              </div>

              <div class="form-group">
                <label for="productStock">Stok *</label>
                <input 
                  id="productStock"
                  type="number" 
                  class="form-control" 
                  [(ngModel)]="newProduct.stock" 
                  name="stock"
                  min="0"
                  required>
              </div>
            </div>

            <div class="form-group">
              <label for="productImage">Ürün Resmi URL</label>
              <input 
                id="productImage"
                type="url" 
                class="form-control" 
                [(ngModel)]="newProduct.imageUrl" 
                name="imageUrl">
            </div>

            <div class="form-group">
              <label for="productCategory">Kategori ID *</label>
              <input 
                id="productCategory"
                type="number" 
                class="form-control" 
                [(ngModel)]="newProduct.categoryId" 
                name="categoryId"
                min="1"
                required>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                İptal
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingProduct ? 'Güncelle' : 'Ekle' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-products {
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
        rgba(100, 255, 218, 0.03) 0%, 
        rgba(79, 209, 199, 0.02) 50%, 
        rgba(45, 55, 72, 0.05) 100%);
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
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #64ffda;
      z-index: 2;
      font-size: 1rem;
    }

    .search-box input {
      padding: 14px 16px 14px 45px;
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(26, 32, 44, 0.9) 100%);
      border: 2px solid rgba(100, 255, 218, 0.2);
      border-radius: 12px;
      height: 48px;
      color: #e2e8f0;
      font-size: 14px;
      font-weight: 500;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      width: 100%;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .search-box input:focus {
      border-color: #64ffda;
      box-shadow: 0 0 0 0.2rem rgba(100, 255, 218, 0.2), 0 8px 25px rgba(0, 0, 0, 0.3);
      outline: none;
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
      transform: translateY(-1px);
    }

    .search-box input::placeholder {
      color: #a0aec0;
    }

    .loading-spinner {
      text-align: center;
      padding: 60px;
      color: #a0aec0;
    }

    .loading-spinner i {
      font-size: 2.5rem;
      margin-bottom: 16px;
      color: #64ffda;
      filter: drop-shadow(0 3px 12px rgba(100, 255, 218, 0.3));
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .products-table {
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
      border: 1px solid rgba(100, 255, 218, 0.15);
      border-radius: 16px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      backdrop-filter: blur(20px);
    }

    .table-container {
      display: grid;
      grid-template-columns: 70px 1fr 1fr 100px 80px 200px 150px;
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
      font-size: 13px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
    }

    .image-col {
      justify-content: center;
    }

    .name-col {
      justify-content: flex-start;
      font-weight: 600;
    }

    .description-col {
      justify-content: flex-start;
    }

    .price-col {
      justify-content: center;
      font-weight: 700;
      color: #64ffda;
    }

    .stock-col, .category-col, .actions-col {
      justify-content: center;
    }

    .product-image {
      width: 45px;
      height: 45px;
      object-fit: cover;
      border-radius: 10px;
      border: 2px solid rgba(100, 255, 218, 0.2);
      transition: all 0.3s ease;
    }

    .product-image:hover {
      transform: scale(1.1);
      border-color: #64ffda;
      box-shadow: 0 6px 20px rgba(100, 255, 218, 0.3);
    }

    .stock-badge {
      background: linear-gradient(135deg, #64ffda, #4fd1c7);
      color: #1a202c;
      padding: 5px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 3px 12px rgba(100, 255, 218, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stock-badge.low-stock {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .btn-sm {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 13px;
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

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }

    .modal-content {
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.98) 0%, rgba(26, 32, 44, 0.98) 100%);
      border: 1px solid rgba(100, 255, 218, 0.2);
      border-radius: 24px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(20px);
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30px;
      border-bottom: 1px solid rgba(100, 255, 218, 0.1);
    }

    .modal-header h3 {
      color: #f8fafc;
      margin: 0;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: #a0aec0;
      font-size: 1.5rem;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .close-btn:hover {
      color: #ef4444;
    }

    .modal-body {
      padding: 30px;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      display: block;
      color: #e2e8f0;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 15px;
    }

    .form-control {
      width: 100%;
      padding: 15px 18px;
      background: linear-gradient(135deg, rgba(26, 32, 44, 0.9) 0%, rgba(45, 55, 72, 0.9) 100%);
      border: 2px solid rgba(100, 255, 218, 0.2);
      border-radius: 12px;
      color: #f8fafc;
      font-size: 15px;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      border-color: #64ffda;
      box-shadow: 0 0 0 0.3rem rgba(100, 255, 218, 0.15);
      outline: none;
    }

    .form-control::placeholder {
      color: #a0aec0;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      padding-top: 30px;
      border-top: 1px solid rgba(100, 255, 218, 0.1);
    }

    .btn-secondary {
      background: linear-gradient(135deg, rgba(160, 174, 192, 0.2), rgba(113, 128, 150, 0.2));
      border: 2px solid rgba(160, 174, 192, 0.3);
      color: #a0aec0;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: rgba(160, 174, 192, 0.3);
      color: #f8fafc;
      transform: translateY(-2px);
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

    .products-table {
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
        grid-template-columns: 70px 1fr 1.5fr 100px 80px 100px 160px;
      }
    }

    @media (max-width: 992px) {
      .layout-container { gap: 28px; }
      .page-header { padding: 24px 26px; }
      .page-header h2 { font-size: 1.8rem; }
      .search-box input { height: 52px; }
      .table-container {
        grid-template-columns: 60px 1fr 1.2fr 90px 70px 90px 140px;
      }
      .table-cell { padding: 14px 12px; font-size: 13px; }
      .header-cell { padding: 14px 12px; font-size: 0.8rem; }
      .form-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .table-container {
        grid-template-columns: 50px 1fr 80px 80px 120px;
      }
      .description-col, .category-col { display: none; }
      .page-header { flex-direction: column; gap: 15px; align-items: stretch; }
      .page-header h2 { font-size: 1.55rem; }
    }

    @media (max-width: 600px) {
      .admin-products { padding: 30px 18px; }
      .table-container {
        grid-template-columns: 45px 1fr 70px 100px;
      }
      .stock-col { display: none; }
      .table-cell { padding: 12px 10px; font-size: 12px; }
      .header-cell { padding: 12px 10px; font-size: 0.75rem; }
      .btn-sm { width: 32px; height: 32px; }
      .stock-badge { padding: 4px 8px; font-size: 11px; }
      .modal-content { margin: 10px; }
      .modal-header, .modal-body { padding: 20px; }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: ProductIndex[] = [];
  filteredProducts: ProductIndex[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  showAddModal: boolean = false;
  editingProduct: ProductIndex | null = null;

  newProduct: Partial<ProductIndex> = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    categoryId: '0',
    categoryName: ''
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    console.log('Loading products from backend...');
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        console.log('✅ Products loaded successfully:', response.content.length);
        this.products = response.content;
        this.filteredProducts = response.content;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading products:', error);
        console.log('Backend URL:', 'http://localhost:8080/admin/products');
        console.log('Auth token:', localStorage.getItem('token') ? 'Available' : 'Missing');
        this.isLoading = false;
        
        // Hata durumunda örnek data göster
        this.products = [
          {
            id: '1',
            name: 'Örnek Ürün 1',
            description: 'Bu backend bağlantısı olmadığında gösterilen örnek üründür',
            price: 100,
            stock: 50,
            categoryId: '1',
            categoryName: 'Elektronik',
            imageUrl: 'https://via.placeholder.com/150'
          },
          {
            id: '2',
            name: 'Örnek Ürün 2',
            description: 'Backend bağlantısı kurulduğunda gerçek veriler gelecek',
            price: 200,
            stock: 0,
            categoryId: '2',
            categoryName: 'Giyim',
            imageUrl: 'https://via.placeholder.com/150'
          }
        ] as any;
        this.filteredProducts = this.products;
        
        // Alert yerine console warning
        console.warn('⚠️ Backend bağlantısı kurulamadı, örnek veriler gösteriliyor.');
      }
    });
  }

  searchProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = this.products;
      return;
    }

    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  openAddModal(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      categoryId: '0',
      categoryName: ''
    };
    this.editingProduct = null;
    this.showAddModal = true;
  }

  openEditModal(product: ProductIndex): void {
    this.newProduct = { ...product };
    this.editingProduct = product;
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingProduct = null;
  }

  saveProduct(): void {
    if (this.editingProduct) {
      // Convert ProductIndex to Product for backend API
      const productData: Product = {
        id: +this.editingProduct.id,
        name: this.newProduct.name || '',
        description: this.newProduct.description,
        price: this.newProduct.price || 0,
        stock: this.newProduct.stock || 0,
        imageUrl: this.newProduct.imageUrl,
        categoryId: +(this.newProduct.categoryId || '0')
      };
      
      this.productService.updateProduct(+this.editingProduct.id, productData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
        },
        error: (error: any) => console.error('Error updating product:', error)
      });
    } else {
      // Convert ProductIndex to Product for backend API  
      const productData: Product = {
        id: 0, // Will be assigned by backend
        name: this.newProduct.name || '',
        description: this.newProduct.description,
        price: this.newProduct.price || 0,
        stock: this.newProduct.stock || 0,
        imageUrl: this.newProduct.imageUrl,
        categoryId: +(this.newProduct.categoryId || '0')
      };
      
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
        },
        error: (error: any) => console.error('Error creating product:', error)
      });
    }
  }

  deleteProduct(product: ProductIndex): void {
    if (confirm(`"${product.name}" ürününü silmek istediğinize emin misiniz?`)) {
      this.productService.deleteProduct(+product.id).subscribe({
        next: () => this.loadProducts(),
        error: (error: any) => console.error('Error deleting product:', error)
      });
    }
  }
}
