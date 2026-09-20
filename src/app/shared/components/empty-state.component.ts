import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;

      p {
        margin: 0;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() message = 'Данные не найдены';
}
