import { ReservationStatus } from './reservation.model';

export type GuestGender = 'MALE' | 'FEMALE' | 'OTHER';

export type GuestDocumentType =
  | 'PASSPORT'
  | 'FOREIGN_PASSPORT'
  | 'BIRTH_CERTIFICATE'
  | 'DRIVER_LICENSE'
  | 'OTHER';

export interface GuestResponse {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  birthDate: string;
  gender: string;
  phone: string | null;
  email: string | null;
  citizenship: string | null;
  documentType: string;
  documentNumber: string;
  documentIssueDate: string | null;
  documentIssuedBy: string | null;
  address: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuestCreateRequest {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  birthDate: string;
  gender: string;
  phone?: string | null;
  email?: string | null;
  citizenship?: string | null;
  documentType: string;
  documentNumber: string;
  documentIssueDate?: string | null;
  documentIssuedBy?: string | null;
  address?: string | null;
  comment?: string | null;
}

export interface GuestUpdateRequest {
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  citizenship?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  documentIssueDate?: string | null;
  documentIssuedBy?: string | null;
  address?: string | null;
  comment?: string | null;
}

export interface GuestStayHistoryResponse {
  reservationId: number;
  reservationNumber: string;
  hotelId: number;
  checkInDate: string;
  checkOutDate: string;
  status: ReservationStatus;
  totalAmount: number;
}
