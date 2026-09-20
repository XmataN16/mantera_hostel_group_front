import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserAccountResponse,
  UserAccountCreateRequest,
  EmployeeDto,
  RoleDto
} from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers(): Observable<UserAccountResponse[]> {
    return this.http.get<UserAccountResponse[]>(`${this.apiUrl}/users`);
  }

  getEmployees(): Observable<EmployeeDto[]> {
    return this.http.get<EmployeeDto[]>(`${this.apiUrl}/employees`);
  }

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.apiUrl}/roles`);
  }

  createUser(request: UserAccountCreateRequest): Observable<UserAccountResponse> {
    return this.http.post<UserAccountResponse>(`${this.apiUrl}/users`, request);
  }

  toggleEnabled(userId: number, enabled: boolean): Observable<UserAccountResponse> {
    return this.http.patch<UserAccountResponse>(
      `${this.apiUrl}/users/${userId}/enabled`,
      { enabled }
    );
  }

  changeRoles(userId: number, roleCodes: string[]): Observable<UserAccountResponse> {
    return this.http.patch<UserAccountResponse>(
      `${this.apiUrl}/users/${userId}/roles`,
      { roleCodes }
    );
  }

  changePassword(userId: number, newPassword: string): Observable<UserAccountResponse> {
    return this.http.patch<UserAccountResponse>(
      `${this.apiUrl}/users/${userId}/password`,
      { newPassword }
    );
  }
}
