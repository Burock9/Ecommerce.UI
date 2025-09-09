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
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kullanıcı Adı</th>
              <th>E-posta</th>
              <th>Roller</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" 
                      [class]="user.roles.includes('ADMIN') ? 'bg-danger' : 'bg-primary'">
                  {{ getRoleDisplay(user.roles) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline-primary me-1" 
                          title="Düzenle">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" 
                          (click)="deleteUser(user.id)"
                          title="Sil">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="users.length === 0" class="no-data">
          <i class="fas fa-users fa-3x mb-3"></i>
          <p>Henüz kullanıcı bulunmuyor.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-users {
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
    }

    .page-header h2 {
      color: #495057;
      margin: 0;
      font-weight: 600;
    }

    .search-section {
      margin-bottom: 25px;
    }

    .search-box {
      position: relative;
      max-width: 400px;
    }

    .search-box i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      z-index: 2;
    }

    .search-box input {
      padding-left: 40px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      height: 45px;
    }

    .search-box input:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .loading-spinner {
      text-align: center;
      padding: 50px;
      color: #6c757d;
    }

    .loading-spinner i {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .users-table {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table {
      margin: 0;
    }

    .table thead th {
      background: #f8f9fa;
      border: none;
      font-weight: 600;
      color: #495057;
      padding: 15px;
    }

    .table tbody td {
      padding: 15px;
      border-top: 1px solid #e9ecef;
      vertical-align: middle;
    }

    .table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .badge {
      font-size: 0.8rem;
      padding: 5px 10px;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .btn-sm {
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }

    .no-data {
      text-align: center;
      padding: 50px;
      color: #6c757d;
    }

    .no-data i {
      color: #dee2e6;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    console.log('Loading users from backend...');
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('✅ Users loaded successfully:', response);
        this.users = response.content;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        console.log('Backend URL:', 'http://localhost:8080/admin/users');
        console.log('Auth token:', localStorage.getItem('token') ? 'Available' : 'Missing');
        this.loading = false;
        // Hata durumunda örnek data göster
        this.users = [
          {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            roles: ['ADMIN']
          },
          {
            id: 2,
            username: 'user',
            email: 'user@example.com',
            roles: ['USER']
          }
        ];
      }
    });
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
}
