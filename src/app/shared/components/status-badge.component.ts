import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'status-badge ' + badgeClass">
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-block;
    }

    .success { background: #e6f7ee; color: #27ae60; }
    .warning { background: #fff3cd; color: #f39c12; }
    .danger { background: #fde8e8; color: #e74c3c; }
    .info { background: #d6eaf8; color: #21618c; }
    .secondary { background: #e5e7eb; color: #4b5563; }
  `]
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary' = 'secondary';

  get badgeClass(): string {
    return this.severity;
  }
}
