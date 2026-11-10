export type PaymentStatus =
  | "AWAITING_PAYMENT"
  | "PROOF_SUBMITTED"
  | "UNDER_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type EnquiryKind = "lodge" | "event";

export interface PaymentSubmission {
  id: string;
  paymentReference: string;
  enquiryType: EnquiryKind;
  lodgeEnquiryId?: string;
  eventEnquiryId?: string;
  customerName: string;
  customerPhone: string;
  expectedAmount: number;
  currency: "USD";
  amountClaimed?: number;
  ecocashTransactionReference?: string;
  customerEcocashNumber?: string;
  proofFilePath?: string;
  proofFileType?: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentDeadline: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAuditLogEntry {
  id: string;
  paymentId: string;
  previousStatus?: PaymentStatus;
  newStatus: PaymentStatus;
  action: string;
  performedBy?: string;
  reason?: string;
  createdAt: string;
}

export interface PaymentSettings {
  merchantName: string;
  merchantCode: string;
  merchantInstructions: string;
  uploadMaxMb: number;
  paymentDeadlineHours: number;
  manualVerificationEnabled: boolean;
}
