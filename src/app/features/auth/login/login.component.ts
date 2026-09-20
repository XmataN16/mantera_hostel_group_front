import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../shared/models/auth.model';
import { LoginFormComponent, LoginFormCredentials } from '../../../shared/components/login-form.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    LoginFormComponent
  ],
  template: `
    <div class="login-page">
      <div class="login-background">
        <div class="login-container">
          <app-login-form
            [title]="'Вход в Mantera PMS'"
            [subtitle]="'Система управления хостелами'"
            [showDemoCredentials]="true"
            [isLoading]="isLoading"
            [errorMessage]="errorMessage"
            [credentials]="credentials"
            (loginSubmit)="onLoginSubmit($event)">
          </app-login-form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-background {
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .login-container {
      display: flex;
      justify-content: center;
      width: 100%;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  credentials: LoginRequest = {
    username: '',
    password: ''
  };

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  onLoginSubmit(credentials: LoginFormCredentials): void {
    if (!credentials.username || !credentials.password) {
      this.errorMessage.set('Заполните все поля');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(credentials).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ошибка авторизации');
      }
    });
  }
}
