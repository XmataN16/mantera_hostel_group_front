import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HotelService } from './hotel.service';
import { HotelDto, HotelCreateRequest } from '../../shared/models/hotel.model';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss'
})
export class HotelsComponent implements OnInit {
  private hotelService = inject(HotelService);

  // Сигналы для реактивного состояния
  hotels = signal<HotelDto[]>([]);
  displayDialog = signal(false);
  isLoading = signal(false);

  // Модель для формы создания
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
        this.loadHotels(); // Перезагружаем таблицу
      },
      error: (err) => {
        alert('Ошибка сохранения: ' + (err.error?.message || 'Неизвестная ошибка'));
      }
    });
  }

  resetForm() {
    this.newHotel = {
      name: '', shortName: '', address: '', phone: '', email: '', timezone: 'Europe/Moscow'
    };
  }
}
