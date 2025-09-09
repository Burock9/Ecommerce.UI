import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayout implements OnInit {
  currentUser: any = null;
  sidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isDashboard(): boolean {
    return this.router.url === '/admin' || this.router.url === '/admin/';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Navigation metodları
  navigateToHome(): void {
    console.log('Navigating to home...');
    this.router.navigate(['/']);
  }

  navigateToDashboard(): void {
    console.log('Navigating to dashboard...');
    this.router.navigate(['/admin']);
  }

  navigateToProducts(): void {
    console.log('Navigating to products from sidebar...');
    this.router.navigate(['admin/products']);
  }

  navigateToCategories(): void {
    console.log('Navigating to categories from sidebar...');
    this.router.navigate(['/admin/categories']);
  }

  navigateToUsers(): void {
    console.log('Navigating to users from sidebar...');
    this.router.navigate(['/admin/users']);
  }

  logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
