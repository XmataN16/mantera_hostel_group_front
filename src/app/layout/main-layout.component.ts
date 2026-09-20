import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Прокладываем сигналы из AuthService как публичные поля
  currentUser = this.authService.currentUser;
  userRoles = this.authService.userRoles;
  isAdmin = this.authService.isAdmin;

  isManagerOrAdmin(): boolean {
    return this.userRoles().includes('ADMIN') || this.userRoles().includes('MANAGER');
  }

  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
