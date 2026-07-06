import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Дашборд</h1>
      <p>Добро пожаловать в систему управления отелями Mantera!</p>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Активных бронирований</h3>
          <p class="value">--</p>
        </div>
        <div class="stat-card">
          <h3>Загрузка сегодня</h3>
          <p class="value">--%</p>
        </div>
        <div class="stat-card">
          <h3>Свободных номеров</h3>
          <p class="value">--</p>
        </div>
        <div class="stat-card">
          <h3>Выручка за месяц</h3>
          <p class="value">-- ₽</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
    }

    h1 {
      margin-bottom: 2rem;
      color: #2c3e50;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      h3 {
        margin: 0 0 1rem;
        color: #7f8c8d;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .value {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        color: #3498db;
      }
    }
  `]
})
export class DashboardComponent {}
