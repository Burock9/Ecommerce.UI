import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationError, NavigationCancel } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from "./layout/header/header";
import { CategoriesBar } from "./layout/categories-bar/categories-bar";
import { Footer } from "./layout/footer/footer";
import { AdminLayout } from "./layout/admin-layout/admin-layout";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, CommonModule, CategoriesBar, Footer, AdminLayout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Tüm router events'lerini dinle
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('🔄 Navigation starting to:', event.url);
        console.log('🔄 Navigation ID:', event.id);
        console.log('🔄 Navigation trigger:', event.navigationTrigger);
      } else if (event instanceof NavigationEnd) {
        console.log('✅ Navigation completed to:', event.url);
        console.log('✅ Navigation ID:', event.id);
      } else if (event instanceof NavigationError) {
        console.error('❌ Navigation error:', event.error);
        console.error('❌ Target URL was:', event.url);
        console.error('❌ Navigation ID:', event.id);
      } else if (event instanceof NavigationCancel) {
        console.warn('⚠️ Navigation cancelled to:', event.url);
        console.warn('⚠️ Reason:', event.reason);
        console.warn('⚠️ Navigation ID:', event.id);
      }
    });
  }
  protected readonly title = signal('Ecommerce.UI');

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  shouldShowCategoriesBar(): boolean {
    // Kategori bar'ı sadece ana sayfa, kategoriler ve kategori sayfalarında göster
    const url = this.router.url;
    return url === '/' || 
           url.startsWith('/categories') || 
           url.startsWith('/category');
  }
}
