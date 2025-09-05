import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { DashboardService, DashboardStats } from '../../service/dashboard.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  currentUser: any = null;
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
    this.loadCurrentUser();
    this.loadStats();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!this.isAdmin()) {
        // Admin değilse anasayfaya yönlendir
        window.location.href = '/';
      }
    });
  }

  private loadStats(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        console.log('Dashboard istatistikleri yüklendi:', stats);
      },
      error: (error) => {
        console.error('Dashboard istatistikleri yüklenirken hata:', error);
        this.loading = false;
        // Hata durumunda varsayılan değerleri göster
        this.stats = {
          totalProducts: 0,
          totalCategories: 0,
          totalUsers: 0,
          outOfStockProducts: 0
        };
      }
    });
  }

  isAdmin(): boolean {
    if (!this.currentUser || !this.currentUser.roles) return false;
    return this.currentUser.roles.includes('ADMIN') || this.currentUser.roles.includes('ROLE_ADMIN');
  }

  isDashboard(): boolean {
    return this.router.url === '/admin';
  }

  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/admin/categories']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }
}
