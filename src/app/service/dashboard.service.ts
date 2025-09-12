import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ProductService } from './product.service';
import { CategoryService } from './category.service';
import { UserService } from './user.service';
import { ResponseWrapper } from '../model/response.model';

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  outOfStockProducts: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private apiService: ApiService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private userService: UserService
  ) { }

  getDashboardStats(): Observable<DashboardStats> {
    console.log('📊 Getting dashboard stats...');
    
    // Mevcut endpoint'leri kullanarak istatistikleri hesapla
    return forkJoin({
      products: this.productService.getAllProducts(0, 1), // Sadece toplam sayıyı almak için
      categories: this.categoryService.getAllCategories(0, 1), // Sadece toplam sayıyı almak için  
      users: this.userService.getAllUsers(0, 1), // Sadece toplam sayıyı almak için
      outOfStock: this.getOutOfStockCount()
    }).pipe(
      map(data => {
        const stats = {
          totalProducts: data.products.totalElements || 0,
          totalCategories: data.categories.totalElements || 0,
          totalUsers: data.users.totalElements || 0,
          outOfStockProducts: data.outOfStock
        };
        console.log('📈 Calculated stats:', stats);
        return stats;
      }),
      catchError(error => {
        console.error('❌ Dashboard stats error:', error);
        // Hata durumunda varsayılan değerler döndür
        return [{
          totalProducts: 0,
          totalCategories: 0,
          totalUsers: 0,
          outOfStockProducts: 0
        }];
      })
    );
  }

  private getOutOfStockCount(): Observable<number> {
    // Önce out-of-stock endpoint'ini dene
    return this.apiService.get<any>('/products/out-of-stock', { page: 0, size: 1 })
      .pipe(
        map(response => response.totalElements || 0),
        catchError(() => {
          // Out-of-stock endpoint yoksa tüm ürünleri alıp filtrele
          console.log('⚠️ Out-of-stock endpoint not found, calculating manually...');
          return this.apiService.get<any>('/products', { page: 0, size: 1000 })
            .pipe(
              map(response => {
                if (response && response.content) {
                  const outOfStockCount = response.content.filter((product: any) => 
                    product.stock === 0 || product.stock === null || product.stock === undefined
                  ).length;
                  console.log(`📦 Out of stock products: ${outOfStockCount}`);
                  return outOfStockCount;
                }
                return 0;
              }),
              catchError(() => [0])
            );
        })
      );
  }
}
