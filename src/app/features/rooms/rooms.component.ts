import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { RoomService } from './room.service';
import { RoomTypeService } from './room-type.service';
import { HotelService } from '../hotels/hotel.service';
import { RoomResponse, RoomCreateRequest, RoomTypeResponse } from '../../shared/models/room.model';
import { HotelDto } from '../../shared/models/hotel.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);
  private hotelService = inject(HotelService);

  // Данные
  rooms = signal<RoomResponse[]>([]);
  hotels = signal<HotelDto[]>([]);
  roomTypes = signal<RoomTypeResponse[]>([]);

  // UI состояние
  displayDialog = signal(false);
  isLoading = signal(false);
  selectedHotelId = signal<number | null>(null);

  // Модель формы
  newRoom: RoomCreateRequest = {
    hotelId: 0,
    roomTypeId: 0,
    roomNumber: '',
    floor: 1,
    comment: ''
  };

  // Вычисляемые данные (фильтрация категорий номеров по отелю)
  filteredRoomTypes = computed(() => {
    const hotelId = this.selectedHotelId();
    if (!hotelId) return [];
    return this.roomTypes().filter(rt => rt.hotelId === hotelId);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // Параллельная загрузка всех данных
    this.hotelService.getAll().subscribe(hotels => {
      this.hotels.set(hotels);
    });

    this.roomTypeService.getAll().subscribe(roomTypes => {
      this.roomTypes.set(roomTypes);
    });

    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getAll(this.selectedHotelId() || undefined).subscribe({
      next: (data) => {
        this.rooms.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onHotelFilterChange() {
    this.loadRooms();
  }

  openDialog() {
    this.displayDialog.set(true);
  }

  onHotelSelectInForm() {
    // Сбрасываем выбор категории номера при смене отеля
    this.newRoom.roomTypeId = 0;
  }

  saveRoom() {
    if (!this.newRoom.hotelId || !this.newRoom.roomTypeId || !this.newRoom.roomNumber) {
      alert('Заполните все обязательные поля');
      return;
    }

    this.roomService.create(this.newRoom).subscribe({
      next: () => {
        this.displayDialog.set(false);
        this.resetForm();
        this.loadRooms();
      },
      error: (err) => {
        alert('Ошибка сохранения: ' + (err.error?.message || 'Неизвестная ошибка'));
      }
    });
  }

  resetForm() {
    this.newRoom = {
      hotelId: 0,
      roomTypeId: 0,
      roomNumber: '',
      floor: 1,
      comment: ''
    };
    this.selectedHotelId.set(null);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'AVAILABLE': 'Свободен',
      'OCCUPIED': 'Занят',
      'MAINTENANCE': 'Ремонт',
      'OUT_OF_SERVICE': 'Недоступен'
    };
    return labels[status] || status;
  }

  getHousekeepingLabel(status: string): string {
    const labels: Record<string, string> = {
      'CLEAN': 'Чистый',
      'DIRTY': 'Грязный',
      'INSPECTED': 'Проверен'
    };
    return labels[status] || status;
  }
}
