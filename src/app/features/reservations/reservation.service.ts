import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AvailabilityRoomResponse,
  BookingBoardCellResponse,
  ReservationCreateRequest,
  ReservationResponse,
  ReservationUpdateRequest
} from '../../shared/models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservations`;

  getAll(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: ReservationCreateRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, request);
  }

  update(id: number, request: ReservationUpdateRequest): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.apiUrl}/${id}`, request);
  }

  confirm(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/confirm`, {});
  }

  checkIn(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/check-in`, {});
  }

  checkOut(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/check-out`, {});
  }

  cancel(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getAvailableRooms(
    hotelId: number,
    checkInDate: string,
    checkOutDate: string
  ): Observable<AvailabilityRoomResponse[]> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('checkInDate', checkInDate)
      .set('checkOutDate', checkOutDate);

    return this.http
      .get<AvailabilityRoomResponse[]>(`${this.apiUrl}/availability`, { params })
      .pipe(
        map(rooms =>
          rooms.map(room => ({
            ...room,
            id: room.roomId,
            status: room.roomStatus
          }))
        )
      );
  }

  getBookingBoard(
    hotelId: number,
    fromDate: string,
    toDate: string
  ): Observable<BookingBoardCellResponse[]> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<BookingBoardCellResponse[]>(
      `${this.apiUrl}/booking-board`,
      { params }
    );
  }
}
