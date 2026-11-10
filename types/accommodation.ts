import type { EnquiryBase } from "./enquiry";

export type RoomStatus = "available" | "held" | "booked" | "maintenance";

export interface RoomBlock {
  id: string;
  /** Internal code, e.g. "A Block" — for admin/staff use, never shown to guests. */
  name: string;
  /** Guest-facing name, e.g. "Garden Rooms" — this is what the public site shows. */
  displayName: string;
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
