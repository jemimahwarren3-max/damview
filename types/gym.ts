import type { EnquiryBase } from "./enquiry";

export type BillingPeriod = "session" | "month" | "year";

export interface GymPackage {
  id: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  features: string[];
}

export interface GymEnquiry extends EnquiryBase {
  packageId?: string;
}
