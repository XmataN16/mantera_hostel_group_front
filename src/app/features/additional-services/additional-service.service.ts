import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdditionalServiceResponse,
  AdditionalServiceCreateRequest,
  AdditionalServiceUpdateRequest,
  ServiceStatus
} from '../../shared/models/additional-service.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class AdditionalServiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/additional-services`;

  private servicesCache = new Map<string, Observable<AdditionalServiceResponse[]>>();

  private getCacheKey(hotelId?: number, status?: ServiceStatus): string {
    return `cache_additional_services_${hotelId ?? 'all'}_${status ?? 'all'}`;
  }

  getAll(hotelId?: number, status?: ServiceStatus, forceReload: boolean = false): Observable<AdditionalServiceResponse[]> {
    const cacheKey = this.getCacheKey(hotelId, status);

    if (!forceReload) {
      const cached = StorageCache.get<AdditionalServiceResponse[]>(cacheKey);
      if (cached) return of(cached);
      const inMemory = this.servicesCache.get(cacheKey);
      if (inMemory) return inMemory;
    }

    let params = new HttpParams();
    if (hotelId) params = params.set('hotelId', hotelId.toString());
    if (status) params = params.set('status', status);

    const req$ = this.http.get<AdditionalServiceResponse[]>(this.apiUrl, { params }).pipe(
      tap(data => StorageCache.set(cacheKey, data, 30)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.servicesCache.delete(cacheKey);
        return throwError(() => err);
      })
    );

    this.servicesCache.set(cacheKey, req$);
    return req$;
  }

  getById(id: number): Observable<AdditionalServiceResponse> {
    return this.http.get<AdditionalServiceResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: AdditionalServiceCreateRequest): Observable<AdditionalServiceResponse> {
    return this.http.post<AdditionalServiceResponse>(this.apiUrl, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  update(id: number, request: AdditionalServiceUpdateRequest): Observable<AdditionalServiceResponse> {
    return this.http.put<AdditionalServiceResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  private invalidateAllCache(): void {
    this.servicesCache.clear();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_additional_services_')) localStorage.removeItem(key);
    }
  }
}