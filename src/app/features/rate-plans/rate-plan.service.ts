import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RatePlanResponse,
  RatePlanCreateRequest,
  RatePlanUpdateRequest
} from '../../shared/models/rate-plan.model';

@Injectable({ providedIn: 'root' })
export class RatePlanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rate-plans`;

  getAll(hotelId?: number): Observable<RatePlanResponse[]> {
    let params = new HttpParams();
    if (hotelId) {
      params = params.set('hotelId', hotelId.toString());
    }
    return this.http.get<RatePlanResponse[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<RatePlanResponse> {
    return this.http.get<RatePlanResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: RatePlanCreateRequest): Observable<RatePlanResponse> {
    return this.http.post<RatePlanResponse>(this.apiUrl, request);
  }

  update(id: number, request: RatePlanUpdateRequest): Observable<RatePlanResponse> {
    return this.http.put<RatePlanResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
