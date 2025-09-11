import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    get<T>(endpoint: string, params?: any): Observable<T> {
        console.log('🌐 ApiService GET:', this.baseUrl + endpoint);
        console.log('🔑 Token available:', localStorage.getItem('token') ? 'Yes' : 'No');
        
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }
        
        console.log('📨 Request params:', params);
        
        const request = this.http.get<T>(`${this.baseUrl}${endpoint}`, {
          headers: this.getHeaders(),
          params: httpParams
        });

        // Response'u intercept edelim
        request.subscribe({
          next: (response) => console.log('✅ API Response:', response),
          error: (error) => console.error('❌ API Error:', error)
        });

        return request;
    }

    

    post<T>(endpoint: string, data: any): Observable<T> {
      return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getHeaders()
      });
    }

    put<T>(endpoint: string, data: any): Observable<T> {
      return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getHeaders()
      });
    }

    delete<T>(endpoint: string): Observable<T> {
      return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders()
      });
    }
}