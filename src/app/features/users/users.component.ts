import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { UserService } from './user.service';
import {
  UserAccountResponse,
  UserAccountCreateRequest,
  EmployeeDto,
  RoleDto
} from '../../shared/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputSwitchModule,
    TagModule,
    MultiSelectModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);

  users = signal<UserAccountResponse[]>([]);
  employees = signal<EmployeeDto[]>([]);
  roles = signal<RoleDto[]>([]);

  isLoading = signal(false);
  isSaving = signal(false);

  displayCreateDialog = signal(false);
  displayPasswordDialog = signal(false);
  displayRolesDialog = signal(false);

  selectedUserForPassword = signal<UserAccountResponse | null>(null);
  selectedUserForRoles = signal<UserAccountResponse | null>(null);

  newUser: UserAccountCreateRequest = this.getEmptyForm();
  newPassword = '';
  selectedRoleCodes: string[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        alert('Ошибка загрузки пользователей: ' + this.getErrorMessage(err));
      }
    });

    this.userService.getEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: () => {}
    });

    this.userService.getRoles().subscribe({
      next: (data) => this.roles.set(data),
      error: () => {}
    });
  }

  openCreateDialog(): void {
    this.newUser = this.getEmptyForm();
    this.displayCreateDialog.set(true);
  }

  createUser(): void {
    if (!this.newUser.employeeId) {
      alert('Выберите сотрудника');
      return;
    }
    if (!this.newUser.username?.trim()) {
      alert('Введите логин');
      return;
    }
    if (!this.newUser.password || this.newUser.password.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }
    if (!this.newUser.roleCodes || this.newUser.roleCodes.length === 0) {
      alert('Выберите хотя бы одну роль');
      return;
    }

    this.isSaving.set(true);
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.displayCreateDialog.set(false);
        this.loadData();
      },
      error: (err) => {
        this.isSaving.set(false);
        alert('Ошибка создания: ' + this.getErrorMessage(err));
      }
    });
  }

toggleUserStatus(user: UserAccountResponse): void {
    const newStatus = user.enabled; 

    this.userService.toggleEnabled(user.id, newStatus).subscribe({
        next: () => {
            const updatedUsers = this.users().map(u => 
                u.id === user.id ? { ...u, enabled: newStatus } : u
            );
            this.users.set(updatedUsers);
        },
        error: (err) => {
            user.enabled = !newStatus; 
            alert('Ошибка: ' + this.getErrorMessage(err));
        }
    });
}

  openPasswordDialog(user: UserAccountResponse): void {
    this.selectedUserForPassword.set(user);
    this.newPassword = '';
    this.displayPasswordDialog.set(true);
  }

  changePassword(): void {
    const user = this.selectedUserForPassword();
    if (!user) return;
    if (!this.newPassword || this.newPassword.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }

    this.isSaving.set(true);
    this.userService.changePassword(user.id, this.newPassword).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.displayPasswordDialog.set(false);
        this.loadData();
      },
      error: (err) => {
        this.isSaving.set(false);
        alert('Ошибка: ' + this.getErrorMessage(err));
      }
    });
  }

  openRolesDialog(user: UserAccountResponse): void {
    this.selectedUserForRoles.set(user);
    this.selectedRoleCodes = [...user.roles];
    this.displayRolesDialog.set(true);
  }

  saveRoles(): void {
    const user = this.selectedUserForRoles();
    if (!user) return;
    if (this.selectedRoleCodes.length === 0) {
      alert('Выберите хотя бы одну роль');
      return;
    }

    this.isSaving.set(true);
    this.userService.changeRoles(user.id, this.selectedRoleCodes).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.displayRolesDialog.set(false);
        this.loadData();
      },
      error: (err) => {
        this.isSaving.set(false);
        alert('Ошибка: ' + this.getErrorMessage(err));
      }
    });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'info';
      case 'ACCOUNTANT': return 'warning';
      case 'RECEPTIONIST': return 'success';
      case 'HOUSEKEEPING': return 'secondary';
      default: return 'secondary';
    }
  }

  private getEmptyForm(): UserAccountCreateRequest {
    return {
      employeeId: 0,
      username: '',
      password: '',
      roleCodes: []
    };
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
