import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  GuestCreateRequest,
  GuestResponse,
  GuestStayHistoryResponse,
  GuestUpdateRequest
} from '../../shared/models/guest.model';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/guests`;

  getAll(): Observable<GuestResponse[]> {
    return this.http.get<GuestResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<GuestResponse> {
    return this.http.get<GuestResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: GuestCreateRequest): Observable<GuestResponse> {
    return this.http.post<GuestResponse>(this.apiUrl, request);
  }

  update(id: number, request: GuestUpdateRequest): Observable<GuestResponse> {
    return this.http.put<GuestResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStayHistory(id: number): Observable<GuestStayHistoryResponse[]> {
    return this.http.get<GuestStayHistoryResponse[]>(`${this.apiUrl}/${id}/history`);
  }
}
