export interface RatePlanResponse {
  id: number;
  hotelId: number;
  hotelName: string;
  code: string;
  name: string;
  description: string | null;
  cancellationPolicy: string | null;
  breakfastIncluded: boolean;
  refundable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatePlanCreateRequest {
  hotelId: number;
  code: string;
  name: string;
  description: string | null;
  cancellationPolicy: string | null;
  breakfastIncluded: boolean;
  refundable: boolean;
}

export interface RatePlanUpdateRequest {
  code: string;
  name: string;
  description: string | null;
  cancellationPolicy: string | null;
  breakfastIncluded: boolean;
  refundable: boolean;
}
