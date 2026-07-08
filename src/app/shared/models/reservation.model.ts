export type ReservationSource =
  | 'DIRECT'
  | 'PHONE'
  | 'WEBSITE'
  | 'AGENCY'
  | 'BOOKING_PLATFORM';

export type ReservationStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export type ReservationRoomStatus =
  | 'RESERVED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export type HousekeepingStatus =
  | 'CLEAN'
  | 'DIRTY'
  | 'INSPECTED';

export interface ReservationResponse {
  id: number;
  hotelId: number;
  guestId: number;
  reservationNumber: string;
  source: ReservationSource;
  status: ReservationStatus;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalAmount: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  rooms: ReservationRoomResponse[];
}

export interface ReservationRoomResponse {
  id: number;
  roomTypeId: number;
  roomId: number | null;
  ratePlanId: number | null;
  guestsCount: number;
  pricePerNight: number;
  status: ReservationRoomStatus;
}

export interface ReservationRoomRequest {
  roomTypeId: number;
  roomId?: number | null;
  ratePlanId?: number | null;
  guestsCount: number;
  pricePerNight?: number | null;
}

export interface ReservationCreateRequest {
  hotelId: number;
  guestId: number;
  reservationNumber?: string | null;
  source: ReservationSource;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  comment?: string | null;
  rooms: ReservationRoomRequest[];
}

export interface ReservationUpdateRequest {
  hotelId?: number | null;
  guestId?: number | null;
  source?: ReservationSource | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  adults?: number | null;
  children?: number | null;
  comment?: string | null;
  rooms?: ReservationRoomRequest[] | null;
}

export interface AvailabilityRoomResponse {
  roomId: number;
  roomNumber: string;
  floor: number | null;
  hotelId: number;
  hotelName: string;
  roomTypeId: number;
  roomTypeName: string;
  capacity: number;
  basePrice: number;
  roomStatus: RoomStatus;
  housekeepingStatus: HousekeepingStatus;

  /**
   * Alias-поля для совместимости с компонентом создания бронирований.
   * В ReservationService они заполняются вручную.
   */
  id?: number;
  status?: RoomStatus;
}

export interface BookingBoardCellResponse {
  roomId: number;
  roomNumber: string;
  date: string;
  status: ReservationStatus | RoomStatus | string;
  reservationId: number | null;
  reservationNumber: string | null;
  guestId: number | null;
}

export interface BookingBoardRoomRow {
  roomId: number;
  roomNumber: string;
  cells: BookingBoardCellResponse[];
}
