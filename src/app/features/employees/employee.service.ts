import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, shareReplay, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EmployeeResponse,
  EmployeeCreateRequest,
  EmployeeUpdateRequest
} from '../../shared/models/employee.model';
import { StorageCache } from '../../core/utils/storage-cache.util';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employees`;

  private employeesCache = new Map<string, Observable<EmployeeResponse[]>>();

  private getCacheKey(hotelId?: number): string {
    return `cache_employees_${hotelId ?? 'all'}`;
  }

  getAll(hotelId?: number, forceReload: boolean = false): Observable<EmployeeResponse[]> {
    const cacheKey = this.getCacheKey(hotelId);

    if (!forceReload) {
      const cached = StorageCache.get<EmployeeResponse[]>(cacheKey);
      if (cached) return of(cached);
      const inMemory = this.employeesCache.get(cacheKey);
      if (inMemory) return inMemory;
    }

    let params = new HttpParams();
    if (hotelId) params = params.set('hotelId', hotelId.toString());

    const req$ = this.http.get<EmployeeResponse[]>(this.apiUrl, { params }).pipe(
      tap(data => StorageCache.set(cacheKey, data, 30)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        this.employeesCache.delete(cacheKey);
        return throwError(() => err);
      })
    );

    this.employeesCache.set(cacheKey, req$);
    return req$;
  }

  getById(id: number): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: EmployeeCreateRequest): Observable<EmployeeResponse> {
    return this.http.post<EmployeeResponse>(this.apiUrl, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  update(id: number, request: EmployeeUpdateRequest): Observable<EmployeeResponse> {
    return this.http.put<EmployeeResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateAllCache())
    );
  }

  private invalidateAllCache(): void {
    this.employeesCache.clear();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_employees_')) localStorage.removeItem(key);
    }
  }
}