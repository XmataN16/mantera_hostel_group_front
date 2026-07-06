import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  // Прокладываем сигналы из AuthService как публичные поля
  currentUser = this.authService.currentUser;
  userRoles = this.authService.userRoles;
  isAdmin = this.authService.isAdmin; // <-- ДОБАВЬ ЭТУ СТРОКУ

  logout(): void {
    this.authService.logout();
  }
}
