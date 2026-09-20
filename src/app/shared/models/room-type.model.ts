export type RoomTypeStatus = 'ACTIVE' | 'INACTIVE';

export interface RoomTypeResponse {
  id: number;
  hotelId: number;
  hotelName: string;
  code: string;
  name: string;
  description: string | null;
  capacity: number;
  basePrice: number;
  status: RoomTypeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RoomTypeCreateRequest {
  hotelId: number;
  code: string;
  name: string;
  description: string | null;
  capacity: number;
  basePrice: number;
}

export interface RoomTypeUpdateRequest {
  code: string;
  name: string;
  description: string | null;
  capacity: number;
  basePrice: number;
  status: RoomTypeStatus;
}
