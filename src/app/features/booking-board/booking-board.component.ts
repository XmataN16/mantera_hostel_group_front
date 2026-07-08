import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { HotelService } from '../hotels/hotel.service';
import { ReservationService } from '../reservations/reservation.service';

import { HotelDto } from '../../shared/models/hotel.model';
import {
  BookingBoardCellResponse,
  BookingBoardRoomRow,
  ReservationStatus,
  RoomStatus
} from '../../shared/models/reservation.model';

@Component({
  selector: 'app-booking-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    TagModule
  ],
  templateUrl: './booking-board.component.html',
  styleUrl: './booking-board.component.scss'
})
export class BookingBoardComponent implements OnInit {
  private hotelService = inject(HotelService);
  private reservationService = inject(ReservationService);

  hotels = signal<HotelDto[]>([]);
  cells = signal<BookingBoardCellResponse[]>([]);

  selectedHotelId = signal<number | null>(null);
  fromDate = signal(this.getTodayIsoDate());
  toDate = signal(this.addDaysIsoDate(new Date(), 14));

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  dates = computed(() => this.buildDateRange(this.fromDate(), this.toDate()));

  rows = computed<BookingBoardRoomRow[]>(() => {
    const grouped = new Map<number, BookingBoardRoomRow>();

    for (const cell of this.cells()) {
      if (!grouped.has(cell.roomId)) {
        grouped.set(cell.roomId, {
          roomId: cell.roomId,
          roomNumber: cell.roomNumber,
          cells: []
        });
      }

      grouped.get(cell.roomId)!.cells.push(cell);
    }

    return Array
      .from(grouped.values())
      .map(row => ({
        ...row,
        cells: this.dates().map(date => {
          const foundCell = row.cells.find(cell => cell.date === date);

          return foundCell || {
            roomId: row.roomId,
            roomNumber: row.roomNumber,
            date,
            status: 'AVAILABLE',
            reservationId: null,
            reservationNumber: null,
            guestId: null
          };
        })
      }))
      .sort((a, b) => this.compareRoomNumbers(a.roomNumber, b.roomNumber));
  });

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.hotelService.getAll().subscribe({
      next: hotels => {
        this.hotels.set(hotels);

        if (hotels.length > 0 && !this.selectedHotelId()) {
          this.selectedHotelId.set(hotels[0].id);
          this.loadBoard();
        }
      },
      error: err => {
        this.errorMessage.set(
          'Ошибка загрузки отелей: ' + this.getErrorMessage(err)
        );
      }
    });
  }

  loadBoard(): void {
    const hotelId = this.selectedHotelId();

    if (!hotelId) {
      this.errorMessage.set('Выберите отель');
      return;
    }

    if (!this.fromDate() || !this.toDate()) {
      this.errorMessage.set('Укажите период');
      return;
    }

    if (this.toDate() <= this.fromDate()) {
      this.errorMessage.set('Дата окончания должна быть позже даты начала');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.reservationService.getBookingBoard(
      hotelId,
      this.fromDate(),
      this.toDate()
    ).subscribe({
      next: cells => {
        this.cells.set(cells);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMessage.set(
          'Ошибка загрузки шахматки: ' + this.getErrorMessage(err)
        );
      }
    });
  }

  onHotelChange(): void {
    this.loadBoard();
  }

  onPeriodChange(): void {
    this.cells.set([]);
  }

  setTodayPeriod(): void {
    const today = new Date();

    this.fromDate.set(this.toIsoDate(today));
    this.toDate.set(this.addDaysIsoDate(today, 14));

    this.loadBoard();
  }

  shiftPeriod(days: number): void {
    const from = this.parseIsoDate(this.fromDate());
    const to = this.parseIsoDate(this.toDate());

    from.setDate(from.getDate() + days);
    to.setDate(to.getDate() + days);

    this.fromDate.set(this.toIsoDate(from));
    this.toDate.set(this.toIsoDate(to));

    this.loadBoard();
  }

  getSelectedHotelName(): string {
    const hotel = this.hotels().find(item => item.id === this.selectedHotelId());
    return hotel?.name || 'Отель не выбран';
  }

  isReservedCell(cell: BookingBoardCellResponse): boolean {
    return !!cell.reservationId;
  }

  getCellTitle(cell: BookingBoardCellResponse): string {
    if (cell.reservationId) {
      return `${cell.reservationNumber || 'Бронь'} — ${this.getStatusLabel(cell.status)}`;
    }

    return this.getStatusLabel(cell.status);
  }

  getCellClass(cell: BookingBoardCellResponse): string {
    const status = cell.status;

    if (cell.reservationId) {
      return `board-cell reservation status-${String(status).toLowerCase()}`;
    }

    return `board-cell room-status status-${String(status).toLowerCase()}`;
  }

  getShortCellText(cell: BookingBoardCellResponse): string {
    if (cell.reservationNumber) {
      return cell.reservationNumber.replace('RES-DEMO-', '№');
    }

    if (cell.status === 'MAINTENANCE') {
      return 'Ремонт';
    }

    if (cell.status === 'OUT_OF_SERVICE') {
      return 'Недост.';
    }

    if (cell.status === 'OCCUPIED') {
      return 'Занят';
    }

    return '';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      AVAILABLE: 'Свободен',
      OCCUPIED: 'Занят',
      MAINTENANCE: 'Ремонт',
      OUT_OF_SERVICE: 'Недоступен',

      CREATED: 'Создано',
      CONFIRMED: 'Подтверждено',
      CHECKED_IN: 'Заселён',
      CHECKED_OUT: 'Выселен',
      CANCELLED: 'Отменено',
      NO_SHOW: 'Не заехал'
    };

    return labels[status] || status;
  }

  getStatusSeverity(
    status: ReservationStatus | RoomStatus | string
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      AVAILABLE: 'success',
      OCCUPIED: 'warning',
      MAINTENANCE: 'danger',
      OUT_OF_SERVICE: 'danger',

      CREATED: 'warning',
      CONFIRMED: 'info',
      CHECKED_IN: 'success',
      CHECKED_OUT: 'secondary',
      CANCELLED: 'danger',
      NO_SHOW: 'danger'
    };

    return severities[status] || 'secondary';
  }

  formatDateHeader(dateIso: string): string {
    const date = this.parseIsoDate(dateIso);

    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  }

  formatWeekday(dateIso: string): string {
    const date = this.parseIsoDate(dateIso);

    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'short'
    }).format(date);
  }

  isWeekend(dateIso: string): boolean {
    const day = this.parseIsoDate(dateIso).getDay();
    return day === 0 || day === 6;
  }

  private buildDateRange(fromIso: string, toIso: string): string[] {
    if (!fromIso || !toIso || toIso <= fromIso) {
      return [];
    }

    const result: string[] = [];
    const current = this.parseIsoDate(fromIso);
    const end = this.parseIsoDate(toIso);

    while (current < end) {
      result.push(this.toIsoDate(current));
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  private compareRoomNumbers(a: string, b: string): number {
    const numberA = Number(a);
    const numberB = Number(b);

    if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
      return numberA - numberB;
    }

    return a.localeCompare(b, 'ru');
  }

  private getTodayIsoDate(): string {
    return this.toIsoDate(new Date());
  }

  private addDaysIsoDate(date: Date, days: number): string {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return this.toIsoDate(copy);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private parseIsoDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
