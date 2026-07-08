import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CheckInOutReportResponse,
  DebtReportResponse,
  OccupancyReportResponse,
  RevenueReportResponse,
  RoomTypeDistributionItemResponse
} from '../../shared/models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getOccupancy(
    hotelId: number,
    date: string
  ): Observable<OccupancyReportResponse> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('date', date);

    return this.http.get<OccupancyReportResponse>(
      `${this.apiUrl}/occupancy`,
      { params }
    );
  }

  getCheckInsCheckOuts(
    hotelId: number,
    date: string
  ): Observable<CheckInOutReportResponse> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('date', date);

    return this.http.get<CheckInOutReportResponse>(
      `${this.apiUrl}/checkins-checkouts`,
      { params }
    );
  }

  getRevenue(
    hotelId: number,
    fromDate: string,
    toDate: string
  ): Observable<RevenueReportResponse> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<RevenueReportResponse>(
      `${this.apiUrl}/revenue`,
      { params }
    );
  }

  getDebts(hotelId: number): Observable<DebtReportResponse> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString());

    return this.http.get<DebtReportResponse>(
      `${this.apiUrl}/debts`,
      { params }
    );
  }

  getRoomTypeDistribution(
    hotelId: number,
    fromDate: string,
    toDate: string
  ): Observable<RoomTypeDistributionItemResponse[]> {
    const params = new HttpParams()
      .set('hotelId', hotelId.toString())
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<RoomTypeDistributionItemResponse[]>(
      `${this.apiUrl}/room-type-distribution`,
      { params }
    );
  }
}
