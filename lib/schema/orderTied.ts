export type Attendee = {
  name: string;
  email: string;
  phone?: string;
  seat_number?: string | number;
  table_number?: number;
};

export interface ReservationItem {
  tier_id: string;
  quantity: number;
  shared_attendee?: boolean;
  attendees?: Attendee[];
}

export interface ReservationResponse {
  reservation_id: string;
  expires_at: string;
  total_amount: number;
  items: unknown[];
}
