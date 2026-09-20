import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { HotelService } from '../hotels/hotel.service';
import { RoomTypeService } from './room-type.service';
import { HotelDto } from '../../shared/models/hotel.model';
import {
  RoomTypeResponse,
  RoomTypeCreateRequest,
  RoomTypeStatus
} from '../../shared/models/room-type.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-room-types',
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
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './room-types.component.html',
  styleUrl: './room-types.component.scss'
})
export class RoomTypesComponent implements OnInit {
  private service = inject(RoomTypeService);
  private hotelService = inject(HotelService);

  roomTypes = signal<RoomTypeResponse[]>([]);
  hotels = signal<HotelDto[]>([]);
  selectedHotelId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = signal(false);
  isEditMode = signal(false);
  selectedRoomTypeId = signal<number | null>(null);

  roomTypeForm: RoomTypeCreateRequest = this.getEmptyForm();

  ngOnInit(): void {
    this.loadHotels();
    this.loadRoomTypes();
  }

  loadHotels(): void {
    this.hotelService.getAll().subscribe({
      next: hotels => {
        this.hotels.set(hotels);
        if (hotels.length > 0 && !this.selectedHotelId()) {
          this.selectedHotelId.set(hotels[0].id);
          this.loadRoomTypes();
        }
      },
      error: () => {}
    });
  }

  loadRoomTypes(): void {
    const hotelId = this.selectedHotelId();
    this.isLoading.set(true);
    this.service.getAll(hotelId || undefined).subscribe({
      next: roomTypes => {
        this.roomTypes.set(roomTypes);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        alert('Ошибка загрузки: ' + this.getErrorMessage(err));
      }
    });
  }

  onHotelChange(): void {
    this.loadRoomTypes();
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedRoomTypeId.set(null);
    this.roomTypeForm = this.getEmptyForm();
    this.displayDialog.set(true);
  }

  openEditDialog(roomType: RoomTypeResponse): void {
    this.isEditMode.set(true);
    this.selectedRoomTypeId.set(roomType.id);
    this.roomTypeForm = {
      hotelId: roomType.hotelId,
      code: roomType.code,
      name: roomType.name,
      description: roomType.description,
      capacity: roomType.capacity,
      basePrice: roomType.basePrice
    };
    this.displayDialog.set(true);
  }

  closeDialog(): void {
    this.displayDialog.set(false);
  }

  saveRoomType(): void {
    if (!this.roomTypeForm.name?.trim()) {
      alert('Введите название категории');
      return;
    }
    if (!this.roomTypeForm.code?.trim()) {
      alert('Введите код категории');
      return;
    }
    if (!this.roomTypeForm.hotelId) {
      alert('Выберите отель');
      return;
    }
    if (this.roomTypeForm.capacity < 1) {
      alert('Вместимость должна быть не менее 1');
      return;
    }
    if (this.roomTypeForm.basePrice <= 0) {
      alert('Укажите базовую цену');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.selectedRoomTypeId();
      if (!id) return;
      this.service.update(id, {
        code: this.roomTypeForm.code,
        name: this.roomTypeForm.name,
        description: this.roomTypeForm.description,
        capacity: this.roomTypeForm.capacity,
        basePrice: this.roomTypeForm.basePrice,
        status: 'ACTIVE'
      }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog.set(false);
          this.loadRoomTypes();
        },
        error: err => {
          this.isSaving.set(false);
          alert('Ошибка: ' + this.getErrorMessage(err));
        }
      });
    } else {
      this.service.create(this.roomTypeForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog.set(false);
          this.loadRoomTypes();
        },
        error: err => {
          this.isSaving.set(false);
          alert('Ошибка: ' + this.getErrorMessage(err));
        }
      });
    }
  }

  deleteRoomType(roomType: RoomTypeResponse): void {
    if (!confirm(`Удалить категорию "${roomType.name}"?`)) return;
    this.service.delete(roomType.id).subscribe({
      next: () => this.loadRoomTypes(),
      error: err => alert('Ошибка: ' + this.getErrorMessage(err))
    });
  }

  getStatusLabel(status: RoomTypeStatus): string {
    return status === 'ACTIVE' ? 'Активна' : 'Неактивна';
  }

  getStatusSeverity(status: RoomTypeStatus): 'success' | 'danger' {
    return status === 'ACTIVE' ? 'success' : 'danger';
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  }

  getHotelName(hotelId: number): string {
    return this.hotels().find(h => h.id === hotelId)?.name || `ID ${hotelId}`;
  }

  private getEmptyForm(): RoomTypeCreateRequest {
    return {
      hotelId: 0,
      code: '',
      name: '',
      description: '',
      capacity: 1,
      basePrice: 0
    };
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
