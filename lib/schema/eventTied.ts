export enum TicketType {
  GENERAL_ADMISSION = "GENERAL_ADMISSION",
  ASSIGNED_SEATING = "ASSIGNED_SEATING",
  TABLE = "TABLE",
}

export interface TicketTierBase {
  name: string;
  type: TicketType;
  base_price: number;
  quantity_available: number;
  is_free?: boolean;
  config?: TicketConfig;
  allow_combined_names?: boolean;
}

export interface TableTicketConfig {
  seats_per_table: number;
}

export interface VipTicketConfig {
  lounge_access?: boolean;
}

export interface AssignedSeatingConfig {
  row_count: number;
  seats_per_row: number;
}

export type TicketConfig =
  | TableTicketConfig
  | VipTicketConfig
  | AssignedSeatingConfig
  | null;

export interface LocationData {
  formatted_address: string;
  lat: number;
  lng: number;
  place_id?: string;
}

export interface EventBase {
  title: string;
  slug: string;
  description: string;
  country: string;
  location: string;
  start_time: string;
  end_time: string;
  banner_image_url: string;
  image_url: string;
  category?: string;
  tags?: string;
  location_data?: LocationData;
}

export interface TicketTier extends TicketTierBase {
  id: string;
}

export interface Event extends EventBase {
  id: string;
  status: string;
  ticket_tiers?: TicketTier[];
}

export type EventCreate = EventBase;
export type TicketTierCreate = TicketTierBase;
export type EventUpdate = Partial<EventBase>;
