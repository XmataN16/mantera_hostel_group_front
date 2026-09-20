export interface AdditionalServiceDto {
  id: number;
  hotelId: number;
  name: string;
  price: number;
}

export interface ReservationServiceItem {
  id: number;
  serviceName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface PaymentItem {
  id: number;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
  comment: string;
}

export interface InvoiceResponse {
  reservationId: number;
  reservationNumber: string;
  accommodationAmount: number;
  servicesAmount: number;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  services: ReservationServiceItem[];
  payments: PaymentItem[];
}
