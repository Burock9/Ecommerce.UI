import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../model/auth.model';
import { Page, ResponseWrapper } from '../model/response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  getAllUsers(page: number = 0, size: number = 20): Observable<Page<User>> {
    return this.apiService.get<Page<User>>('/admin/users', { page, size });
  }

  getUserById(id: number): Observable<User> {
    return this.apiService.get<User>(`/admin/users/${id}`);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.apiService.put<ResponseWrapper<User>>(`/admin/users/${id}`, user)
      .pipe(map(response => response.data));
  }

  deleteUser(id: number): Observable<void> {
    return this.apiService.delete<void>(`/admin/users/${id}`);
  }

  searchUsers(query: string, page: number = 0, size: number = 20): Observable<Page<User>> {
    return this.apiService.get<Page<User>>('/admin/users/search', { q: query, page, size });
  }
}
