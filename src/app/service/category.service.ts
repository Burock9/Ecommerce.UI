import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { CategoryIndex } from '../model/category.model';
import { Page } from '../model/response.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private apiService: ApiService) { }

  getAllCategories(page: number = 0, size: number = 20): Observable<Page<CategoryIndex>> {
    return this.apiService.get<Page<CategoryIndex>>('/categories', { page, size });
  }

  getCategoryById(id: number): Observable<CategoryIndex> {
    return this.apiService.get<CategoryIndex>(`/categories/${id}`);
  }

  getCategoryByName(name: string): Observable<CategoryIndex> {
    return this.apiService.get<CategoryIndex>(`/categories/name/${name}`);
  }

  searchCategories(name: string, page: number = 0, size: number = 20): Observable<Page<CategoryIndex>> {
    return this.apiService.get<Page<CategoryIndex>>('/categories/search', { name, page, size });
  }

  getCategoryProductCount(categoryId: string): Observable<number> {
    // Mevcut products/category/{id} endpoint'ini kullanarak ürün sayısını al
    return this.apiService.get<any>(`/products/category/${categoryId}`, { page: 0, size: 1 })
      .pipe(
        map(response => response.totalElements || 0)
      );
  }

  getAllCategoriesWithProductCount(page: number = 0, size: number = 20): Observable<Page<CategoryIndex>> {
    return this.apiService.get<Page<CategoryIndex>>('/admin/categories/with-count', { page, size });
  }

  // Public endpoint fallback - artık gerek yok ama backup olarak kalsın
  getPublicCategoryProductCount(categoryId: string): Observable<number> {
    return this.apiService.get<any>(`/products/category/${categoryId}`, { page: 0, size: 1 })
      .pipe(
        map(response => response.totalElements || 0)
      );
  }
}
