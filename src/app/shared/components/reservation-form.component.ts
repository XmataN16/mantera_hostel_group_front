import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { HotelDto } from '../models/hotel.model';
import { GuestResponse } from '../models/guest.model';
import {
  AvailabilityRoomResponse,
  ReservationCreateRequest,
  ReservationSource
} from '../models/reservation.model';

interface DropdownOption<T = string> {
  label: string;
  value: T;
}

interface AvailableRoomOption extends AvailabilityRoomResponse {
  displayName: string;
}

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule
  ],
  template: `
    <p-dialog
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '720px' }"
      header="Новое бронирование"
      [closable]="true">

      <div class="reservation-form">
        <div class="form-row">
          <div class="field">
            <label for="hotelId">Отель *</label>
            <p-dropdown
              inputId="hotelId"
              [options]="hotels"
              [(ngModel)]="form.hotelId"
              optionLabel="name"
              optionValue="id"
              placeholder="Выберите отель"
              (onChange)="onBookingParamsChange()">
            </p-dropdown>
          </div>

          <div class="field">
            <label for="guestId">Гость *</label>
            <p-dropdown
              inputId="guestId"
              [options]="guests"
              [(ngModel)]="form.guestId"
              optionLabel="lastName"
              optionValue="id"
              placeholder="Выберите гостя">
              <ng-template pTemplate="selectedItem" let-guest>
                @if (guest) {
                  <span>
                    {{ guest.lastName }} {{ guest.firstName }} {{ guest.middleName || '' }}
                  </span>
                }
              </ng-template>

              <ng-template pTemplate="item" let-guest>
                <div>
                  <strong>{{ guest.lastName }} {{ guest.firstName }} {{ guest.middleName || '' }}</strong>
                  <div class="muted">{{ guest.phone || 'Телефон не указан' }}</div>
                </div>
              </ng-template>
            </p-dropdown>
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="checkInDate">Дата заезда *</label>
            <input
              id="checkInDate"
              type="date"
              pInputText
              [(ngModel)]="form.checkInDate"
              (change)="onBookingParamsChange()" />
          </div>

          <div class="field">
            <label for="checkOutDate">Дата выезда *</label>
            <input
              id="checkOutDate"
              type="date"
              pInputText
              [(ngModel)]="form.checkOutDate"
              (change)="onBookingParamsChange()" />
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="adults">Взрослые *</label>
            <p-inputNumber
              inputId="adults"
              [(ngModel)]="form.adults"
              [min]="1"
              [showButtons]="true">
            </p-inputNumber>
          </div>

          <div class="field">
            <label for="children">Дети</label>
            <p-inputNumber
              inputId="children"
              [(ngModel)]="form.children"
              [min]="0"
              [showButtons]="true">
            </p-inputNumber>
          </div>

          <div class="field">
            <label for="source">Источник</label>
            <p-dropdown
              inputId="source"
              [options]="sourceOptions"
              [(ngModel)]="form.source"
              optionLabel="label"
              optionValue="value">
            </p-dropdown>
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="reservationNumber">Номер бронирования</label>
            <input
              id="reservationNumber"
              type="text"
              pInputText
              [(ngModel)]="form.reservationNumber"
              placeholder="Можно оставить пустым" />
          </div>

          <div class="field">
            <label for="roomId">Свободный номер *</label>
            <p-dropdown
              inputId="roomId"
              [options]="availableRooms"
              [(ngModel)]="selectedRoomId"
              optionLabel="displayName"
              optionValue="id"
              placeholder="Сначала выберите отель и даты"
              [loading]="isLoadingRooms">
            </p-dropdown>
          </div>
        </div>

        <div class="field">
          <label for="comment">Комментарий</label>
          <input
            id="comment"
            type="text"
            pInputText
            [(ngModel)]="form.comment"
            placeholder="Например: нужен тихий номер" />
        </div>

        @if (
          form.hotelId &&
          form.checkInDate &&
          form.checkOutDate &&
          availableRooms.length === 0 &&
          !isLoadingRooms
        ) {
          <div class="warning-message">
            Свободные номера на выбранные даты не найдены.
          </div>
        }
      </div>

      <ng-template pTemplate="footer">
        <button
          pButton
          type="button"
          label="Отмена"
          severity="secondary"
          (click)="close()">
        </button>

        <button
          pButton
          type="button"
          label="Сохранить"
          icon="pi pi-save"
          [loading]="isSaving"
          (click)="save()">
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .reservation-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;

      &:has(.field:nth-child(2)) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 600;
        color: #34495e;
        font-size: 0.9rem;
      }

      ::ng-deep {
        .p-dropdown,
        .p-inputnumber {
          width: 100%;
        }
      }
    }

    .warning-message {
      padding: 0.875rem 1rem;
      border-radius: 8px;
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
      font-size: 0.9rem;
    }

    .muted {
      color: #7f8c8d;
      font-size: 0.85rem;
    }

    @media (max-width: 900px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReservationFormComponent {
  @Input() visible = false;
  @Input() hotels: HotelDto[] = [];
  @Input() guests: GuestResponse[] = [];
  @Input() availableRooms: AvailableRoomOption[] = [];
  @Input() isLoadingRooms = false;
  @Input() isSaving = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() bookingParamsChange = new EventEmitter<{
    hotelId: number;
    checkInDate: string;
    checkOutDate: string;
  }>();
  @Output() saveRequest = new EventEmitter<{
    form: ReservationCreateRequest;
    selectedRoomId: number | null;
  }>();

  form: ReservationCreateRequest = this.getEmptyForm();
  selectedRoomId: number | null = null;

  sourceOptions: DropdownOption<ReservationSource>[] = [
    { label: 'Напрямую', value: 'DIRECT' },
    { label: 'Телефон', value: 'PHONE' },
    { label: 'Сайт', value: 'WEBSITE' },
    { label: 'Агентство', value: 'AGENCY' },
    { label: 'Платформа бронирования', value: 'BOOKING_PLATFORM' }
  ];

  onBookingParamsChange(): void {
    if (
      this.form.hotelId &&
      this.form.checkInDate &&
      this.form.checkOutDate
    ) {
      this.bookingParamsChange.emit({
        hotelId: this.form.hotelId,
        checkInDate: this.form.checkInDate,
        checkOutDate: this.form.checkOutDate
      });
    }
  }

  save(): void {
    this.saveRequest.emit({
      form: this.form,
      selectedRoomId: this.selectedRoomId
    });
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  resetForm(): void {
    this.form = this.getEmptyForm();
    this.selectedRoomId = null;
  }

  private getEmptyForm(): ReservationCreateRequest {
    return {
      hotelId: 0,
      guestId: 0,
      reservationNumber: '',
      source: 'DIRECT',
      checkInDate: '',
      checkOutDate: '',
      adults: 1,
      children: 0,
      comment: '',
      rooms: []
    };
  }
}
