export interface ReservationResponse {
  id: number;
  hotelId: number;
  guestId: number;
  reservationNumber: string;
  source: 'DIRECT' | 'PHONE' | 'WEBSITE' | 'AGENCY' | 'BOOKING_PLATFORM';
  status: 'CREATED' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalAmount: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  rooms: ReservationRoomResponse[];
}

export interface ReservationRoomResponse {
  id: number;
  roomTypeId: number;
  roomId: number;
  ratePlanId: number;
  guestsCount: number;
  pricePerNight: number;
  status: 'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
}

export interface BookingBoardCellResponse {
  roomId: number;
  roomNumber: string;
  date: string;
  status: string;
  reservationId: number | null;
  reservationNumber: string | null;
  guestId: number | null;
}
