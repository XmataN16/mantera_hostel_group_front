import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomResponse, RoomCreateRequest } from '../../shared/models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  getAll(hotelId?: number): Observable<RoomResponse[]> {
    let params = new HttpParams();
    if (hotelId) params = params.set('hotelId', hotelId.toString());
    return this.http.get<RoomResponse[]>(this.apiUrl, { params });
  }

  create(request: RoomCreateRequest): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(this.apiUrl, request);
  }

  changeHousekeepingStatus(roomId: number, status: string): Observable<RoomResponse> {
    return this.http.patch<RoomResponse>(`${this.apiUrl}/${roomId}/housekeeping-status`, {
      housekeepingStatus: status
    });
  }
}
