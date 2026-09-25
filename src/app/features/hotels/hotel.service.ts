import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HotelDto, HotelCreateRequest } from '../../shared/models/hotel.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/hotels`;

  private readonly CACHE_KEY = 'cache_hotels_all';
  private hotelsCache$: Observable<HotelDto[]> | null = null;

  getAll(forceReload: boolean = false): Observable<HotelDto[]> {
    if (!forceReload) {
      const cached = StorageCache.get<HotelDto[]>(this.CACHE_KEY);
      if (cached) return of(cached);
      if (this.hotelsCache$) return this.hotelsCache$;
    }

    this.hotelsCache$ = this.http.get<HotelDto[]>(this.apiUrl).pipe(
      tap(data => StorageCache.set(this.CACHE_KEY, data, 60)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.hotelsCache$ = null;
        return throwError(() => err);
      })
    );
    return this.hotelsCache$;
  }

  create(request: HotelCreateRequest): Observable<HotelDto> {
    return this.http.post<HotelDto>(this.apiUrl, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  private invalidateCache(): void {
    this.hotelsCache$ = null;
    StorageCache.remove(this.CACHE_KEY);
  }
}