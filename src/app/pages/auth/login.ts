import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoginRequest } from '../../model/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginRequest: LoginRequest = {
    username: '',
    password: ''
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginRequest.username && this.loginRequest.password) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginRequest).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Login başarılı:', response);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Giriş başarısız. Kullanıcı adı veya şifre hatalı.';
          console.error('Login hatası:', error);
        }
      });
    }
  }
}
