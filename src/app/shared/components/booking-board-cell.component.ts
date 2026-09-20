import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingBoardCellResponse } from '../models/reservation.model';

@Component({
  selector: 'app-booking-board-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <td class="board-cell" [class]="getCellStatusClass(cell.status)">
      @if (cell.reservationNumber) {
        <div class="reservation-content">
          <strong>{{ cell.reservationNumber }}</strong>
          @if (cell.guestId) {
            <small>Гость ID: {{ cell.guestId }}</small>
          }
        </div>
      } @else {
        <span class="empty-cell-text">{{ getCellLabel(cell) }}</span>
      }
    </td>
  `,
  styles: [`
    .board-cell {
      min-width: 94px;
      height: 58px;
      padding: 0.35rem;
      text-align: center;
      vertical-align: middle;
      transition: transform 0.12s, box-shadow 0.12s;

      &:hover {
        transform: scale(1.02);
        box-shadow: inset 0 0 0 2px rgba(52, 152, 219, 0.35);
      }
    }

    .reservation-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      line-height: 1.1;

      strong {
        font-size: 0.8rem;
      }

      small {
        font-size: 0.7rem;
        opacity: 0.85;
      }
    }

    .empty-cell-text {
      color: #7f8c8d;
      font-size: 0.78rem;
    }

    .status-available { background: #eafaf1; color: #1e8449; }
    .status-created { background: #fff3cd; color: #856404; }
    .status-confirmed { background: #d6eaf8; color: #154360; }
    .status-checked-in { background: #d5f5e3; color: #145a32; }
    .status-cancelled { background: #fadbd8; color: #922b21; }
    .status-maintenance { background: #fdebd0; color: #7d6608; }
    .status-out-of-service { background: #f5b7b1; color: #7b241c; }
  `]
})
export class BookingBoardCellComponent {
  @Input() cell!: BookingBoardCellResponse;

  getCellStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'AVAILABLE': 'status-available',
      'CREATED': 'status-created',
      'CONFIRMED': 'status-confirmed',
      'CHECKED_IN': 'status-checked-in',
      'CANCELLED': 'status-cancelled',
      'MAINTENANCE': 'status-maintenance',
      'OUT_OF_SERVICE': 'status-out-of-service'
    };
    return statusMap[status] || '';
  }

  getCellLabel(cell: BookingBoardCellResponse): string {
    if (cell.status === 'AVAILABLE') return 'Свободен';
    if (cell.status === 'MAINTENANCE') return 'Ремонт';
    if (cell.status === 'OUT_OF_SERVICE') return 'Недоступен';
    return '';
  }
}
