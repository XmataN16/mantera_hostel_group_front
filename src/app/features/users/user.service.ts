import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserAccountResponse,
  UserAccountCreateRequest,
  EmployeeDto,
  RoleDto
} from '../../shared/models/user.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private readonly CACHE_KEY_USERS = 'cache_users_all';
  private readonly CACHE_KEY_EMPLOYEES = 'cache_employees_for_users';
  private readonly CACHE_KEY_ROLES = 'cache_roles_all';

  private usersCache$: Observable<UserAccountResponse[]> | null = null;
  private employeesCache$: Observable<EmployeeDto[]> | null = null;
  private rolesCache$: Observable<RoleDto[]> | null = null;

  getUsers(forceReload: boolean = false): Observable<UserAccountResponse[]> {
    if (!forceReload) {
      const cached = StorageCache.get<UserAccountResponse[]>(this.CACHE_KEY_USERS);
      if (cached) return of(cached);
      if (this.usersCache$) return this.usersCache$;
    }

    this.usersCache$ = this.http.get<UserAccountResponse[]>(`${this.apiUrl}/users`).pipe(
      tap(data => StorageCache.set(this.CACHE_KEY_USERS, data, 15)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => { this.usersCache$ = null; return throwError(() => err); })
    );
    return this.usersCache$;
  }

  getEmployees(forceReload: boolean = false): Observable<EmployeeDto[]> {
    if (!forceReload) {
      const cached = StorageCache.get<EmployeeDto[]>(this.CACHE_KEY_EMPLOYEES);
      if (cached) return of(cached);
      if (this.employeesCache$) return this.employeesCache$;
    }

    this.employeesCache$ = this.http.get<EmployeeDto[]>(`${this.apiUrl}/employees`).pipe(
      tap(data => StorageCache.set(this.CACHE_KEY_EMPLOYEES, data, 15)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => { this.employeesCache$ = null; return throwError(() => err); })
    );
    return this.employeesCache$;
  }

  getRoles(forceReload: boolean = false): Observable<RoleDto[]> {
    if (!forceReload) {
      const cached = StorageCache.get<RoleDto[]>(this.CACHE_KEY_ROLES);
      if (cached) return of(cached);
      if (this.rolesCache$) return this.rolesCache$;
    }

    this.rolesCache$ = this.http.get<RoleDto[]>(`${this.apiUrl}/roles`).pipe(
      tap(data => StorageCache.set(this.CACHE_KEY_ROLES, data, 60)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => { this.rolesCache$ = null; return throwError(() => err); })
    );
    return this.rolesCache$;
  }

  createUser(request: UserAccountCreateRequest): Observable<UserAccountResponse> {
    return this.http.post<UserAccountResponse>(`${this.apiUrl}/users`, request).pipe(
      tap(() => this.invalidateUsersCache())
    );
  }

  toggleEnabled(userId: number, enabled: boolean): Observable<UserAccountResponse> {
    return this.http.patch<UserAccountResponse>(`${this.apiUrl}/users/${userId}/enabled`, { enabled }).pipe(
      tap(() => this.invalidateUsersCache())
    );
  }

  changeRoles(userId: number, roleCodes: string[]): Observable<UserAccountResponse> {
    return this.http.patch<UserAccountResponse>(`${this.apiUrl}/users/${userId}/roles`, { roleCodes }).pipe(
      tap(() => this.invalidateUsersCache())
    );
  }

  changePassword(userId: number, newPassword: string): Observable<UserAccountResponse> {
    return this.http.patch<UserAccountResponse>(`${this.apiUrl}/users/${userId}/password`, { newPassword });
  }

  private invalidateUsersCache(): void {
    this.usersCache$ = null;
    StorageCache.remove(this.CACHE_KEY_USERS);
  }
}