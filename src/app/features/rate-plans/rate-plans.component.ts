import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { HotelService } from '../hotels/hotel.service';
import { RatePlanService } from './rate-plan.service';
import { HotelDto } from '../../shared/models/hotel.model';
import {
  RatePlanResponse,
  RatePlanCreateRequest
} from '../../shared/models/rate-plan.model';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-rate-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputSwitchModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './rate-plans.component.html',
  styleUrl: './rate-plans.component.scss'
})
export class RatePlansComponent implements OnInit {
  private service = inject(RatePlanService);
  private hotelService = inject(HotelService);

  ratePlans = signal<RatePlanResponse[]>([]);
  hotels = signal<HotelDto[]>([]);
  selectedHotelId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = signal(false);
  isEditMode = signal(false);
  selectedRatePlanId = signal<number | null>(null);

  ratePlanForm: RatePlanCreateRequest = this.getEmptyForm();

  ngOnInit(): void {
    this.loadHotels();
    this.loadRatePlans();
  }

  loadHotels(): void {
    this.hotelService.getAll().subscribe({
      next: hotels => {
        this.hotels.set(hotels);
        if (hotels.length > 0 && !this.selectedHotelId()) {
          this.selectedHotelId.set(hotels[0].id);
          this.loadRatePlans();
        }
      },
      error: () => {}
    });
  }

  loadRatePlans(): void {
    const hotelId = this.selectedHotelId();
    this.isLoading.set(true);
    this.service.getAll(hotelId || undefined).subscribe({
      next: ratePlans => {
        this.ratePlans.set(ratePlans);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        alert('Ошибка загрузки: ' + this.getErrorMessage(err));
      }
    });
  }

  onHotelChange(): void {
    this.loadRatePlans();
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedRatePlanId.set(null);
    this.ratePlanForm = this.getEmptyForm();
    this.displayDialog.set(true);
  }

  openEditDialog(ratePlan: RatePlanResponse): void {
    this.isEditMode.set(true);
    this.selectedRatePlanId.set(ratePlan.id);
    this.ratePlanForm = {
      hotelId: ratePlan.hotelId,
      code: ratePlan.code,
      name: ratePlan.name,
      description: ratePlan.description,
      cancellationPolicy: ratePlan.cancellationPolicy,
      breakfastIncluded: ratePlan.breakfastIncluded,
      refundable: ratePlan.refundable
    };
    this.displayDialog.set(true);
  }

  closeDialog(): void {
    this.displayDialog.set(false);
  }

  saveRatePlan(): void {
    if (!this.ratePlanForm.name?.trim()) {
      alert('Введите название тарифа');
      return;
    }
    if (!this.ratePlanForm.code?.trim()) {
      alert('Введите код тарифа');
      return;
    }
    if (!this.ratePlanForm.hotelId) {
      alert('Выберите отель');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.selectedRatePlanId();
      if (!id) return;
      this.service.update(id, {
        code: this.ratePlanForm.code,
        name: this.ratePlanForm.name,
        description: this.ratePlanForm.description,
        cancellationPolicy: this.ratePlanForm.cancellationPolicy,
        breakfastIncluded: this.ratePlanForm.breakfastIncluded,
        refundable: this.ratePlanForm.refundable
      }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog.set(false);
          this.loadRatePlans();
        },
        error: err => {
          this.isSaving.set(false);
          alert('Ошибка: ' + this.getErrorMessage(err));
        }
      });
    } else {
      this.service.create(this.ratePlanForm).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog.set(false);
          this.loadRatePlans();
        },
        error: err => {
          this.isSaving.set(false);
          alert('Ошибка: ' + this.getErrorMessage(err));
        }
      });
    }
  }

  deleteRatePlan(ratePlan: RatePlanResponse): void {
    if (!confirm(`Удалить тариф "${ratePlan.name}"?`)) return;
    this.service.delete(ratePlan.id).subscribe({
      next: () => this.loadRatePlans(),
      error: err => alert('Ошибка: ' + this.getErrorMessage(err))
    });
  }

  getHotelName(hotelId: number): string {
    return this.hotels().find(h => h.id === hotelId)?.name || `ID ${hotelId}`;
  }

  private getEmptyForm(): RatePlanCreateRequest {
    return {
      hotelId: 0,
      code: '',
      name: '',
      description: '',
      cancellationPolicy: '',
      breakfastIncluded: false,
      refundable: true
    };
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.message || 'Неизвестная ошибка';
  }
}
