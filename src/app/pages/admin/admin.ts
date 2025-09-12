import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { DashboardService, DashboardStats } from '../../service/dashboard.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  stats: DashboardStats = {
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    outOfStockProducts: 0
  };
  loading = false;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.testBackendConnection();
    this.loadStats();
  }

  testBackendConnection(): void {
    console.log('🔍 Testing backend connection...');
    console.log('Backend URL:', 'http://localhost:8080');
    console.log('Auth token:', localStorage.getItem('token') ? '✅ Available' : '❌ Missing');
    
    // Backend health check - auth service'den currentUser observable'ını kullan
    this.authService.currentUser$.subscribe({
      next: (user) => {
        console.log('✅ Current user from auth service:', user);
      },
      error: (error) => {
        console.error('❌ Auth service error:', error);
      }
    });
    
    // Basit HTTP isteği ile backend'i test et
    fetch('http://localhost:8080/v3/api-docs')
      .then(response => {
        if (response.ok) {
          console.log('✅ Backend server is running on http://localhost:8080');
          console.log('⚠️ Problem might be with authentication or specific endpoints');
        } else {
          console.log('❌ Backend server responded with status:', response.status);
        }
      })
      .catch(err => {
        console.error('❌ Backend server is not accessible:', err);
        console.log('💡 Solutions:');
        console.log('1. Start the Spring Boot application');
        console.log('2. Check if port 8080 is available');
        console.log('3. Verify PostgreSQL database is running');
      });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  loadStats(): void {
    this.loading = true;
    console.log('📊 Loading dashboard stats...');
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('✅ Dashboard stats loaded:', data);
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Dashboard verisi alınamadı:', error);
        this.loading = false;
        // Hata durumunda varsayılan değerler göster
        this.stats = {
          totalProducts: 0,
          totalCategories: 0,
          totalUsers: 0,
          outOfStockProducts: 0
        };
      }
    });
  }

  // Navigation metodları
  navigateToProducts(): void {
    console.log('Navigating to products...');
    this.router.navigate(['/admin/products']);
  }

  navigateToCategories(): void {
    console.log('Navigating to categories...');
    this.router.navigate(['/admin/categories']);
  }

  navigateToUsers(): void {
    console.log('Navigating to users...');
    this.router.navigate(['/admin/users']);
  }

  // Quick Action metodları
  onAddProduct(): void {
    console.log('Add product clicked...');
    this.router.navigate(['/admin/products'], { queryParams: { action: 'add' } });
  }

  onAddCategory(): void {
    console.log('Add category clicked...');
    this.router.navigate(['/admin/categories'], { queryParams: { action: 'add' } });
  }

  onViewProducts(): void {
    console.log('View products clicked...');
    this.router.navigate(['/admin/products']);
  }
}
