import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card">
      <h3>{{ title }}</h3>
      <div class="value-row">
        <p class="value" [class.money]="isMoney">{{ value }}</p>
        @if (badgeLabel) {
          <span class="badge">{{ badgeLabel }}</span>
        }
      </div>
      @if (note) {
        <span class="note">{{ note }}</span>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 160px;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

      h3 {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .value-row {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }

      .value {
        margin: 0;
        font-size: 2.2rem;
        font-weight: 800;
        color: #3498db;

        &.money {
          font-size: 1.55rem;
        }
      }

      .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        background: #e3f2fd;
        color: #1976d2;
      }

      .note {
        margin-top: auto;
        color: #7f8c8d;
        font-size: 0.85rem;
      }
    }
  `]
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() note = '';
  @Input() badgeLabel = '';
  @Input() isMoney = false;
}
