import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RatePlanResponse,
  RatePlanCreateRequest,
  RatePlanUpdateRequest
} from '../../shared/models/rate-plan.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class RatePlanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rate-plans`;

  private ratePlansCache = new Map<string, Observable<RatePlanResponse[]>>();

  private getCacheKey(hotelId?: number): string {
    return `cache_rate_plans_${hotelId ?? 'all'}`;
  }

  getAll(hotelId?: number, forceReload: boolean = false): Observable<RatePlanResponse[]> {
    const cacheKey = this.getCacheKey(hotelId);

    if (!forceReload) {
      const cached = StorageCache.get<RatePlanResponse[]>(cacheKey);
      if (cached) return of(cached);
      const inMemory = this.ratePlansCache.get(cacheKey);
      if (inMemory) return inMemory;
    }

    let params = new HttpParams();
    if (hotelId) params = params.set('hotelId', hotelId.toString());

    const req$ = this.http.get<RatePlanResponse[]>(this.apiUrl, { params }).pipe(
      tap(data => StorageCache.set(cacheKey, data, 30)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.ratePlansCache.delete(cacheKey);
        return throwError(() => err);
      })
    );

    this.ratePlansCache.set(cacheKey, req$);
    return req$;
  }

  getById(id: number): Observable<RatePlanResponse> {
    return this.http.get<RatePlanResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: RatePlanCreateRequest): Observable<RatePlanResponse> {
    return this.http.post<RatePlanResponse>(this.apiUrl, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  update(id: number, request: RatePlanUpdateRequest): Observable<RatePlanResponse> {
    return this.http.put<RatePlanResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  private invalidateAllCache(): void {
    this.ratePlansCache.clear();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_rate_plans_')) localStorage.removeItem(key);
    }
  }
}