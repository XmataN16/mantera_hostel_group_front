import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RoomTypeResponse,
  RoomTypeCreateRequest,
  RoomTypeUpdateRequest
} from '../../shared/models/room-type.model';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/room-types`;

  getAll(hotelId?: number): Observable<RoomTypeResponse[]> {
    let params = new HttpParams();
    if (hotelId) {
      params = params.set('hotelId', hotelId.toString());
    }
    return this.http.get<RoomTypeResponse[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<RoomTypeResponse> {
    return this.http.get<RoomTypeResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: RoomTypeCreateRequest): Observable<RoomTypeResponse> {
    return this.http.post<RoomTypeResponse>(this.apiUrl, request);
  }

  update(id: number, request: RoomTypeUpdateRequest): Observable<RoomTypeResponse> {
    return this.http.put<RoomTypeResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
