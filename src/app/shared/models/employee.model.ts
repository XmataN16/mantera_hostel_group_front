export type EmployeeStatus = 'ACTIVE' | 'TERMINATED' | 'ON_VACATION';

export interface EmployeeResponse {
  id: number;
  hotelId: number;
  hotelName: string;
  fullName: string;
  position: string;
  phone: string | null;
  email: string | null;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreateRequest {
  hotelId: number;
  fullName: string;
  position: string;
  phone: string | null;
  email: string | null;
}

export interface EmployeeUpdateRequest {
  fullName: string;
  position: string;
  phone: string | null;
  email: string | null;
  status: EmployeeStatus;
}
