import type { EnquiryBase } from "./enquiry";

export type RoomStatus = "available" | "booked" | "maintenance";

export interface RoomBlock {
  id: string;
  name: string;
  roomNumbers: string[];
  ratePerStay: number;
  stayDurationHours: number;
}

export interface Room {
  id: string;
  blockId: string;
  number: string;
  status: RoomStatus;
}

export interface LodgeEnquiry extends EnquiryBase {
  blockId?: string;
  checkIn: string;
  guests: number;
}
