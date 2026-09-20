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
import { HotelService } from '../hotels/hotel.service';
import { AdditionalServiceService } from './additional-service.service';
import { HotelDto } from '../../shared/models/hotel.model';
import {
  AdditionalServiceResponse,
  AdditionalServiceCreateRequest,
  ServiceStatus
} from '../../shared/models/additional-service.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-additional-services',
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
  templateUrl: './additional-services.component.html',
  styleUrl: './additional-services.component.scss'
})
export class AdditionalServicesComponent implements OnInit {
  private service = inject(AdditionalServiceService);
  private hotelService = inject(HotelService);

  services = signal<AdditionalServiceResponse[]>([]);
  hotels = signal<HotelDto[]>([]);
  selectedHotelId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = signal(false);
  isEditMode = signal(false);
  selectedServiceId = signal<number | null>(null);

  serviceForm: AdditionalServiceCreateRequest = this.getEmptyForm();

  ngOnInit(): void {
    this.loadHotels();
    this.loadServices();
  }

  loadHotels(): void {
    this.hotelService.getAll().subscribe({
      next: hotels => {
        this.hotels.set(hotels);
        if (hotels.length > 0 && !this.selectedHotelId()) {
          this.selectedHotelId.set(hotels[0].id);
          this.loadServices();
        }
      },
      error: () => {}
    });
  }

  loadServices(): void {
    const hotelId = this.selectedHotelId();
    this.isLoading.set(true);
    this.service.getAll(hotelId || undefined).subscribe({
      next: services => {
        this.services.set(services);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        alert('Ошибка загрузки: ' + this.getErrorMessage(err));
      }
    });
  }

  onHotelChange(): void {
    this.loadServices();
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedServiceId.set(null);
    this.serviceForm = this.getEmptyForm();
    this.displayDialog.set(true);
  }

  openEditDialog(service: AdditionalServiceResponse): void {
    this.isEditMode.set(true);
    this.selectedServiceId.set(service.id);
    this.serviceForm = {
      hotelId: service.hotelId,
      name: service.name,
      description: service.description,
      price: service.price
    };
    this.displayDialog.set(true);
  }

  closeDialog(): void {
    this.displayDialog.set(false);
  }

  saveService(): void {
    if (!this.serviceForm.name?.trim()) {
      alert('Введите название услуги');
      return;
    }
    if (!this.serviceForm.hotelId) {
      alert('Выберите отель');
      return;
    }
    if (this.serviceForm.price <= 0) {
      alert('Укажите цену');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.selectedServiceId();
      if (!id) return;
      this.service.update(id, {
        name: this.serviceForm.name,
        description: this.serviceForm.description,
        price: this.serviceForm.price,
        status: 'ACTIVE'
      }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog.set(false);
          this.loadServices();
        },
        error: err => {
          this.isSaving.set(false);
          alert('Ошибка: ' + this.getErrorMessage(err));
        }
      });
    } else {
      this.service.create(this.serviceForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog.set(false);
          this.loadServices();
        },
        error: err => {
          this.isSaving.set(false);
          alert('Ошибка: ' + this.getErrorMessage(err));
        }
      });
    }
  }

  deleteService(service: AdditionalServiceResponse): void {
    if (!confirm(`Удалить услугу "${service.name}"?`)) return;
    this.service.delete(service.id).subscribe({
      next: () => this.loadServices(),
      error: err => alert('Ошибка: ' + this.getErrorMessage(err))
    });
  }

  getStatusLabel(status: ServiceStatus): string {
    return status === 'ACTIVE' ? 'Активна' : 'Отключена';
  }

  getStatusSeverity(status: ServiceStatus): 'success' | 'danger' {
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

  private getEmptyForm(): AdditionalServiceCreateRequest {
    return {
      hotelId: 0,
      name: '',
      description: '',
      price: 0
    };
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
