import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LegendItem {
  label: string;
  cssClass: string;
}

@Component({
  selector: 'app-booking-board-legend',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legend-card">
      <h4>Легенда</h4>
      <div class="legend-items">
        @for (item of legendItems; track item.cssClass) {
          <div class="legend-item">
            <span [class]="'legend-color ' + item.cssClass"></span>
            <span>{{ item.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .legend-card {
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      padding: 1rem 1.25rem;

      h4 {
        margin: 0 0 0.75rem 0;
        color: #2c3e50;
        font-size: 1rem;
      }
    }

    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #34495e;
      font-size: 0.9rem;
    }

    .legend-color {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.08);

      &.available { background: #eafaf1; }
      &.created { background: #fff3cd; }
      &.confirmed { background: #d6eaf8; }
      &.checked-in { background: #d5f5e3; }
      &.cancelled { background: #fadbd8; }
    }
  `]
})
export class BookingBoardLegendComponent {
  legendItems: LegendItem[] = [
    { label: 'Свободен', cssClass: 'available' },
    { label: 'Создано', cssClass: 'created' },
    { label: 'Подтверждено', cssClass: 'confirmed' },
    { label: 'Заселён', cssClass: 'checked-in' },
    { label: 'Отменено', cssClass: 'cancelled' }
  ];
}
