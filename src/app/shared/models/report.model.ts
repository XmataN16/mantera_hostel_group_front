export interface OccupancyReportResponse {
  hotelId: number;
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  bookedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyPercent: number;
}

export interface CheckInOutReportResponse {
  hotelId: number;
  date: string;
  checkIns: number;
  checkOuts: number;
}

export interface RevenueReportResponse {
  hotelId: number;
  fromDate: string;
  toDate: string;
  accommodationRevenue: number;
  servicesRevenue: number;
  totalRevenue: number;
}

export interface DebtReportItemResponse {
  reservationId: number;
  reservationNumber: string;
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
}

export interface DebtReportResponse {
  hotelId: number;
  totalDebt: number;
  items: DebtReportItemResponse[];
}

export interface RoomTypeDistributionItemResponse {
  roomTypeId: number;
  roomTypeName: string;
  staysCount: number;
}
