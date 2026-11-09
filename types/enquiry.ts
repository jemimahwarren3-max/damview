export type EnquiryStatus = "new" | "contacted" | "confirmed" | "declined";

export interface EnquiryBase {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: EnquiryStatus;
  createdAt: string;
}
