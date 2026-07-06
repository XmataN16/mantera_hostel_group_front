import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, JwtLoginResponse, CurrentUserResponse } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals для реактивного состояния
  private token = signal<string | null>(localStorage.getItem('access_token'));
  private username = signal<string | null>(localStorage.getItem('username'));
  private roles = signal<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));

  // Computed signals для проверки прав
  isAuthenticated = computed(() => !!this.token());
  currentUser = computed(() => this.username());
  userRoles = computed(() => this.roles());

  isAdmin = computed(() => this.roles().includes('ADMIN'));
  isManager = computed(() => this.roles().includes('MANAGER') || this.isAdmin());
  isReceptionist = computed(() => this.roles().includes('RECEPTIONIST') || this.isManager());

  login(request: LoginRequest): Observable<JwtLoginResponse> {
    return this.http.post<JwtLoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('username', response.username);
        localStorage.setItem('roles', JSON.stringify(response.roles));

        this.token.set(response.accessToken);
        this.username.set(response.username);
        this.roles.set(response.roles);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');

    this.token.set(null);
    this.username.set(null);
    this.roles.set([]);
  }

  getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${this.apiUrl}/me`);
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.roles().includes(role));
  }
}
