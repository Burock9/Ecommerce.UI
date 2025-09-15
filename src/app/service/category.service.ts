import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Category, CategoryIndex } from '../model/category.model';
import { Page, ResponseWrapper } from '../model/response.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private apiService: ApiService) { }

  getAllCategories(page: number = 0, size: number = 20): Observable<Page<CategoryIndex>> {
    // Backend'den ID'ye göre sıralı veri almaya çalış
    return this.apiService.get<Page<CategoryIndex>>('/categories', { 
      page, 
      size, 
      sort: 'id,asc' // ID'ye göre artan sıralama
    }).pipe(
      map(response => {
        // Backend sort desteklemezse frontend'de sırala
        if (response.content) {
          response.content.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        }
        return response;
      })
    );
  }

  getCategoryById(id: number): Observable<CategoryIndex> {
    return this.apiService.get<CategoryIndex>(`/categories/${id}`);
  }

  getCategoryByName(name: string): Observable<CategoryIndex> {
    return this.apiService.get<CategoryIndex>(`/categories/name/${name}`);
  }

  searchCategories(name: string, page: number = 0, size: number = 20): Observable<Page<CategoryIndex>> {
    return this.apiService.get<Page<CategoryIndex>>('/categories/search', { 
      name, 
      page, 
      size, 
      sort: 'id,asc' // ID'ye göre artan sıralama
    }).pipe(
      map(response => {
        // Backend sort desteklemezse frontend'de sırala
        if (response.content) {
          response.content.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        }
        return response;
      })
    );
  }

  getCategoryProductCount(categoryId: string): Observable<number> {
    // Mevcut products/category/{id} endpoint'ini kullanarak ürün sayısını al
    return this.apiService.get<any>(`/products/category/${categoryId}`, { page: 0, size: 1 })
      .pipe(
        map(response => response.totalElements || 0)
      );
  }

  getAllCategoriesWithProductCount(page: number = 0, size: number = 20): Observable<Page<CategoryIndex>> {
    // Normal categories endpoint'ini kullan, admin endpoint yok
    return this.apiService.get<Page<CategoryIndex>>('/categories', { 
      page, 
      size, 
      sort: 'id,asc' // ID'ye göre artan sıralama
    }).pipe(
      map(response => {
        // Backend sort desteklemezse frontend'de sırala
        if (response.content) {
          response.content.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        }
        return response;
      })
    );
  }

  // Public endpoint fallback - artık gerek yok ama backup olarak kalsın
  getPublicCategoryProductCount(categoryId: string): Observable<number> {
    return this.apiService.get<any>(`/products/category/${categoryId}`, { page: 0, size: 1 })
      .pipe(
        map(response => response.totalElements || 0)
      );
  }

  // CRUD Operations for Admin
  createCategory(category: Partial<Category>): Observable<Category> {
    console.log('🏷️ CategoryService: createCategory called');
    console.log('📤 Sending category data:', JSON.stringify(category, null, 2));
    
    return this.apiService.post<ResponseWrapper<Category>>('/categories', category)
      .pipe(
        map(response => {
          console.log('✅ CategoryService: Category created successfully:', response);
          return response.data;
        })
      );
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    console.log('🏷️ CategoryService: updateCategory called for ID:', id);
    console.log('📤 Sending category data:', JSON.stringify(category, null, 2));
    
    return this.apiService.put<ResponseWrapper<Category>>(`/categories/${id}`, category)
      .pipe(
        map(response => {
          console.log('✅ CategoryService: Category updated successfully:', response);
          return response.data;
        })
      );
  }

  deleteCategory(id: number): Observable<void> {
    console.log('🏷️ CategoryService: deleteCategory called for ID:', id);
    return this.apiService.delete<void>(`/categories/${id}`);
  }
}
