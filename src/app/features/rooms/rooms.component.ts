import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { RoomService } from './room.service';
import { HotelService } from '../hotels/hotel.service';
import { RoomResponse, RoomCreateRequest } from '../../shared/models/room.model';
import { HotelDto } from '../../shared/models/hotel.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

interface DropdownOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
  private roomService = inject(RoomService);
  private hotelService = inject(HotelService);

  rooms = signal<RoomResponse[]>([]);
  hotels = signal<HotelDto[]>([]);
  selectedHotelId = signal<number | null>(null);
  displayDialog = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);

  housekeepingOptions: DropdownOption[] = [
    { label: 'Чистый', value: 'CLEAN' },
    { label: 'Грязный', value: 'DIRTY' },
    { label: 'Проверен', value: 'INSPECTED' }
  ];

  newRoom: RoomCreateRequest = {
    hotelId: 0,
    roomTypeId: 0,
    roomNumber: '',
    floor: 1,
    comment: ''
  };

  ngOnInit(): void {
    this.loadHotels();
    this.loadRooms();
  }

  loadHotels(): void {
    this.hotelService.getAll().subscribe({
      next: hotels => {
        this.hotels.set(hotels);
        if (hotels.length > 0 && !this.selectedHotelId()) {
          this.selectedHotelId.set(hotels[0].id);
          this.loadRooms();
        }
      },
      error: () => {}
    });
  }

  loadRooms(): void {
    const hotelId = this.selectedHotelId();
    this.isLoading.set(true);
    this.roomService.getAll(hotelId || undefined).subscribe({
      next: rooms => {
        this.rooms.set(rooms);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        alert('Ошибка загрузки номеров: ' + this.getErrorMessage(err));
      }
    });
  }

  onHotelChange(): void {
    this.loadRooms();
  }

  openDialog(): void {
    this.displayDialog.set(true);
  }

  closeDialog(): void {
    this.displayDialog.set(false);
    this.resetForm();
  }

  saveRoom(): void {
    if (!this.newRoom.hotelId || !this.newRoom.roomTypeId || !this.newRoom.roomNumber) {
      alert('Заполните все обязательные поля');
      return;
    }

    this.isSaving.set(true);
    this.roomService.create(this.newRoom).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.displayDialog.set(false);
        this.resetForm();
        this.loadRooms();
      },
      error: err => {
        this.isSaving.set(false);
        alert('Ошибка сохранения: ' + this.getErrorMessage(err));
      }
    });
  }

  changeHousekeepingStatus(roomId: number, status: string): void {
    this.roomService.changeHousekeepingStatus(roomId, status).subscribe({
      next: () => {
        this.loadRooms();
      },
      error: err => {
        alert('Ошибка изменения статуса: ' + this.getErrorMessage(err));
      }
    });
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

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      'AVAILABLE': 'success',
      'OCCUPIED': 'warning',
      'MAINTENANCE': 'info',
      'OUT_OF_SERVICE': 'danger'
    };
    return severities[status] || 'secondary';
  }

  getHousekeepingLabel(status: string): string {
    const labels: Record<string, string> = {
      'CLEAN': 'Чистый',
      'DIRTY': 'Грязный',
      'INSPECTED': 'Проверен'
    };
    return labels[status] || status;
  }

  getHotelName(hotelId: number): string {
    return this.hotels().find(hotel => hotel.id === hotelId)?.name || `ID ${hotelId}`;
  }

  private resetForm(): void {
    this.newRoom = {
      hotelId: 0,
      roomTypeId: 0,
      roomNumber: '',
      floor: 1,
      comment: ''
    };
    this.selectedHotelId.set(null);
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
