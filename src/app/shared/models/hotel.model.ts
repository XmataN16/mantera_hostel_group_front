export interface HotelDto {
  id: number;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface HotelCreateRequest {
  name: string;
  shortName?: string;
  address: string;
  phone?: string;
  email?: string;
  timezone?: string;
}
