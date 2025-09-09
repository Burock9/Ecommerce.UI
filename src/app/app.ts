import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
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
export class App {
  protected readonly title = signal('Ecommerce.UI');

  constructor(private router: Router) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
