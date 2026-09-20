import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { HotelService } from '../hotels/hotel.service';
import { GuestService } from '../guests/guest.service';
import { ReservationService } from './reservation.service';
import { BillingService } from '../billing/billing.service';
import { HotelDto } from '../../shared/models/hotel.model';
import { GuestResponse } from '../../shared/models/guest.model';
import {
  AvailabilityRoomResponse,
  ReservationCreateRequest,
  ReservationResponse,
  ReservationSource,
  ReservationStatus
} from '../../shared/models/reservation.model';
import { InvoiceResponse, AdditionalServiceDto } from '../../shared/models/billing.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ReservationFormComponent } from '../../shared/components/reservation-form.component';
import { InvoiceDialogComponent } from '../../shared/components/invoice-dialog.component';

interface DropdownOption<T = string> {
  label: string;
  value: T;
}

interface AvailableRoomOption extends AvailabilityRoomResponse {
  displayName: string;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    TagModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ReservationFormComponent,
    InvoiceDialogComponent
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private hotelService = inject(HotelService);
  private guestService = inject(GuestService);
  private billingService = inject(BillingService);

  reservations = signal<ReservationResponse[]>([]);
  hotels = signal<HotelDto[]>([]);
  guests = signal<GuestResponse[]>([]);
  availableRooms = signal<AvailableRoomOption[]>([]);

  isLoading = signal(false);
  isSaving = signal(false);
  isLoadingRooms = signal(false);
  displayCreateDialog = signal(false);

  selectedHotelFilterId = signal<number | null>(null);

  // Invoice dialog
  invoice = signal<InvoiceResponse | null>(null);
  availableServices = signal<AdditionalServiceDto[]>([]);
  displayInvoiceDialog = signal(false);
  isInvoiceLoading = signal(false);

  ngOnInit(): void {
    this.loadDictionaries();
    this.loadReservations();
  }

  loadDictionaries(): void {
    this.hotelService.getAll().subscribe({
      next: hotels => this.hotels.set(hotels),
      error: () => alert('Не удалось загрузить список отелей')
    });

    this.guestService.getAll().subscribe({
      next: guests => this.guests.set(guests),
      error: () => alert('Не удалось загрузить список гостей')
    });
  }

  loadReservations(): void {
    this.isLoading.set(true);
    this.reservationService.getAll().subscribe({
      next: reservations => {
        this.reservations.set(reservations);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        alert('Ошибка загрузки бронирований: ' + this.getErrorMessage(err));
      }
    });
  }

  onHotelFilterChange(hotelId: number | null): void {
    this.selectedHotelFilterId.set(hotelId);
  }

  getFilteredReservations(): ReservationResponse[] {
    const hotelId = this.selectedHotelFilterId();
    if (!hotelId) {
      return this.reservations();
    }
    return this.reservations().filter(reservation => reservation.hotelId === hotelId);
  }

  openCreateDialog(): void {
    this.displayCreateDialog.set(true);
  }

  onBookingParamsChange(params: { hotelId: number; checkInDate: string; checkOutDate: string }): void {
    this.loadAvailableRooms(params.hotelId, params.checkInDate, params.checkOutDate);
  }

  loadAvailableRooms(hotelId: number, checkInDate: string, checkOutDate: string): void {
    this.isLoadingRooms.set(true);
    this.reservationService.getAvailableRooms(hotelId, checkInDate, checkOutDate).subscribe({
      next: rooms => {
        const options = rooms.map(room => ({
          ...room,
          displayName: `№ ${room.roomNumber} — ${room.roomTypeName}, ${room.capacity} гост., ${this.formatMoney(room.basePrice)}`
        }));
        this.availableRooms.set(options);
        this.isLoadingRooms.set(false);
      },
      error: err => {
        this.isLoadingRooms.set(false);
        alert('Ошибка поиска свободных номеров: ' + this.getErrorMessage(err));
      }
    });
  }

  onSaveReservation(event: { form: ReservationCreateRequest; selectedRoomId: number | null }): void {
    const { form, selectedRoomId } = event;

    if (!form.hotelId || !form.guestId || !form.checkInDate || !form.checkOutDate || !selectedRoomId) {
      alert('Заполните все обязательные поля');
      return;
    }

    const selectedRoom = this.availableRooms().find(room => room.id === selectedRoomId);
    if (!selectedRoom) {
      alert('Выберите свободный номер');
      return;
    }

    const guestsCount = form.adults + form.children;
    const request: ReservationCreateRequest = {
      ...form,
      reservationNumber: form.reservationNumber || null,
      comment: form.comment || null,
      rooms: [
        {
          roomTypeId: selectedRoom.roomTypeId,
          roomId: selectedRoom.id,
          ratePlanId: null,
          guestsCount: guestsCount > 0 ? guestsCount : 1,
          pricePerNight: selectedRoom.basePrice
        }
      ]
    };

    this.isSaving.set(true);
    this.reservationService.create(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.displayCreateDialog.set(false);
        this.loadReservations();
      },
      error: err => {
        this.isSaving.set(false);
        alert('Ошибка создания бронирования: ' + this.getErrorMessage(err));
      }
    });
  }

  confirmReservation(reservation: ReservationResponse): void {
    this.reservationService.confirm(reservation.id).subscribe({
      next: () => this.loadReservations(),
      error: err => alert('Ошибка подтверждения: ' + this.getErrorMessage(err))
    });
  }

  checkInReservation(reservation: ReservationResponse): void {
    this.reservationService.checkIn(reservation.id).subscribe({
      next: () => this.loadReservations(),
      error: err => alert('Ошибка заселения: ' + this.getErrorMessage(err))
    });
  }

  checkOutReservation(reservation: ReservationResponse): void {
    this.reservationService.checkOut(reservation.id).subscribe({
      next: () => this.loadReservations(),
      error: err => alert('Ошибка выселения: ' + this.getErrorMessage(err))
    });
  }

  cancelReservation(reservation: ReservationResponse): void {
    const confirmed = confirm(`Отменить бронирование ${reservation.reservationNumber}?`);
    if (!confirmed) return;

    this.reservationService.cancel(reservation.id).subscribe({
      next: () => this.loadReservations(),
      error: err => alert('Ошибка отмены: ' + this.getErrorMessage(err))
    });
  }

  openInvoiceDialog(reservationId: number, hotelId: number): void {
    this.displayInvoiceDialog.set(true);
    this.isInvoiceLoading.set(true);
    this.invoice.set(null);

    this.billingService.getInvoice(reservationId).subscribe({
      next: inv => {
        this.invoice.set(inv);
        this.isInvoiceLoading.set(false);
      },
      error: () => this.isInvoiceLoading.set(false)
    });

    this.billingService.getAvailableServices(hotelId).subscribe({
      next: services => this.availableServices.set(services)
    });
  }

  onAddService(event: { serviceId: number; quantity: number }): void {
    const inv = this.invoice();
    if (!inv) return;

    this.billingService.addService(inv.reservationId, event.serviceId, event.quantity).subscribe({
      next: () => {
        this.openInvoiceDialog(inv.reservationId, 0);
        this.loadReservations();
      },
      error: err => alert('Ошибка добавления услуги: ' + this.getErrorMessage(err))
    });
  }

  onAddPayment(event: { amount: number; method: string; comment: string }): void {
    const inv = this.invoice();
    if (!inv) return;

    this.billingService.addPayment(inv.reservationId, event.amount, event.method, event.comment).subscribe({
      next: () => {
        this.openInvoiceDialog(inv.reservationId, 0);
        this.loadReservations();
      },
      error: err => alert('Ошибка регистрации оплаты: ' + this.getErrorMessage(err))
    });
  }

  canConfirm(reservation: ReservationResponse): boolean {
    return reservation.status === 'CREATED';
  }

  canCheckIn(reservation: ReservationResponse): boolean {
    return reservation.status === 'CREATED' || reservation.status === 'CONFIRMED';
  }

  canCheckOut(reservation: ReservationResponse): boolean {
    return reservation.status === 'CHECKED_IN';
  }

  canCancel(reservation: ReservationResponse): boolean {
    return reservation.status !== 'CHECKED_OUT' && reservation.status !== 'CANCELLED';
  }

  getHotelName(hotelId: number): string {
    return this.hotels().find(hotel => hotel.id === hotelId)?.name || `ID ${hotelId}`;
  }

  getGuestName(guestId: number): string {
    const guest = this.guests().find(item => item.id === guestId);
    if (!guest) return `ID ${guestId}`;
    return [guest.lastName, guest.firstName, guest.middleName].filter(Boolean).join(' ');
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
    return labels[status];
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
    return severities[status];
  }

  getSourceLabel(source: ReservationSource): string {
    const labels: Record<ReservationSource, string> = {
      DIRECT: 'Напрямую',
      PHONE: 'Телефон',
      WEBSITE: 'Сайт',
      AGENCY: 'Агентство',
      BOOKING_PLATFORM: 'Платформа'
    };
    return labels[source];
  }

  formatMoney(value: number | null | undefined): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
