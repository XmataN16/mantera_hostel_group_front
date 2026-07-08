import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { HotelService } from '../hotels/hotel.service';
import { ReservationService } from '../reservations/reservation.service';
import { ReportService } from '../reports/report.service';

import { HotelDto } from '../../shared/models/hotel.model';
import { OccupancyReportResponse, RevenueReportResponse } from '../../shared/models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>Дашборд</h1>
          <p>Оперативная сводка по сети отелей Mantera</p>
        </div>

        <a routerLink="/reports" class="reports-link">
          Открыть отчёты
        </a>
      </div>

      @if (errorMessage()) {
        <div class="error-message">
          {{ errorMessage() }}
        </div>
      }

      <div class="hotel-context">
        <span>Текущий отель:</span>
        <strong>{{ selectedHotel()?.name || 'не выбран' }}</strong>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Активных бронирований</h3>
          <p class="value">{{ activeReservationsCount() }}</p>
          <span>Созданные, подтверждённые и текущие проживания</span>
        </div>

        <div class="stat-card">
          <h3>Загрузка сегодня</h3>
          <p class="value">{{ formatPercent(occupancyReport()?.occupancyPercent) }}</p>
          <span>
            {{ occupancyReport()?.occupiedRooms || 0 }}
            занято из
            {{ occupancyReport()?.totalRooms || 0 }}
          </span>
        </div>

        <div class="stat-card">
          <h3>Свободных номеров</h3>
          <p class="value">{{ occupancyReport()?.availableRooms || 0 }}</p>
          <span>
            Недоступно: {{ occupancyReport()?.maintenanceRooms || 0 }}
          </span>
        </div>

        <div class="stat-card">
          <h3>Выручка за месяц</h3>
          <p class="value money">
            {{ formatMoney(revenueReport()?.totalRevenue) }}
          </p>
          <span>По проживанию и услугам</span>
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="/reservations" class="quick-card">
          <strong>Бронирования</strong>
          <span>Управление заявками, заездами и выездами</span>
        </a>

        <a routerLink="/reservations/booking-board" class="quick-card">
          <strong>Шахматка</strong>
          <span>Календарь занятости номерного фонда</span>
        </a>

        <a routerLink="/guests" class="quick-card">
          <strong>Гости</strong>
          <span>Справочник гостей и история проживаний</span>
        </a>

        <a routerLink="/reports" class="quick-card">
          <strong>Отчёты</strong>
          <span>Загрузка, выручка, долги и распределение</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 1280px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;

      h1 {
        margin: 0;
        color: #2c3e50;
        font-size: 2rem;
      }

      p {
        margin: 0.35rem 0 0;
        color: #7f8c8d;
      }
    }

    .reports-link {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: #3498db;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
    }

    .error-message {
      padding: 0.875rem 1rem;
      border-radius: 8px;
      background: #fee;
      color: #c0392b;
      border: 1px solid #f5b7b1;
    }

    .hotel-context {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 10px;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      span {
        color: #7f8c8d;
      }

      strong {
        color: #2c3e50;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(180px, 1fr));
      gap: 1.5rem;
    }

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

      .value {
        margin: 0;
        font-size: 2.2rem;
        font-weight: 800;
        color: #3498db;

        &.money {
          font-size: 1.55rem;
        }
      }

      span {
        margin-top: auto;
        color: #7f8c8d;
        font-size: 0.85rem;
      }
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, minmax(180px, 1fr));
      gap: 1rem;
    }

    .quick-card {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 1.25rem;
      border-radius: 12px;
      background: #ffffff;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: transform 0.15s, box-shadow 0.15s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
      }

      strong {
        color: #2c3e50;
      }

      span {
        color: #7f8c8d;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 1100px) {
      .stats-grid,
      .quick-actions {
        grid-template-columns: repeat(2, minmax(180px, 1fr));
      }
    }

    @media (max-width: 700px) {
      .page-header {
        flex-direction: column;
      }

      .stats-grid,
      .quick-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private hotelService = inject(HotelService);
  private reservationService = inject(ReservationService);
  private reportService = inject(ReportService);

  hotels = signal<HotelDto[]>([]);
  selectedHotel = signal<HotelDto | null>(null);

  activeReservationsCount = signal(0);
  occupancyReport = signal<OccupancyReportResponse | null>(null);
  revenueReport = signal<RevenueReportResponse | null>(null);

  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.hotelService.getAll().subscribe({
      next: hotels => {
        this.hotels.set(hotels);

        if (hotels.length === 0) {
          this.errorMessage.set('В системе нет отелей');
          return;
        }

        this.selectedHotel.set(hotels[0]);
        this.loadStats(hotels[0].id);
      },
      error: err => {
        this.errorMessage.set(
          'Ошибка загрузки отелей: ' + this.getErrorMessage(err)
        );
      }
    });
  }

  loadStats(hotelId: number): void {
    const today = this.getTodayIsoDate();
    const monthStart = this.getFirstDayOfCurrentMonthIso();

    this.reservationService.getAll().subscribe({
      next: reservations => {
        const activeCount = reservations.filter(reservation =>
          reservation.hotelId === hotelId &&
          ['CREATED', 'CONFIRMED', 'CHECKED_IN'].includes(reservation.status)
        ).length;

        this.activeReservationsCount.set(activeCount);
      },
      error: () => {
        this.activeReservationsCount.set(0);
      }
    });

    forkJoin({
      occupancy: this.reportService.getOccupancy(hotelId, today),
      revenue: this.reportService.getRevenue(hotelId, monthStart, today)
    }).subscribe({
      next: result => {
        this.occupancyReport.set(result.occupancy);
        this.revenueReport.set(result.revenue);
      },
      error: err => {
        this.errorMessage.set(
          'Не удалось загрузить показатели дашборда: ' + this.getErrorMessage(err)
        );
      }
    });
  }

  formatMoney(value: number | null | undefined): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  formatPercent(value: number | null | undefined): string {
    return `${Math.round(value || 0)}%`;
  }

  private getTodayIsoDate(): string {
    return this.toIsoDate(new Date());
  }

  private getFirstDayOfCurrentMonthIso(): string {
    const now = new Date();
    return this.toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}