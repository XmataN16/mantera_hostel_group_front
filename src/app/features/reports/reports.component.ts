import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { HotelService } from '../hotels/hotel.service';
import { ReportService } from './report.service';

import { HotelDto } from '../../shared/models/hotel.model';
import {
  CheckInOutReportResponse,
  DebtReportResponse,
  OccupancyReportResponse,
  RevenueReportResponse,
  RoomTypeDistributionItemResponse
} from '../../shared/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    TableModule,
    TagModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  private hotelService = inject(HotelService);
  private reportService = inject(ReportService);

  hotels = signal<HotelDto[]>([]);

  selectedHotelId = signal<number | null>(null);
  reportDate = signal(this.getTodayIsoDate());
  fromDate = signal(this.getFirstDayOfCurrentMonthIso());
  toDate = signal(this.getTodayIsoDate());

  occupancyReport = signal<OccupancyReportResponse | null>(null);
  checkInOutReport = signal<CheckInOutReportResponse | null>(null);
  revenueReport = signal<RevenueReportResponse | null>(null);
  debtReport = signal<DebtReportResponse | null>(null);
  roomTypeDistribution = signal<RoomTypeDistributionItemResponse[]>([]);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  maxDistributionCount = computed(() => {
    const values = this.roomTypeDistribution().map(item => item.staysCount);
    return values.length ? Math.max(...values) : 0;
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
          this.loadReports();
        }
      },
      error: err => {
        this.errorMessage.set(
          'Ошибка загрузки отелей: ' + this.getErrorMessage(err)
        );
      }
    });
  }

  loadReports(): void {
    const hotelId = this.selectedHotelId();

    if (!hotelId) {
      this.errorMessage.set('Выберите отель');
      return;
    }

    if (!this.reportDate()) {
      this.errorMessage.set('Укажите дату отчёта');
      return;
    }

    if (!this.fromDate() || !this.toDate()) {
      this.errorMessage.set('Укажите период отчёта');
      return;
    }

    if (this.toDate() < this.fromDate()) {
      this.errorMessage.set('Дата окончания периода не может быть раньше даты начала');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      occupancy: this.reportService.getOccupancy(hotelId, this.reportDate()),
      checkInOut: this.reportService.getCheckInsCheckOuts(hotelId, this.reportDate()),
      revenue: this.reportService.getRevenue(hotelId, this.fromDate(), this.toDate()),
      debts: this.reportService.getDebts(hotelId),
      distribution: this.reportService.getRoomTypeDistribution(
        hotelId,
        this.fromDate(),
        this.toDate()
      )
    }).subscribe({
      next: result => {
        this.occupancyReport.set(result.occupancy);
        this.checkInOutReport.set(result.checkInOut);
        this.revenueReport.set(result.revenue);
        this.debtReport.set(result.debts);
        this.roomTypeDistribution.set(result.distribution);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMessage.set(
          'Ошибка загрузки отчётов: ' + this.getErrorMessage(err)
        );
      }
    });
  }

  onHotelChange(): void {
    this.loadReports();
  }

  setToday(): void {
    this.reportDate.set(this.getTodayIsoDate());
    this.loadReports();
  }

  setCurrentMonth(): void {
    this.fromDate.set(this.getFirstDayOfCurrentMonthIso());
    this.toDate.set(this.getTodayIsoDate());
    this.loadReports();
  }

  getSelectedHotelName(): string {
    const hotel = this.hotels()
      .find(item => item.id === this.selectedHotelId());

    return hotel?.name || 'Отель не выбран';
  }

  getDistributionPercent(item: RoomTypeDistributionItemResponse): number {
    const max = this.maxDistributionCount();

    if (!max) {
      return 0;
    }

    return Math.round((item.staysCount / max) * 100);
  }

  getOccupancySeverity(): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const percent = this.occupancyReport()?.occupancyPercent || 0;

    if (percent >= 80) {
      return 'success';
    }

    if (percent >= 50) {
      return 'info';
    }

    if (percent >= 25) {
      return 'warning';
    }

    return 'secondary';
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

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('ru-RU').format(this.parseIsoDate(value));
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

  private parseIsoDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
