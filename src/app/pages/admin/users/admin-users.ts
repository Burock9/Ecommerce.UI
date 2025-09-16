import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../service/user.service';
import { User } from '../../../model/auth.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users">
      <div class="layout-container">
        <div class="page-header">
          <h2><i class="fas fa-users me-2"></i>Kullanıcı Yönetimi</h2>
        </div>

        <!-- Search Bar -->
        <div class="search-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Kullanıcı ara..." 
              [(ngModel)]="searchTerm" 
              (input)="searchUsers()">
          </div>
        </div>

        <!-- Loading -->
        <div class="loading-spinner" *ngIf="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Kullanıcılar yükleniyor...</span>
        </div>

        <!-- Users Table -->
        <div class="users-table" *ngIf="!loading">
          <div class="table-container">
            <!-- Header -->
            <div class="table-header">
              <div class="header-cell id-col">ID</div>
              <div class="header-cell username-col">Kullanıcı Adı</div>
              <div class="header-cell email-col">E-posta</div>
              <div class="header-cell roles-col">Roller</div>
              <div class="header-cell actions-col">İşlemler</div>
            </div>
            
            <!-- Rows -->
            <div class="table-row" *ngFor="let user of users">
              <div class="table-cell id-col">{{ user.id }}</div>
              <div class="table-cell username-col">{{ user.username }}</div>
              <div class="table-cell email-col">{{ user.email }}</div>
              <div class="table-cell roles-col">
                <div class="role-icon" 
                     [class]="isAdmin(user.roles) ? 'admin-role' : 'user-role'"
                     [title]="getRoleDisplay(user.roles)">
                  <i class="fas" [ngClass]="isAdmin(user.roles) ? 'fa-crown' : 'fa-user'"></i>
                </div>
              </div>
              <div class="table-cell actions-col">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline-primary me-1" 
                          [disabled]="isCurrentUser(user.id)"
                          [title]="isCurrentUser(user.id) ? 'Kendi hesabınızı düzenleyemezsiniz' : 'Düzenle'"
                          (click)="openEditModal(user)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" 
                          [disabled]="isCurrentUser(user.id)"
                          [title]="isCurrentUser(user.id) ? 'Kendi hesabınızı silemezsiniz' : 'Sil'"
                          (click)="deleteUser(user.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="users.length === 0" class="no-data">
            <i class="fas fa-users fa-3x mb-3"></i>
            <p>Henüz kullanıcı bulunmuyor.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal-overlay" *ngIf="showEditModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>
            <i class="fas fa-user-edit me-2"></i>
            Kullanıcı Düzenle
          </h3>
          <button class="close-btn" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form (ngSubmit)="saveUser()" #userForm="ngForm">
            <div class="form-group">
              <label for="username">Kullanıcı Adı *</label>
              <input 
                id="username"
                type="text" 
                class="form-control" 
                [(ngModel)]="editingUser.username" 
                name="username"
                #usernameField="ngModel"
                required
                minlength="3">
              <div *ngIf="usernameField.invalid && usernameField.touched" class="error-message">
                Kullanıcı adı en az 3 karakter olmalıdır
              </div>
            </div>

            <div class="form-group">
              <label for="email">E-posta *</label>
              <input 
                id="email"
                type="email" 
                class="form-control" 
                [(ngModel)]="editingUser.email" 
                name="email"
                #emailField="ngModel"
                required
                email>
              <div *ngIf="emailField.invalid && emailField.touched" class="error-message">
                Geçerli bir e-posta adresi giriniz
              </div>
            </div>

            <div class="form-group">
              <label for="password">Yeni Şifre (opsiyonel)</label>
              <input 
                id="password"
                type="password" 
                class="form-control" 
                [(ngModel)]="editingUser.password" 
                name="password"
                #passwordField="ngModel"
                minlength="6">
              <div *ngIf="passwordField.invalid && passwordField.touched" class="error-message">
                Şifre en az 6 karakter olmalıdır
              </div>
              <small class="form-text">Boş bırakırsanız mevcut şifre korunur</small>
            </div>

            <div class="form-group">
              <label>Roller *</label>
              <div class="role-checkboxes">
                <div class="role-checkbox">
                  <input 
                    type="checkbox" 
                    id="role-user"
                    [(ngModel)]="editingUser.hasUserRole"
                    name="hasUserRole"
                    #userRoleField="ngModel">
                  <label for="role-user" class="role-label user-role">
                    <i class="fas fa-user me-2"></i>
                    Kullanıcı
                  </label>
                </div>
                <div class="role-checkbox">
                  <input 
                    type="checkbox" 
                    id="role-admin"
                    [(ngModel)]="editingUser.hasAdminRole"
                    name="hasAdminRole"
                    #adminRoleField="ngModel">
                  <label for="role-admin" class="role-label admin-role">
                    <i class="fas fa-crown me-2"></i>
                    Yönetici
                  </label>
                </div>
              </div>
              <div *ngIf="!editingUser.hasUserRole && !editingUser.hasAdminRole" class="error-message">
                En az bir rol seçilmelidir
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                İptal
              </button>
              <button type="submit" class="btn btn-primary" 
                      [disabled]="userForm.invalid || (!editingUser.hasUserRole && !editingUser.hasAdminRole)">
                <i class="fas fa-save me-1"></i>
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-users {
      padding: 40px clamp(20px,4vw,60px);
      background: transparent;
      min-height: 100vh;
      color: #e2e8f0;
      display: flex;
      justify-content: center;
      box-sizing: border-box;
    }

    .layout-container {
      width: 100%;
      max-width: 1400px;
      display: flex;
      flex-direction: column;
      gap: 35px;
    }

    .page-header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 30px clamp(24px,3vw,40px);
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
      border: 1px solid rgba(100, 255, 218, 0.2);
      border-radius: 20px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
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
      font-size: 2.2rem;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
    }

    .page-header h2 i {
      color: #64ffda;
      margin-right: 15px;
      filter: drop-shadow(0 2px 8px rgba(100, 255, 218, 0.3));
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

    .users-table {
      background: linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 55, 72, 0.95) 100%);
      border: 1px solid rgba(100, 255, 218, 0.15);
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      backdrop-filter: blur(20px);
      position: relative;
    }

    .users-table::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(100, 255, 218, 0.02) 0%, 
        rgba(79, 209, 199, 0.01) 50%, 
        rgba(26, 32, 44, 0.05) 100%);
      pointer-events: none;
    }
    .users-table {
      background: linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
      border: 1px solid rgba(100, 255, 218, 0.15);
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      backdrop-filter: blur(20px);
    }

    /* Eski table CSS'leri kaldırıldı - CSS Grid kullanımına geçildi */

    .table-container {
      display: grid;
      grid-template-columns: 80px 1fr 1fr 0.5fr 180px;
      gap: 0;
      width: 100%;
    }

    .table-header {
      display: contents;
    }

    .header-cell {
      background: linear-gradient(135deg, rgba(100, 255, 218, 0.15) 0%, rgba(79, 209, 199, 0.15) 100%);
      border: none;
      font-weight: 700;
      color: #64ffda;
      padding: 18px 20px;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 8px rgba(100, 255, 218, 0.3);
      position: relative;
      border-bottom: 2px solid rgba(100, 255, 218, 0.6);
    }

    .table-row {
      display: contents;
    }

    .table-row:hover .table-cell {
      background: linear-gradient(135deg, rgba(100,255,218,0.06) 0%, rgba(79,209,199,0.06) 100%);
      color: #ffffff;
    }

    .table-cell {
      padding: 18px 20px;
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

    .username-col, .email-col {
      justify-content: flex-start;
    }

    .roles-col, .actions-col {
      justify-content: center;
    }

    @media (max-width: 1200px) {
      .table-container {
        grid-template-columns: 70px 1fr 1.8fr 140px 160px;
      }
    }

    @media (max-width: 992px) {
      .layout-container { gap: 28px; }
      .page-header { padding: 24px 26px; }
      .page-header h2 { font-size: 1.8rem; }
      .search-box input { height: 52px; }
      .table-container {
        grid-template-columns: 60px 1fr 1.5fr 120px 140px;
      }
      .table-cell { padding: 16px 15px; font-size: 14px; }
      .header-cell { padding: 16px 15px; font-size: 0.9rem; }
    }

    @media (max-width: 768px) {
      .table-container {
        grid-template-columns: 50px 1fr 120px 120px;
      }
      .email-col { display: none; }
      .page-header h2 { font-size: 1.55rem; }
    }

    @media (max-width: 600px) {
      .admin-users { padding: 30px 18px; }
      .table-container {
        grid-template-columns: 45px 1fr 100px 100px;
      }
      .table-cell { padding: 12px 10px; font-size: 13px; }
      .header-cell { padding: 12px 10px; font-size: 0.8rem; }
      .btn-sm { width: 32px; height: 32px; }
      .role-icon { width: 32px; height: 32px; font-size: 14px; }
    }

    /* Hover efekti CSS Grid ile halloldu */

    .role-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .role-icon::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .role-icon:hover::before {
      opacity: 1;
    }

    .role-icon:hover {
      transform: scale(1.1);
    }

    .admin-role {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #ffd700;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    }

    .admin-role:hover {
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
    }

    .user-role {
      background: linear-gradient(135deg, #64ffda, #4fd1c7);
      color: #1a202c;
      box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
    }

    .user-role:hover {
      box-shadow: 0 6px 20px rgba(100, 255, 218, 0.6);
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

    .no-data p {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 0;
    }

    /* Subtle animations */
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

    .users-table {
      animation: fadeInUp 0.6s ease-out;
    }

    .page-header {
      animation: fadeInUp 0.4s ease-out;
    }

    .search-section {
      animation: fadeInUp 0.5s ease-out;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
      background: linear-gradient(145deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 55, 72, 0.95) 100%);
      border: 2px solid rgba(100, 255, 218, 0.2);
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideUp 0.4s ease-out;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 25px 30px;
      border-bottom: 1px solid rgba(100, 255, 218, 0.2);
      background: linear-gradient(135deg, rgba(100, 255, 218, 0.05) 0%, transparent 100%);
    }

    .modal-header h3 {
      margin: 0;
      color: #64ffda;
      font-size: 22px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .close-btn {
      background: none;
      border: none;
      color: #a0aec0;
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      color: #64ffda;
      background: rgba(100, 255, 218, 0.1);
      transform: rotate(90deg);
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
      font-weight: 500;
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
      box-sizing: border-box;
    }

    .form-control:focus {
      border-color: #64ffda;
      box-shadow: 0 0 0 0.3rem rgba(100, 255, 218, 0.15);
      outline: none;
    }

    .form-text {
      color: #a0aec0;
      font-size: 13px;
      margin-top: 8px;
      font-style: italic;
    }

    .error-message {
      color: #fc8181;
      font-size: 13px;
      margin-top: 8px;
      padding-left: 4px;
    }

    .role-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .role-checkbox {
      display: flex;
      align-items: center;
      position: relative;
    }

    .role-checkbox input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      appearance: none;
      border: 2px solid rgba(100, 255, 218, 0.3);
      border-radius: 6px;
      background: rgba(26, 32, 44, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .role-checkbox input[type="checkbox"]:checked {
      background: #64ffda;
      border-color: #64ffda;
    }

    .role-checkbox input[type="checkbox"]:checked::after {
      content: '✓';
      position: absolute;
      left: 3px;
      top: 2px;
      color: #1a202c;
      font-size: 14px;
      font-weight: bold;
    }

    .role-label {
      color: #e2e8f0;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: color 0.3s ease;
      user-select: none;
    }

    .role-label:hover {
      color: #64ffda;
    }

    .role-label.user-role i {
      color: #4fd1c7;
    }

    .role-label.admin-role i {
      color: #ffc107;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(100, 255, 218, 0.1);
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .btn-secondary {
      background: rgba(160, 174, 192, 0.2);
      color: #a0aec0;
      border: 2px solid rgba(160, 174, 192, 0.3);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(160, 174, 192, 0.3);
      color: #e2e8f0;
      border-color: rgba(160, 174, 192, 0.5);
      transform: translateY(-2px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%);
      color: #1a202c;
      border: 2px solid #64ffda;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #4fd1c7 0%, #38b2ac 100%);
      border-color: #4fd1c7;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(100, 255, 218, 0.3);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    /* Disabled action buttons */
    .action-buttons .btn:disabled {
      opacity: 0.3;
      pointer-events: none;
    }

    .action-buttons .btn:disabled i {
      color: #718096;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(30px) scale(0.95);
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  
  // Modal properties
  showEditModal: boolean = false;
  editingUser: any = {
    id: null,
    username: '',
    email: '',
    password: '',
    hasUserRole: false,
    hasAdminRole: false
  };

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    console.log('Loading users from backend...');
    console.log('API URL:', 'http://localhost:8080/admin/users');
    console.log('Auth token available:', localStorage.getItem('token') ? 'Yes' : 'No');
    
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('✅ Users loaded successfully:', response);
        console.log('📊 Response type:', typeof response);
        console.log('📋 Response keys:', Object.keys(response || {}));
        
        // Backend Spring Boot Page<User> formatını handle et
        if (response && typeof response === 'object') {
          if ('content' in response) {
            // Page<User> formatı
            this.users = (response as any).content || [];
            console.log('📄 Found content array with', this.users.length, 'users');
          } else if (Array.isArray(response)) {
            // Direkt array
            this.users = response;
            console.log('📄 Direct array with', this.users.length, 'users');
          } else {
            // Başka format
            this.users = [response];
            console.log('📄 Single object converted to array');
          }
        } else {
          console.warn('⚠️ Unexpected response format');
          this.users = [];
        }
        
        console.log('👥 Final users array:', this.users);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        this.loading = false;
        
        // Hata durumunda da backend'den gelen gerçek veriler olabilir
        this.loadMockUsers();
      }
    });
  }

  private loadMockUsers(): void {
    // Geçici olarak örnek data göster ama gerçek backend entegrasyonu gerekiyor
    this.users = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        roles: ['ROLE_ADMIN']
      },
      {
        id: 2,
        username: 'user',
        email: 'user@example.com',
        roles: ['ROLE_USER']
      }
    ];
  }

  searchUsers(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.userService.searchUsers(this.searchTerm).subscribe({
        next: (response) => {
          this.users = response.content;
          this.loading = false;
        },
        error: (error) => {
          console.error('Kullanıcı arama hatası:', error);
          this.loading = false;
        }
      });
    } else {
      this.loadUsers();
    }
  }

  deleteUser(id: number): void {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers(); // Listeyi yenile
          alert('Kullanıcı başarıyla silindi');
        },
        error: (error) => {
          console.error('Kullanıcı silme hatası:', error);
          alert('Kullanıcı silinirken hata oluştu');
        }
      });
    }
  }

  getRoleDisplay(roles: string[]): string {
    return roles.join(', ');
  }

  isAdmin(roles: string[]): boolean {
    return roles.some(role => 
      role.includes('ADMIN') || 
      role.includes('admin') || 
      role.toUpperCase().includes('ADMIN')
    );
  }

  isCurrentUser(userId: number): boolean {
    const currentUserId = this.getCurrentUserId();
    return currentUserId === userId;
  }

  // Modal methods
  openEditModal(user: User): void {
    // Kendi kendini düzenleme kontrolü
    const currentUserId = this.getCurrentUserId();
    if (currentUserId && user.id === currentUserId) {
      alert('⚠️ Güvenlik nedeniyle kendi hesabınızı düzenleyemezsiniz.\n\nHesap bilgilerinizi değiştirmek için profil sayfanızı kullanın.');
      return;
    }

    this.editingUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      password: '', // Şifreyi boş bırak
      // Backend'den gelen ROLE_USER, ROLE_ADMIN formatını kontrol et
      hasUserRole: user.roles.some(role => 
        role.includes('USER') || 
        role.includes('user') || 
        role === 'ROLE_USER'
      ),
      hasAdminRole: user.roles.some(role => 
        role.includes('ADMIN') || 
        role.includes('admin') || 
        role === 'ROLE_ADMIN'
      )
    };
    this.showEditModal = true;
    console.log('🔧 Editing user:', this.editingUser);
    console.log('📋 Original user roles:', user.roles);
    console.log('✅ Parsed roles - USER:', this.editingUser.hasUserRole, 'ADMIN:', this.editingUser.hasAdminRole);
  }

  private getCurrentUserId(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || payload.id;
      } catch (e) {
        console.error('Token parse error:', e);
      }
    }
    return null;
  }

  closeModal(): void {
    this.showEditModal = false;
    this.editingUser = {
      id: null,
      username: '',
      email: '',
      password: '',
      hasUserRole: false,
      hasAdminRole: false
    };
  }

  saveUser(): void {
    if (!this.editingUser.hasUserRole && !this.editingUser.hasAdminRole) {
      alert('En az bir rol seçilmelidir!');
      return;
    }

    // Backend'in beklediği formatta rol array'i oluştur
    const roles: string[] = [];
    if (this.editingUser.hasUserRole) roles.push('ROLE_USER'); // Backend enum format
    if (this.editingUser.hasAdminRole) roles.push('ROLE_ADMIN'); // Backend enum format

    const updateData = {
      username: this.editingUser.username.trim(),
      email: this.editingUser.email.trim(),
      roles: roles,
      ...(this.editingUser.password && { password: this.editingUser.password })
    };

    console.log('🔧 Updating user:', this.editingUser.id, updateData);
    console.log('🔑 Current token:', localStorage.getItem('token') ? 'Available' : 'Missing');
    console.log('🔑 Token value:', localStorage.getItem('token')?.substring(0, 50) + '...');
    console.log('👤 Roles being sent:', roles);
    
    // Token expiry check
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        console.log('⏰ Token expiry:', new Date(exp));
        console.log('⏰ Current time:', new Date(now));
        console.log('⏰ Token expired:', exp < now ? 'YES' : 'NO');
        console.log('👤 User roles in token:', payload.roles || payload.authorities);
      } catch (e) {
        console.error('❌ Token parse error:', e);
      }
    }

    this.userService.updateUser(this.editingUser.id, updateData).subscribe({
      next: (response) => {
        console.log('✅ User updated successfully:', response);
        this.loadUsers(); // Listeyi yenile
        this.closeModal();
        alert('Kullanıcı başarıyla güncellendi');
      },
      error: (error) => {
        console.error('❌ Kullanıcı güncelleme hatası:', error);
        console.log('📡 Error details:');
        console.log('- Status:', error.status);
        console.log('- StatusText:', error.statusText);
        console.log('- URL:', error.url);
        console.log('- Headers:', error.headers);
        
        if (error.status === 403) {
          alert('❌ Yetki hatası: Bu işlem için yeterli yetkiniz yok.\n\nMuhtemel nedenler:\n• Token süresi dolmuş\n• ADMIN yetkisi yok\n• Giriş yapmadınız\n\nLütfen tekrar giriş yapın.');
        } else {
          alert('Kullanıcı güncellenirken hata oluştu: ' + (error.error?.message || error.message));
        }
      }
    });
  }
}
