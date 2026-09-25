import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AvailabilityRoomResponse,
  BookingBoardCellResponse,
  ReservationCreateRequest,
  ReservationResponse,
  ReservationUpdateRequest
} from '../../shared/models/reservation.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservations`;

  private readonly CACHE_KEY = 'cache_reservations_all';
  private reservationsCache$: Observable<ReservationResponse[]> | null = null;

  getAll(forceReload: boolean = false): Observable<ReservationResponse[]> {
    if (!forceReload) {
      const cached = StorageCache.get<ReservationResponse[]>(this.CACHE_KEY);
      if (cached) return of(cached);
      if (this.reservationsCache$) return this.reservationsCache$;
    }

    this.reservationsCache$ = this.http.get<ReservationResponse[]>(this.apiUrl).pipe(
      tap(data => StorageCache.set(this.CACHE_KEY, data, 5)), // Кэш на 5 минут
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.reservationsCache$ = null;
        return throwError(() => err);
      })
    );
    return this.reservationsCache$;
  }

  getById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: ReservationCreateRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  update(id: number, request: ReservationUpdateRequest): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  confirm(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/confirm`, {}).pipe(
      tap(() => this.invalidateCache())
    );
  }

  checkIn(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/check-in`, {}).pipe(
      tap(() => this.invalidateCache())
    );
  }

  checkOut(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/check-out`, {}).pipe(
      tap(() => this.invalidateCache())
    );
  }

  cancel(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      tap(() => this.invalidateCache())
    );
  }

  // НЕ кэшируется
  getAvailableRooms(hotelId: number, checkInDate: string, checkOutDate: string): Observable<AvailabilityRoomResponse[]> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('checkInDate', checkInDate)
      .set('checkOutDate', checkOutDate);

    return this.http.get<AvailabilityRoomResponse[]>(`${this.apiUrl}/availability`, { params }).pipe(
      map(rooms => rooms.map(room => ({ ...room, id: room.roomId, status: room.roomStatus }))),
      tap(() => this.invalidateCache()) // При поиске доступности тоже сбрасываем кэш списка
    );
  }

  // НЕ кэшируется
  getBookingBoard(hotelId: number, fromDate: string, toDate: string): Observable<BookingBoardCellResponse[]> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<BookingBoardCellResponse[]>(`${this.apiUrl}/booking-board`, { params });
  }

  private invalidateCache(): void {
    this.reservationsCache$ = null;
    StorageCache.remove(this.CACHE_KEY);
  }
}