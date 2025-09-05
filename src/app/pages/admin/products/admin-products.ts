import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../service/product.service';
import { Product } from '../../../model/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div class="admin-products">
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
    <table class="table">
      <thead>
        <tr>
          <th>Resim</th>
          <th>Ürün Adı</th>
          <th>Açıklama</th>
          <th>Fiyat</th>
          <th>Stok</th>
          <th>Kategori</th>
          <th>İşlemler</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let product of filteredProducts" class="product-row">
          <td>
            <img [src]="product.imageUrl" [alt]="product.name" class="product-image">
          </td>
          <td class="product-name">{{ product.name }}</td>
          <td class="product-description">{{ product.description }}</td>
          <td class="product-price">{{ product.price | currency:'TRY':'symbol-narrow':'1.2-2' }}</td>
          <td class="product-stock">
            <span class="stock-badge" [class.low-stock]="product.stock < 10">
              {{ product.stock }}
            </span>
          </td>
          <td class="product-category">{{ product.category?.name }}</td>
          <td class="product-actions">
            <button class="btn btn-sm btn-outline-primary me-1" (click)="openEditModal(product)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteProduct(product)">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty State -->
    <div class="empty-state" *ngIf="filteredProducts.length === 0 && !isLoading">
      <i class="fas fa-box-open"></i>
      <h4>Ürün bulunamadı</h4>
      <p>Arama kriterlerinize uygun ürün bulunamadı.</p>
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
</div>`,
  styles: [`/* Admin Products Container */
.admin-products {
  padding: 30px;
}

/* Page Header */
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

.page-header h2 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
}

/* Search Section */
.search-section {
  margin-bottom: 25px;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.search-box input {
  padding-left: 45px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Loading Spinner */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.loading-spinner i {
  font-size: 24px;
  color: #667eea;
  margin-right: 10px;
}

/* Products Table */
.products-table {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table {
  margin: 0;
}

.table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.table th {
  border: none;
  padding: 15px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.table td {
  padding: 15px;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

.product-row:hover {
  background-color: #f7fafc;
}

/* Product Image */
.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

/* Product Details */
.product-name {
  font-weight: 600;
  color: #2d3748;
}

.product-description {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #718096;
}

.product-price {
  font-weight: 600;
  color: #38a169;
  font-size: 16px;
}

/* Stock Badge */
.stock-badge {
  background: #48bb78;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.stock-badge.low-stock {
  background: #f56565;
}

.product-category {
  color: #667eea;
  font-weight: 500;
}

/* Product Actions */
.product-actions {
  white-space: nowrap;
}

.btn-sm {
  padding: 6px 12px;
  border-radius: 6px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 50px;
  color: #718096;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #e2e8f0;
}

.empty-state h4 {
  margin-bottom: 10px;
  color: #4a5568;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #718096;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f7fafc;
  color: #2d3748;
}

/* Modal Body */
.modal-body {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-products {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .table {
    font-size: 14px;
  }
  
  .product-description {
    max-width: 150px;
  }
}`]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  showAddModal: boolean = false;
  editingProduct: Product | null = null;

  newProduct: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    categoryId: 0
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProductsList().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.isLoading = false;
        console.log('Ürünler backend\'den başarıyla yüklendi:', products.length);
      },
      error: (error: any) => {
        console.error('Backend\'den ürünler yüklenirken hata:', error);
        this.products = [];
        this.filteredProducts = [];
        this.isLoading = false;
        alert('Ürünler yüklenirken hata oluştu. Backend bağlantısını kontrol edin.');
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
      categoryId: 0
    };
    this.editingProduct = null;
    this.showAddModal = true;
  }

  openEditModal(product: Product): void {
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
      // Update existing product
      this.productService.updateProduct(this.editingProduct.id, this.newProduct as Product).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
        },
        error: (error: any) => console.error('Error updating product:', error)
      });
    } else {
      // Create new product
      this.productService.createProduct(this.newProduct as Product).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
        },
        error: (error: any) => console.error('Error creating product:', error)
      });
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`"${product.name}" ürününü silmek istediğinize emin misiniz?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => this.loadProducts(),
        error: (error: any) => console.error('Error deleting product:', error)
      });
    }
  }
}
