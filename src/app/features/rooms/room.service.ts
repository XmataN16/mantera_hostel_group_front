import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // <-- Добавь HttpParams
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomResponse, RoomCreateRequest } from '../../shared/models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  getAll(hotelId?: number): Observable<RoomResponse[]> {
    // Используем HttpParams для безопасной передачи параметров
    let params = new HttpParams();
    if (hotelId) {
      params = params.set('hotelId', hotelId.toString());
    }

    return this.http.get<RoomResponse[]>(this.apiUrl, { params });
  }

  create(request: RoomCreateRequest): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(this.apiUrl, request);
  }
}
