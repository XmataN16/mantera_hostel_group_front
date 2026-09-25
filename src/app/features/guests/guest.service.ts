import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GuestCreateRequest,
  GuestResponse,
  GuestStayHistoryResponse,
  GuestUpdateRequest
} from '../../shared/models/guest.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class GuestService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/guests`;

  private readonly CACHE_KEY = 'cache_guests_all';
  private guestsCache$: Observable<GuestResponse[]> | null = null;

  getAll(forceReload: boolean = false): Observable<GuestResponse[]> {
    if (!forceReload) {
      const cached = StorageCache.get<GuestResponse[]>(this.CACHE_KEY);
      if (cached) return of(cached);
      if (this.guestsCache$) return this.guestsCache$;
    }

    this.guestsCache$ = this.http.get<GuestResponse[]>(this.apiUrl).pipe(
      tap(data => StorageCache.set(this.CACHE_KEY, data, 15)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.guestsCache$ = null;
        return throwError(() => err);
      })
    );
    return this.guestsCache$;
  }

  getById(id: number): Observable<GuestResponse> {
    return this.http.get<GuestResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: GuestCreateRequest): Observable<GuestResponse> {
    return this.http.post<GuestResponse>(this.apiUrl, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  update(id: number, request: GuestUpdateRequest): Observable<GuestResponse> {
    return this.http.put<GuestResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  getStayHistory(id: number): Observable<GuestStayHistoryResponse[]> {
    return this.http.get<GuestStayHistoryResponse[]>(`${this.apiUrl}/${id}/history`);
  }

  private invalidateCache(): void {
    this.guestsCache$ = null;
    StorageCache.remove(this.CACHE_KEY);
  }
}