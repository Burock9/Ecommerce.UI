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
    const username = localStorage.getItem('username');
    
    if (token && username) {
      // Token varsa ama user bilgisi yoksa API'den yükle
      this.loadCurrentUser();
    }
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.apiService.post<ResponseWrapper<TokenResponse>>('/auth/login', credentials)
    .pipe(map(response => response.data), tap(tokenData => {
      localStorage.setItem('token', tokenData.token);
      localStorage.setItem('username', tokenData.username);
      
      // TokenResponse'dan user objesi oluşturalım
      const user: User = {
        id: 0, // Backend'den gelmiyor, geçici olarak 0
        username: tokenData.username,
        email: '', // Backend'den gelmiyor
        roles: tokenData.roles
      };
      
      this.currentUserSubject.next(user);
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

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    
    // Hem ADMIN hem de ROLE_ADMIN kontrolü yapalım
    return user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN');
  }
}
