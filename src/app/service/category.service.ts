import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
}
