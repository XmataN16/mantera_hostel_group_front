import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RoomTypeResponse,
  RoomTypeCreateRequest,
  RoomTypeUpdateRequest
} from '../../shared/models/room-type.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/room-types`;

  private roomTypesCache = new Map<string, Observable<RoomTypeResponse[]>>();

  private getCacheKey(hotelId?: number): string {
    return `cache_room_types_${hotelId ?? 'all'}`;
  }

  getAll(hotelId?: number, forceReload: boolean = false): Observable<RoomTypeResponse[]> {
    const cacheKey = this.getCacheKey(hotelId);

    if (!forceReload) {
      const cached = StorageCache.get<RoomTypeResponse[]>(cacheKey);
      if (cached) return of(cached);
      const inMemory = this.roomTypesCache.get(cacheKey);
      if (inMemory) return inMemory;
    }

    let params = new HttpParams();
    if (hotelId) params = params.set('hotelId', hotelId.toString());

    const req$ = this.http.get<RoomTypeResponse[]>(this.apiUrl, { params }).pipe(
      tap(data => StorageCache.set(cacheKey, data, 30)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.roomTypesCache.delete(cacheKey);
        return throwError(() => err);
      })
    );

    this.roomTypesCache.set(cacheKey, req$);
    return req$;
  }

  getById(id: number): Observable<RoomTypeResponse> {
    return this.http.get<RoomTypeResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: RoomTypeCreateRequest): Observable<RoomTypeResponse> {
    return this.http.post<RoomTypeResponse>(this.apiUrl, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  update(id: number, request: RoomTypeUpdateRequest): Observable<RoomTypeResponse> {
    return this.http.put<RoomTypeResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  private invalidateAllCache(): void {
    this.roomTypesCache.clear();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_room_types_')) localStorage.removeItem(key);
    }
  }
}