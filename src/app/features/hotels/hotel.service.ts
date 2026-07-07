import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HotelDto, HotelCreateRequest } from '../../shared/models/hotel.model';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/hotels`;

  getAll(): Observable<HotelDto[]> {
    return this.http.get<HotelDto[]>(this.apiUrl);
  }

  create(request: HotelCreateRequest): Observable<HotelDto> {
    return this.http.post<HotelDto>(this.apiUrl, request);
  }
}
