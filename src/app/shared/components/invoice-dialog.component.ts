import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { InvoiceResponse, AdditionalServiceDto } from '../models/billing.model';

@Component({
  selector: 'app-invoice-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TabViewModule
  ],
  template: `
    <p-dialog
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '850px' }"
      header="Счет и оплаты"
      [closable]="true">

      @if (isLoading) {
        <div class="text-center p-5">Загрузка данных счета...</div>
      } @else if (invoice) {
        <div class="invoice-summary grid mb-4">
          <div class="col-6">Проживание: <b>{{ formatMoney(invoice.accommodationAmount) }}</b></div>
          <div class="col-6">Услуги: <b>{{ formatMoney(invoice.servicesAmount) }}</b></div>
          <div class="col-6">Итого к оплате: <b>{{ formatMoney(invoice.totalAmount) }}</b></div>
          <div class="col-6">Оплачено: <b style="color:green">{{ formatMoney(invoice.paidAmount) }}</b></div>
          <div class="col-12">
            <h3 [style.color]="invoice.debtAmount > 0 ? 'red' : 'green'">
              Задолженность: {{ formatMoney(invoice.debtAmount) }}
            </h3>
          </div>
        </div>

        <p-tabView>
          <p-tabPanel header="Доп. услуги">
            <p-table [value]="invoice.services" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Услуга</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr>
                  <td>{{ item.serviceName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatMoney(item.price) }}</td>
                  <td><b>{{ formatMoney(item.totalPrice) }}</b></td>
                </tr>
              </ng-template>
            </p-table>

            <div class="flex gap-3 mt-3 align-items-end">
              <div class="flex-1">
                <label>Услуга</label>
                <p-dropdown
                  [options]="availableServices"
                  [(ngModel)]="selectedServiceId"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Выберите"
                  styleClass="w-full">
                </p-dropdown>
              </div>
              <div style="width: 100px">
                <label>Кол-во</label>
                <p-inputNumber [(ngModel)]="serviceQuantity" [min]="1" styleClass="w-full"></p-inputNumber>
              </div>
              <button pButton label="Добавить" icon="pi pi-plus" (click)="addService()"></button>
            </div>
          </p-tabPanel>

          <p-tabPanel header="Оплаты">
            <p-table [value]="invoice.payments" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Метод</th>
                  <th>Комментарий</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr>
                  <td>{{ item.paidAt | date:'short' }}</td>
                  <td><b>{{ formatMoney(item.amount) }}</b></td>
                  <td>{{ item.method }}</td>
                  <td>{{ item.comment || '-' }}</td>
                </tr>
              </ng-template>
            </p-table>

            <div class="flex gap-3 mt-3 align-items-end flex-wrap">
              <div style="width: 150px">
                <label>Сумма</label>
                <p-inputNumber [(ngModel)]="paymentAmount" [min]="1" styleClass="w-full"></p-inputNumber>
              </div>
              <div style="width: 180px">
                <label>Метод</label>
                <p-dropdown
                  [options]="paymentMethods"
                  [(ngModel)]="paymentMethod"
                  optionLabel="label"
                  optionValue="value"
                  styleClass="w-full">
                </p-dropdown>
              </div>
              <div class="flex-1">
                <label>Комментарий</label>
                <input type="text" pInputText [(ngModel)]="paymentComment" class="w-full" />
              </div>
              <button pButton label="Оплата" icon="pi pi-money-bill" severity="success" (click)="addPayment()"></button>
            </div>
          </p-tabPanel>
        </p-tabView>
      }
    </p-dialog>
  `,
  styles: [`
    .invoice-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;

      .col-6, .col-12 {
        font-size: 0.95rem;
        color: #34495e;

        b {
          color: #2c3e50;
        }
      }

      .col-12 {
        grid-column: 1 / -1;
        margin-top: 0.5rem;
      }

      h3 {
        margin: 0;
        font-size: 1.1rem;
      }
    }

    .flex {
      display: flex;
    }

    .flex-1 {
      flex: 1;
    }

    .gap-3 {
      gap: 1rem;
    }

    .mt-3 {
      margin-top: 1.5rem;
    }

    .align-items-end {
      align-items: flex-end;
    }

    .flex-wrap {
      flex-wrap: wrap;
    }

    .w-full {
      width: 100%;
    }

    .text-center {
      text-align: center;
    }

    .p-5 {
      padding: 2.5rem;
    }

    label {
      display: block;
      font-weight: 600;
      color: #34495e;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
  `]
})
export class InvoiceDialogComponent {
  @Input() visible = false;
  @Input() invoice: InvoiceResponse | null = null;
  @Input() availableServices: AdditionalServiceDto[] = [];
  @Input() isLoading = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() addServiceRequest = new EventEmitter<{
    serviceId: number;
    quantity: number;
  }>();
  @Output() addPaymentRequest = new EventEmitter<{
    amount: number;
    method: string;
    comment: string;
  }>();

  selectedServiceId: number | null = null;
  serviceQuantity = 1;
  paymentAmount = 0;
  paymentMethod = 'CARD';
  paymentComment = '';

  paymentMethods = [
    { label: 'Наличные', value: 'CASH' },
    { label: 'Карта', value: 'CARD' },
    { label: 'Безналичный перевод', value: 'BANK_TRANSFER' },
    { label: 'Онлайн', value: 'ONLINE' }
  ];

  addService(): void {
    if (this.selectedServiceId && this.serviceQuantity > 0) {
      this.addServiceRequest.emit({
        serviceId: this.selectedServiceId,
        quantity: this.serviceQuantity
      });
    }
  }

  addPayment(): void {
    if (this.paymentAmount > 0) {
      this.addPaymentRequest.emit({
        amount: this.paymentAmount,
        method: this.paymentMethod,
        comment: this.paymentComment
      });
    }
  }

  formatMoney(value: number | null | undefined): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value || 0);
  }
}
