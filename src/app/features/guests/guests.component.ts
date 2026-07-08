import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';

import { GuestService } from './guest.service';
import {
  GuestCreateRequest,
  GuestResponse,
  GuestStayHistoryResponse,
  GuestUpdateRequest
} from '../../shared/models/guest.model';
import { ReservationStatus } from '../../shared/models/reservation.model';

interface DropdownOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule
  ],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss'
})
export class GuestsComponent implements OnInit {
  private guestService = inject(GuestService);

  guests = signal<GuestResponse[]>([]);
  searchTerm = signal('');

  isLoading = signal(false);
  isSaving = signal(false);
  isHistoryLoading = signal(false);

  displayDialog = signal(false);
  displayHistoryDialog = signal(false);

  isEditMode = signal(false);
  selectedGuestId = signal<number | null>(null);
  selectedGuestForHistory = signal<GuestResponse | null>(null);

  history = signal<GuestStayHistoryResponse[]>([]);

  genderOptions: DropdownOption[] = [
    { label: 'Мужской', value: 'MALE' },
    { label: 'Женский', value: 'FEMALE' },
    { label: 'Другое', value: 'OTHER' }
  ];

  documentTypeOptions: DropdownOption[] = [
    { label: 'Паспорт РФ', value: 'PASSPORT' },
    { label: 'Заграничный паспорт', value: 'FOREIGN_PASSPORT' },
    { label: 'Свидетельство о рождении', value: 'BIRTH_CERTIFICATE' },
    { label: 'Водительское удостоверение', value: 'DRIVER_LICENSE' },
    { label: 'Другое', value: 'OTHER' }
  ];

  guestForm: GuestCreateRequest = this.getEmptyGuestForm();

  filteredGuests = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if (!query) {
      return this.guests();
    }

    return this.guests().filter(guest => {
      const fullName = this.getGuestFullName(guest).toLowerCase();
      const phone = guest.phone?.toLowerCase() || '';
      const email = guest.email?.toLowerCase() || '';
      const documentNumber = guest.documentNumber?.toLowerCase() || '';

      return fullName.includes(query)
        || phone.includes(query)
        || email.includes(query)
        || documentNumber.includes(query);
    });
  });

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests(): void {
    this.isLoading.set(true);

    this.guestService.getAll().subscribe({
      next: guests => {
        this.guests.set(guests);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        alert('Ошибка загрузки гостей: ' + this.getErrorMessage(err));
      }
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedGuestId.set(null);
    this.guestForm = this.getEmptyGuestForm();
    this.displayDialog.set(true);
  }

  openEditDialog(guest: GuestResponse): void {
    this.isEditMode.set(true);
    this.selectedGuestId.set(guest.id);

    this.guestForm = {
      lastName: guest.lastName,
      firstName: guest.firstName,
      middleName: guest.middleName,
      birthDate: guest.birthDate,
      gender: guest.gender,
      phone: guest.phone,
      email: guest.email,
      citizenship: guest.citizenship,
      documentType: guest.documentType,
      documentNumber: guest.documentNumber,
      documentIssueDate: guest.documentIssueDate,
      documentIssuedBy: guest.documentIssuedBy,
      address: guest.address,
      comment: guest.comment
    };

    this.displayDialog.set(true);
  }

  closeDialog(): void {
    this.displayDialog.set(false);
  }

  saveGuest(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode()) {
      this.updateGuest();
      return;
    }

    this.createGuest();
  }

  createGuest(): void {
    const request: GuestCreateRequest = this.normalizeCreateRequest(this.guestForm);

    this.isSaving.set(true);

    this.guestService.create(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.displayDialog.set(false);
        this.loadGuests();
      },
      error: err => {
        this.isSaving.set(false);
        alert('Ошибка создания гостя: ' + this.getErrorMessage(err));
      }
    });
  }

  updateGuest(): void {
    const guestId = this.selectedGuestId();

    if (!guestId) {
      alert('Не выбран гость для редактирования');
      return;
    }

    const request: GuestUpdateRequest = this.normalizeUpdateRequest(this.guestForm);

    this.isSaving.set(true);

    this.guestService.update(guestId, request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.displayDialog.set(false);
        this.loadGuests();
      },
      error: err => {
        this.isSaving.set(false);
        alert('Ошибка обновления гостя: ' + this.getErrorMessage(err));
      }
    });
  }

  deleteGuest(guest: GuestResponse): void {
    const confirmed = confirm(
      `Удалить гостя ${this.getGuestFullName(guest)}?`
    );

    if (!confirmed) {
      return;
    }

    this.guestService.delete(guest.id).subscribe({
      next: () => this.loadGuests(),
      error: err => alert('Ошибка удаления гостя: ' + this.getErrorMessage(err))
    });
  }

  openHistoryDialog(guest: GuestResponse): void {
    this.selectedGuestForHistory.set(guest);
    this.history.set([]);
    this.displayHistoryDialog.set(true);
    this.isHistoryLoading.set(true);

    this.guestService.getStayHistory(guest.id).subscribe({
      next: history => {
        this.history.set(history);
        this.isHistoryLoading.set(false);
      },
      error: err => {
        this.isHistoryLoading.set(false);
        alert('Ошибка загрузки истории проживаний: ' + this.getErrorMessage(err));
      }
    });
  }

  closeHistoryDialog(): void {
    this.displayHistoryDialog.set(false);
  }

  getGuestFullName(guest: GuestResponse): string {
    return [guest.lastName, guest.firstName, guest.middleName]
      .filter(Boolean)
      .join(' ');
  }

  getGenderLabel(gender: string): string {
    const labels: Record<string, string> = {
      MALE: 'Мужской',
      FEMALE: 'Женский',
      OTHER: 'Другое'
    };

    return labels[gender] || gender;
  }

  getDocumentTypeLabel(documentType: string): string {
    const labels: Record<string, string> = {
      PASSPORT: 'Паспорт РФ',
      FOREIGN_PASSPORT: 'Заграничный паспорт',
      BIRTH_CERTIFICATE: 'Свидетельство о рождении',
      DRIVER_LICENSE: 'Водительское удостоверение',
      OTHER: 'Другое'
    };

    return labels[documentType] || documentType;
  }

  getStatusLabel(status: ReservationStatus): string {
    const labels: Record<ReservationStatus, string> = {
      CREATED: 'Создано',
      CONFIRMED: 'Подтверждено',
      CHECKED_IN: 'Заселён',
      CHECKED_OUT: 'Выселен',
      CANCELLED: 'Отменено',
      NO_SHOW: 'Не заехал'
    };

    return labels[status] || status;
  }

  getStatusSeverity(status: ReservationStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities: Record<ReservationStatus, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      CREATED: 'warning',
      CONFIRMED: 'info',
      CHECKED_IN: 'success',
      CHECKED_OUT: 'secondary',
      CANCELLED: 'danger',
      NO_SHOW: 'danger'
    };

    return severities[status] || 'secondary';
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
  }

  private validateForm(): boolean {
    if (!this.guestForm.lastName?.trim()) {
      alert('Введите фамилию');
      return false;
    }

    if (!this.guestForm.firstName?.trim()) {
      alert('Введите имя');
      return false;
    }

    if (!this.guestForm.birthDate) {
      alert('Укажите дату рождения');
      return false;
    }

    if (!this.guestForm.gender) {
      alert('Выберите пол');
      return false;
    }

    if (!this.guestForm.documentType) {
      alert('Выберите тип документа');
      return false;
    }

    if (!this.guestForm.documentNumber?.trim()) {
      alert('Введите номер документа');
      return false;
    }

    return true;
  }

  private normalizeCreateRequest(form: GuestCreateRequest): GuestCreateRequest {
    return {
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      middleName: this.emptyToNull(form.middleName),
      birthDate: form.birthDate,
      gender: form.gender,
      phone: this.emptyToNull(form.phone),
      email: this.emptyToNull(form.email),
      citizenship: this.emptyToNull(form.citizenship),
      documentType: form.documentType,
      documentNumber: form.documentNumber.trim(),
      documentIssueDate: this.emptyToNull(form.documentIssueDate),
      documentIssuedBy: this.emptyToNull(form.documentIssuedBy),
      address: this.emptyToNull(form.address),
      comment: this.emptyToNull(form.comment)
    };
  }

  private normalizeUpdateRequest(form: GuestCreateRequest): GuestUpdateRequest {
    return this.normalizeCreateRequest(form);
  }

  private emptyToNull(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private getEmptyGuestForm(): GuestCreateRequest {
    return {
      lastName: '',
      firstName: '',
      middleName: '',
      birthDate: '',
      gender: 'MALE',
      phone: '',
      email: '',
      citizenship: 'Россия',
      documentType: 'PASSPORT',
      documentNumber: '',
      documentIssueDate: '',
      documentIssuedBy: '',
      address: '',
      comment: ''
    };
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
