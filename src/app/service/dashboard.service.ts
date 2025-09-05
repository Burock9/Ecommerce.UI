import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
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

  constructor(private apiService: ApiService) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<ResponseWrapper<DashboardStats>>('/admin/dashboard/stats')
      .pipe(map(response => response.data));
  }
}
