import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

export interface LoginFormCredentials {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule
  ],
  template: `
    <form class="login-form" (ngSubmit)="onSubmit()">
      <div class="login-header">
        <h2>{{ title }}</h2>
        @if (subtitle) {
          <p>{{ subtitle }}</p>
        }
      </div>

      @if (errorMessage()) {
        <div class="error-message">
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <div class="field">
        <label for="username">Логин</label>
        <input
          id="username"
          type="text"
          pInputText
          [(ngModel)]="credentials.username"
          name="username"
          placeholder="Введите логин"
          [disabled]="isLoading()"
          autocomplete="username" />
      </div>

      <div class="field">
        <label for="password">Пароль</label>
        <p-password
          id="password"
          [(ngModel)]="credentials.password"
          name="password"
          placeholder="Введите пароль"
          [disabled]="isLoading()"
          [feedback]="false"
          [toggleMask]="true"
          styleClass="w-full"
          inputStyleClass="w-full"
          autocomplete="current-password" />
      </div>

      <button
        pButton
        type="submit"
        label="Войти"
        icon="pi pi-sign-in"
        [loading]="isLoading()"
        [disabled]="isLoading()"
        styleClass="w-full">
      </button>

      @if (showDemoCredentials) {
        <div class="demo-credentials">
          <strong>Демо-доступ:</strong>
          <div>admin / admin123</div>
          <div>manager / manager123</div>
          <div>reception / reception123</div>
        </div>
      }
    </form>
  `,
  styles: [`
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 2rem;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      max-width: 420px;
      width: 100%;
    }

    .login-header {
      text-align: center;
      margin-bottom: 0.5rem;

      h2 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
        font-size: 1.8rem;
      }

      p {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.95rem;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      background: #fee;
      color: #c0392b;
      border: 1px solid #f5b7b1;
      font-size: 0.9rem;

      i {
        font-size: 1.1rem;
      }
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 600;
        color: #34495e;
        font-size: 0.9rem;
      }

      input {
        width: 100%;
      }

      ::ng-deep {
        .p-password {
          width: 100%;
        }
        .p-password-input {
          width: 100%;
        }
      }
    }

    .demo-credentials {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      font-size: 0.85rem;
      color: #7f8c8d;

      strong {
        display: block;
        margin-bottom: 0.5rem;
        color: #2c3e50;
      }

      div {
        margin: 0.25rem 0;
      }
    }
  `]
})
export class LoginFormComponent {
  @Input() title = 'Вход в систему';
  @Input() subtitle = 'Mantera PMS';
  @Input() showDemoCredentials = false;
  @Input() isLoading = signal(false);
  @Input() errorMessage = signal<string | null>(null);
  @Input() credentials: LoginFormCredentials = { username: '', password: '' };
  @Output() loginSubmit = new EventEmitter<LoginFormCredentials>();

  onSubmit(): void {
    this.loginSubmit.emit(this.credentials);
  }
}
