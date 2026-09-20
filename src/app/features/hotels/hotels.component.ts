import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HotelService } from './hotel.service';
import { HotelDto, HotelCreateRequest } from '../../shared/models/hotel.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss'
})
export class HotelsComponent implements OnInit {
  private hotelService = inject(HotelService);

  hotels = signal<HotelDto[]>([]);
  displayDialog = signal(false);
  isLoading = signal(false);

  newHotel: HotelCreateRequest = {
    name: '',
    shortName: '',
    address: '',
    phone: '',
    email: '',
    timezone: 'Europe/Moscow'
  };

  ngOnInit() {
    this.loadHotels();
  }

  loadHotels() {
    this.isLoading.set(true);
    this.hotelService.getAll().subscribe({
      next: (data) => {
        this.hotels.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openDialog() {
    this.displayDialog.set(true);
  }

  saveHotel() {
    this.hotelService.create(this.newHotel).subscribe({
      next: () => {
        this.displayDialog.set(false);
        this.resetForm();
        this.loadHotels();
      },
      error: (err) => {
        alert('Ошибка сохранения: ' + (err.error?.message || 'Неизвестная ошибка'));
      }
    });
  }

  resetForm() {
    this.newHotel = {
      name: '',
      shortName: '',
      address: '',
      phone: '',
      email: '',
      timezone: 'Europe/Moscow'
    };
  }

  getHotelStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'ACTIVE' ? 'success' : 'danger';
  }

  getHotelStatusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Активен' : 'Неактивен';
  }
}
