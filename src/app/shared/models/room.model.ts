export interface RoomTypeResponse {
  id: number;
  hotelId: number;
  hotelName: string;
  code: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface RoomTypeCreateRequest {
  hotelId: number;
  code: string;
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
}

export interface RoomResponse {
  id: number;
  hotelId: number;
  hotelName: string;
  roomTypeId: number;
  roomTypeName: string;
  roomNumber: string;
  floor: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  housekeepingStatus: 'CLEAN' | 'DIRTY' | 'INSPECTED';
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomCreateRequest {
  hotelId: number;
  roomTypeId: number;
  roomNumber: string;
  floor?: number;
  comment?: string;
}
