import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { RegisterRequest } from '../../model/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerRequest: RegisterRequest = {
    username: '',
    password: '',
    email: ''
  };

  confirmPassword = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Şifre kontrolü
    if (this.registerRequest.password !== this.confirmPassword) {
      this.errorMessage = 'Şifreler eşleşmiyor.';
      return;
    }

    if (this.registerRequest.username && this.registerRequest.password && this.registerRequest.email) {
      this.loading = true;

      this.authService.register(this.registerRequest).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
          console.log('Kayıt başarılı:', response);
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Kayıt başarısız. Bu kullanıcı adı veya email zaten kullanımda olabilir.';
          console.error('Kayıt hatası:', error);
        }
      });
    }
  }
}
