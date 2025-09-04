import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductIndex } from '../model/product.model';
import { Page, ResponseWrapper } from '../model/response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private apiService: ApiService) { }

  getAllProducts(page: number = 0, size: number = 20): Observable<Page<ProductIndex>> {
    return this.apiService.get<Page<ProductIndex>>('/products', { page, size });
  }

  searchProducts(query: string, page: number = 0, size: number = 20): Observable<Page<ProductIndex>> {
    return this.apiService.get<Page<ProductIndex>>('/products/search', { q: query, page, size });
  }

  getProductById(id: number): Observable<ProductIndex> {
    return this.apiService.get<ProductIndex>(`/products/${id}`);
  }

  getProductsByCategory(categoryId: number, page: number = 0, size: number = 20): Observable<Page<ProductIndex>> {
    return this.apiService.get<Page<ProductIndex>>(`/products/category/${categoryId}`, { page, size });
  }

  getInStockProducts(page: number = 0, size: number = 20): Observable<Page<ProductIndex>> {
    return this.apiService.get<Page<ProductIndex>>('/products/in-stock', { page, size });
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number, page: number = 0, size: number = 20): Observable<Page<ProductIndex>> {
    return this.apiService.get<Page<ProductIndex>>('/products/price-range', { 
      minPrice, 
      maxPrice, 
      page, 
      size 
    });
  }
}
