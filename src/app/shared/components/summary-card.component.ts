import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-card" [class.danger]="isDanger">
      <div class="card-label">{{ label }}</div>
      <div class="card-value" [class.money]="isMoney">{{ value }}</div>
      @if (note) {
        <span class="card-note">{{ note }}</span>
      }
    </div>
  `,
  styles: [`
    .summary-card {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      min-height: 130px;
      padding: 1.25rem;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

      &.danger {
        border-left: 4px solid #e74c3c;
      }

      .card-label {
        color: #7f8c8d;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .card-value {
        color: #2c3e50;
        font-size: 2rem;
        font-weight: 800;

        &.money {
          font-size: 1.45rem;
        }
      }

      .card-note {
        margin-top: auto;
        color: #7f8c8d;
        font-size: 0.85rem;
      }
    }
  `]
})
export class SummaryCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() note = '';
  @Input() isMoney = false;
  @Input() isDanger = false;
}
