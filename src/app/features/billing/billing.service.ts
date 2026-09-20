import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdditionalServiceDto, InvoiceResponse, PaymentItem, ReservationServiceItem } from '../../shared/models/billing.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getInvoice(reservationId: number): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`${this.apiUrl}/reservations/${reservationId}/invoice`);
  }

  getAvailableServices(hotelId: number): Observable<AdditionalServiceDto[]> {
    return this.http.get<AdditionalServiceDto[]>(`${this.apiUrl}/additional-services?hotelId=${hotelId}&status=ACTIVE`);
  }

  addService(reservationId: number, serviceId: number, quantity: number): Observable<ReservationServiceItem> {
    return this.http.post<ReservationServiceItem>(`${this.apiUrl}/reservations/${reservationId}/services`, {
      serviceId, quantity
    });
  }

  addPayment(reservationId: number, amount: number, method: string, comment: string): Observable<PaymentItem> {
    return this.http.post<PaymentItem>(`${this.apiUrl}/reservations/${reservationId}/payments`, {
      amount, method, comment
    });
  }
}
