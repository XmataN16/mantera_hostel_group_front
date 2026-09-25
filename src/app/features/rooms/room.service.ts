import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomResponse, RoomCreateRequest } from '../../shared/models/room.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  private roomsCache = new Map<string, Observable<RoomResponse[]>>();

  private getCacheKey(hotelId?: number): string {
    return `cache_rooms_${hotelId ?? 'all'}`;
  }

  getAll(hotelId?: number, forceReload: boolean = false): Observable<RoomResponse[]> {
    const cacheKey = this.getCacheKey(hotelId);

    if (!forceReload) {
      const cached = StorageCache.get<RoomResponse[]>(cacheKey);
      if (cached) return of(cached);
      const inMemory = this.roomsCache.get(cacheKey);
      if (inMemory) return inMemory;
    }

    let params = new HttpParams();
    if (hotelId) params = params.set('hotelId', hotelId.toString());

    const req$ = this.http.get<RoomResponse[]>(this.apiUrl, { params }).pipe(
      tap(data => StorageCache.set(cacheKey, data, 30)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.roomsCache.delete(cacheKey);
        return throwError(() => err);
      })
    );

    this.roomsCache.set(cacheKey, req$);
    return req$;
  }

  create(request: RoomCreateRequest): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(this.apiUrl, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  changeHousekeepingStatus(roomId: number, status: string): Observable<RoomResponse> {
    return this.http.patch<RoomResponse>(`${this.apiUrl}/${roomId}/housekeeping-status`, {
      housekeepingStatus: status
    }).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  private invalidateAllCache(): void {
    this.roomsCache.clear();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_rooms_')) localStorage.removeItem(key);
    }
  }
}