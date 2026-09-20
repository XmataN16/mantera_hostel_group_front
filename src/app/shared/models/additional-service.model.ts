export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

export interface AdditionalServiceResponse {
  id: number;
  hotelId: number;
  hotelName: string;
  name: string;
  description: string | null;
  price: number;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdditionalServiceCreateRequest {
  hotelId: number;
  name: string;
  description: string | null;
  price: number;
}

export interface AdditionalServiceUpdateRequest {
  name: string;
  description: string | null;
  price: number;
  status: ServiceStatus;
}
