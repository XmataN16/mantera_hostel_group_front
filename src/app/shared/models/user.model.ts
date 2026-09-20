export interface UserAccountResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  username: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserAccountCreateRequest {
  employeeId: number;
  username: string;
  password: string;
  roleCodes: string[];
}

export interface EmployeeDto {
  id: number;
  hotelId: number;
  hotelName: string;
  fullName: string;
  position: string;
  phone: string;
  email: string;
  status: string;
}

export interface RoleDto {
  id: number;
  code: string;
  name: string;
}
