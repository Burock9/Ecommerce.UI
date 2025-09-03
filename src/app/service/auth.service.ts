import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '../model/auth.model';
import { ResponseWrapper } from '../model/response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.apiService.post<ResponseWrapper<TokenResponse>>('/auth/login', credentials)
    .pipe(map(response => response.data), tap(tokenData => {
      localStorage.setItem('token', tokenData.token);
      localStorage.setItem('username', tokenData.username);
      this.loadCurrentUser();
      })
    );
  }

  register(credentials: RegisterRequest): Observable<string> {
    return this.apiService.post<ResponseWrapper<string>>('/auth/register', credentials)
    .pipe(map(response => response.data));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.currentUserSubject.next(null);
  }

  private loadCurrentUser(): void {
    this.apiService.get<User>('/auth/me').subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.logout()
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
