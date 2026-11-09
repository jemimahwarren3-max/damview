import type { EnquiryBase } from "./enquiry";

export type PricingUnit = "per_person" | "per_hour" | "per_session" | "free";

export interface ActivityPricing {
  amount: number;
  unit: PricingUnit;
}

export type ActivityCategory = "damside" | "recreational";

export interface Activity {
  id: string;
  category: ActivityCategory;
  name: string;
  description: string;
  pricing?: ActivityPricing;
  image?: string;
}

export interface ActivityEnquiry extends EnquiryBase {
  activityId: string;
  preferredDate?: string;
  partySize?: number;
}
