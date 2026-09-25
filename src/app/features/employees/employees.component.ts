import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { HotelService } from '../hotels/hotel.service';
import { EmployeeService } from './employee.service';
import { HotelDto } from '../../shared/models/hotel.model';
import {
  EmployeeResponse,
  EmployeeCreateRequest,
  EmployeeStatus
} from '../../shared/models/employee.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  private service = inject(EmployeeService);
  private hotelService = inject(HotelService);

  employees = signal<EmployeeResponse[]>([]);
  hotels = signal<HotelDto[]>([]);
  selectedHotelId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = signal(false);
  isEditMode = signal(false);
  selectedEmployeeId = signal<number | null>(null);

  employeeForm: EmployeeCreateRequest = this.getEmptyForm();

  ngOnInit(): void {
    this.loadHotels();
    this.loadEmployees();
  }

  loadHotels(): void {
    this.hotelService.getAll().subscribe({
      next: hotels => {
        this.hotels.set(hotels);
        if (hotels.length > 0 && !this.selectedHotelId()) {
          this.selectedHotelId.set(hotels[0].id);
          this.loadEmployees();
        }
      },
      error: () => {}
    });
  }

  loadEmployees(forceReload: boolean = false): void {
    const hotelId = this.selectedHotelId();
    this.isLoading.set(true);
    
    // Передаем forceReload в сервис
    this.service.getAll(hotelId || undefined, forceReload).subscribe({
      next: employees => {
        this.employees.set(employees);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        alert('Ошибка загрузки: ' + this.getErrorMessage(err));
      }
    });
  }

  onHotelChange(): void {
    this.loadEmployees();
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedEmployeeId.set(null);
    this.employeeForm = this.getEmptyForm();
    this.displayDialog.set(true);
  }

  openEditDialog(employee: EmployeeResponse): void {
    this.isEditMode.set(true);
    this.selectedEmployeeId.set(employee.id);
    this.employeeForm = {
      hotelId: employee.hotelId,
      fullName: employee.fullName,
      position: employee.position,
      phone: employee.phone,
      email: employee.email
    };
    this.displayDialog.set(true);
  }

  closeDialog(): void {
    this.displayDialog.set(false);
  }

  saveEmployee(): void {
    if (!this.employeeForm.fullName?.trim()) {
      alert('Введите ФИО сотрудника');
      return;
    }
    if (!this.employeeForm.hotelId) {
      alert('Выберите отель');
      return;
    }
    if (!this.employeeForm.position?.trim()) {
      alert('Введите должность');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.selectedEmployeeId();
      if (!id) return;

      this.service.update(id, {
        fullName: this.employeeForm.fullName,
        position: this.employeeForm.position,
        phone: this.employeeForm.phone,
        email: this.employeeForm.email,
        status: 'ACTIVE'
      }).subscribe({
        next: (updatedEmployee) => { // <-- Получаем обновленного сотрудника
          this.isSaving.set(false);
          this.displayDialog.set(false);
          
          // Синхронизируем фильтр с отелем сотрудника
          this.selectedHotelId.set(updatedEmployee.hotelId);
          // Принудительно перезагружаем список, минуя кэш
          this.loadEmployees(true); 
        },
        error: err => {
          this.isSaving.set(false);
          alert('Ошибка: ' + this.getErrorMessage(err));
        }
      });
    } else {
      // === БЛОК СОЗДАНИЯ (CREATE) ===
      this.service.create(this.employeeForm).subscribe({
        next: (newEmployee) => { // <-- 1. Получаем созданного сотрудника из ответа бэкенда
          this.isSaving.set(false);
          this.displayDialog.set(false);
          
          // 2. Переключаем фильтр таблицы на отель, в который добавили сотрудника.
          // Это гарантирует, что пользователь сразу увидит новую запись.
          this.selectedHotelId.set(newEmployee.hotelId);
          
          // 3. Принудительно перезагружаем список (forceReload = true), 
          // чтобы гарантированно обойти localStorage кэш и сделать свежий запрос.
          this.loadEmployees(true); 
        },
        error: err => {
          this.isSaving.set(false);
          alert('Ошибка: ' + this.getErrorMessage(err));
        }
      });
    }
  }

  deleteEmployee(employee: EmployeeResponse): void {
    if (!confirm(`Удалить сотрудника "${employee.fullName}"?`)) return;
    this.service.delete(employee.id).subscribe({
      next: () => this.loadEmployees(),
      error: err => alert('Ошибка: ' + this.getErrorMessage(err))
    });
  }

  getStatusLabel(status: EmployeeStatus): string {
    const labels: Record<EmployeeStatus, string> = {
      ACTIVE: 'Активен',
      TERMINATED: 'Уволен',
      ON_VACATION: 'В отпуске'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: EmployeeStatus): 'success' | 'danger' | 'warning' {
    const severities: Record<EmployeeStatus, 'success' | 'danger' | 'warning'> = {
      ACTIVE: 'success',
      TERMINATED: 'danger',
      ON_VACATION: 'warning'
    };
    return severities[status] || 'secondary';
  }

  getHotelName(hotelId: number): string {
    return this.hotels().find(h => h.id === hotelId)?.name || `ID ${hotelId}`;
  }

  private getEmptyForm(): EmployeeCreateRequest {
    return {
      hotelId: 0,
      fullName: '',
      position: '',
      phone: '',
      email: ''
    };
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
