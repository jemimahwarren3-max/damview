import type { EnquiryBase } from "./enquiry";

export type EventType =
  | "wedding"
  | "birthday"
  | "private_party"
  | "family_gathering"
  | "corporate"
  | "conference"
  | "other";

export interface EventEnquiry extends EnquiryBase {
  eventType: EventType;
  proposedDate: string;
  expectedGuests: number;
  facilitiesRequired: string[];
  cateringRequired: boolean;
  accommodationRequired: boolean;
}
