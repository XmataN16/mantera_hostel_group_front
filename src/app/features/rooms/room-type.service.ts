import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // <-- Добавь HttpParams
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomTypeResponse, RoomTypeCreateRequest } from '../../shared/models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/room-types`;

  getAll(hotelId?: number): Observable<RoomTypeResponse[]> {
    // Используем HttpParams для безопасной передачи параметров
    let params = new HttpParams();
    if (hotelId) {
      params = params.set('hotelId', hotelId.toString());
    }

    return this.http.get<RoomTypeResponse[]>(this.apiUrl, { params });
  }

  create(request: RoomTypeCreateRequest): Observable<RoomTypeResponse> {
    return this.http.post<RoomTypeResponse>(this.apiUrl, request);
  }
}
