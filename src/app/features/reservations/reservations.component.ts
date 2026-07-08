import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { HotelService } from '../hotels/hotel.service';
import { GuestService } from '../guests/guest.service';
import { ReservationService } from './reservation.service';

import { HotelDto } from '../../shared/models/hotel.model';
import { GuestResponse } from '../../shared/models/guest.model';
import {
  AvailabilityRoomResponse,
  ReservationCreateRequest,
  ReservationResponse,
  ReservationSource,
  ReservationStatus
} from '../../shared/models/reservation.model';

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
    DialogModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    InputTextModule,
    TagModule
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private hotelService = inject(HotelService);
  private guestService = inject(GuestService);

  reservations = signal<ReservationResponse[]>([]);
  hotels = signal<HotelDto[]>([]);
  guests = signal<GuestResponse[]>([]);
  availableRooms = signal<AvailableRoomOption[]>([]);

  isLoading = signal(false);
  isSaving = signal(false);
  isLoadingRooms = signal(false);
  displayCreateDialog = signal(false);

  selectedHotelFilterId = signal<number | null>(null);

  sourceOptions: DropdownOption<ReservationSource>[] = [
    { label: 'Напрямую', value: 'DIRECT' },
    { label: 'Телефон', value: 'PHONE' },
    { label: 'Сайт', value: 'WEBSITE' },
    { label: 'Агентство', value: 'AGENCY' },
    { label: 'Платформа бронирования', value: 'BOOKING_PLATFORM' }
  ];

  newReservation = this.getEmptyReservationForm();

  selectedRoomId: number | null = null;

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

  openCreateDialog(): void {
    this.newReservation = this.getEmptyReservationForm();
    this.selectedRoomId = null;
    this.availableRooms.set([]);
    this.displayCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.displayCreateDialog.set(false);
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

  onBookingParamsChange(): void {
    this.selectedRoomId = null;
    this.availableRooms.set([]);

    if (
      !this.newReservation.hotelId ||
      !this.newReservation.checkInDate ||
      !this.newReservation.checkOutDate
    ) {
      return;
    }

    if (this.newReservation.checkOutDate <= this.newReservation.checkInDate) {
      return;
    }

    this.loadAvailableRooms();
  }

  loadAvailableRooms(): void {
    if (
      !this.newReservation.hotelId ||
      !this.newReservation.checkInDate ||
      !this.newReservation.checkOutDate
    ) {
      return;
    }

    this.isLoadingRooms.set(true);

    this.reservationService.getAvailableRooms(
      this.newReservation.hotelId,
      this.newReservation.checkInDate,
      this.newReservation.checkOutDate
    ).subscribe({
      next: rooms => {
        const options = rooms.map(room => ({
          ...room,
          displayName:
            `№ ${room.roomNumber} — ${room.roomTypeName}, ` +
            `${room.capacity} гост., ${this.formatMoney(room.basePrice)}`
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

  saveReservation(): void {
    if (!this.validateReservationForm()) {
      return;
    }

    const selectedRoom = this.availableRooms()
      .find(room => room.id === this.selectedRoomId);

    if (!selectedRoom) {
      alert('Выберите свободный номер');
      return;
    }

    const guestsCount = this.newReservation.adults + this.newReservation.children;

    const request: ReservationCreateRequest = {
      ...this.newReservation,
      reservationNumber: this.newReservation.reservationNumber || null,
      comment: this.newReservation.comment || null,
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
    const confirmed = confirm(
      `Отменить бронирование ${reservation.reservationNumber}?`
    );

    if (!confirmed) {
      return;
    }

    this.reservationService.cancel(reservation.id).subscribe({
      next: () => this.loadReservations(),
      error: err => alert('Ошибка отмены: ' + this.getErrorMessage(err))
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
    return reservation.status !== 'CHECKED_OUT'
      && reservation.status !== 'CANCELLED';
  }

  getHotelName(hotelId: number): string {
    return this.hotels().find(hotel => hotel.id === hotelId)?.name || `ID ${hotelId}`;
  }

  getGuestName(guestId: number): string {
    const guest = this.guests().find(item => item.id === guestId);

    if (!guest) {
      return `ID ${guestId}`;
    }

    return [guest.lastName, guest.firstName, guest.middleName]
      .filter(Boolean)
      .join(' ');
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

  formatMoney(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  private validateReservationForm(): boolean {
    if (!this.newReservation.hotelId) {
      alert('Выберите отель');
      return false;
    }

    if (!this.newReservation.guestId) {
      alert('Выберите гостя');
      return false;
    }

    if (!this.newReservation.checkInDate || !this.newReservation.checkOutDate) {
      alert('Укажите даты заезда и выезда');
      return false;
    }

    if (this.newReservation.checkOutDate <= this.newReservation.checkInDate) {
      alert('Дата выезда должна быть позже даты заезда');
      return false;
    }

    if (!this.newReservation.adults || this.newReservation.adults < 1) {
      alert('Количество взрослых должно быть не меньше 1');
      return false;
    }

    if (!this.selectedRoomId) {
      alert('Выберите свободный номер');
      return false;
    }

    return true;
  }

  private getEmptyReservationForm(): ReservationCreateRequest {
    return {
      hotelId: 0,
      guestId: 0,
      reservationNumber: '',
      source: 'DIRECT',
      checkInDate: '',
      checkOutDate: '',
      adults: 1,
      children: 0,
      comment: '',
      rooms: []
    };
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
