export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  id: string;
  created_at: string;
  date: string;
  time_slot: string;
  name: string;
  phone: string;
  email?: string;
  party_size: number;
  notes?: string;
  status: BookingStatus;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingFormData {
  date: string;
  time_slot: string;
  name: string;
  phone: string;
  email?: string;
  party_size: number;
  notes?: string;
}
