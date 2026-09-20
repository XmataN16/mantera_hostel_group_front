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
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { BookingBoardLegendComponent } from '../../shared/components/booking-board-legend.component';
import { BookingBoardCellComponent } from '../../shared/components/booking-board-cell.component';

interface DropdownOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-booking-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    TagModule,
    PageHeaderComponent,
    EmptyStateComponent,
    BookingBoardLegendComponent,
    BookingBoardCellComponent
  ],
  templateUrl: './booking-board.component.html',
  styleUrl: './booking-board.component.scss'
})
export class BookingBoardComponent implements OnInit {
  private hotelService = inject(HotelService);
  private reservationService = inject(ReservationService);

  hotels = signal<HotelDto[]>([]);
  selectedHotelId = signal<number | null>(null);
  fromDate = signal(this.getTodayIsoDate());
  toDate = signal(this.addDaysIsoDate(new Date(), 14));
  cells = signal<BookingBoardRoomRow[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  dates = computed(() => {
    const from = this.parseIsoDate(this.fromDate());
    const to = this.parseIsoDate(this.toDate());
    const result: string[] = [];
    const current = new Date(from);
    while (current <= to) {
      result.push(this.toIsoDate(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
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
        this.errorMessage.set('Ошибка загрузки отелей: ' + this.getErrorMessage(err));
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
    if (this.toDate() < this.fromDate()) {
      this.errorMessage.set('Дата окончания не может быть раньше даты начала');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.reservationService.getBookingBoard(hotelId, this.fromDate(), this.toDate()).subscribe({
      next: cells => {
        this.cells.set(this.groupCellsByRoom(cells));
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMessage.set('Ошибка загрузки шахматки: ' + this.getErrorMessage(err));
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

  isWeekend(dateStr: string): boolean {
    const date = this.parseIsoDate(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  formatDate(dateStr: string): string {
    const date = this.parseIsoDate(dateStr);
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(date);
  }

  formatDayOfWeek(dateStr: string): string {
    const date = this.parseIsoDate(dateStr);
    return new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date);
  }

  private groupCellsByRoom(cells: BookingBoardCellResponse[]): BookingBoardRoomRow[] {
    const roomMap = new Map<number, BookingBoardRoomRow>();
    const dates = this.dates();

    cells.forEach(cell => {
      if (!roomMap.has(cell.roomId)) {
        roomMap.set(cell.roomId, {
          roomId: cell.roomId,
          roomNumber: cell.roomNumber,
          cells: []
        });
      }
      const room = roomMap.get(cell.roomId)!;
      room.cells.push(cell);
    });

    const rows = Array.from(roomMap.values());

    rows.forEach(row => {
      const existingCells = new Map(row.cells.map(c => [c.date, c]));
      const completeCells: BookingBoardCellResponse[] = dates.map(date => {
        return existingCells.get(date) || {
          roomId: row.roomId,
          roomNumber: row.roomNumber,
          date,
          status: 'AVAILABLE',
          reservationId: null,
          reservationNumber: null,
          guestId: null
        };
      });
      row.cells = completeCells;
    });

    return rows.sort((a, b) => this.compareRoomNumbers(a.roomNumber, b.roomNumber));
  }

  private compareRoomNumbers(a: string, b: string): number {
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.localeCompare(b);
  }

  private getTodayIsoDate(): string {
    return this.toIsoDate(new Date());
  }

  private addDaysIsoDate(date: Date, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return this.toIsoDate(result);
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
