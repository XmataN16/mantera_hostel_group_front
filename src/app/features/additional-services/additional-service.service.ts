import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdditionalServiceResponse,
  AdditionalServiceCreateRequest,
  AdditionalServiceUpdateRequest,
  ServiceStatus
} from '../../shared/models/additional-service.model';

@Injectable({ providedIn: 'root' })
export class AdditionalServiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/additional-services`;

  getAll(hotelId?: number, status?: ServiceStatus): Observable<AdditionalServiceResponse[]> {
    let params = new HttpParams();
    if (hotelId) {
      params = params.set('hotelId', hotelId.toString());
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdditionalServiceResponse[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<AdditionalServiceResponse> {
    return this.http.get<AdditionalServiceResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: AdditionalServiceCreateRequest): Observable<AdditionalServiceResponse> {
    return this.http.post<AdditionalServiceResponse>(this.apiUrl, request);
  }

  update(id: number, request: AdditionalServiceUpdateRequest): Observable<AdditionalServiceResponse> {
    return this.http.put<AdditionalServiceResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
