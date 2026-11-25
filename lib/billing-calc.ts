/**
 * Server-side billing calculations for Damview Resort.
 * Supports both nightly and hourly billing modes.
 * All financial calculations happen here, never on the client.
 */

export type BillingMode = "nightly" | "hourly";

interface BillingInput {
  billingMode: BillingMode;
  checkIn: Date;
  checkOut: Date;
  nightlyRate: number;
  hourlyRate?: number;
  taxPercent: number;
  foodCharges: number;
  extraCharges: number;
  discountAmount: number;
}

interface BillingBreakdown {
  stayDuration: string;
  nights: number;
  hours: number;
  roomCharges: number;
  foodCharges: number;
  extraCharges: number;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export function calculateBilling(input: BillingInput): BillingBreakdown {
  const {
    billingMode,
    checkIn,
    checkOut,
    nightlyRate,
    hourlyRate,
    taxPercent,
    foodCharges,
    extraCharges,
    discountAmount,
  } = input;

  const diffMs = checkOut.getTime() - checkIn.getTime();
  const totalHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  const totalNights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let roomCharges: number;
  let nights = 0;
  let hours = 0;
  let stayDuration: string;

  if (billingMode === "hourly") {
    hours = totalHours;
    roomCharges = round2(hours * (hourlyRate ?? 0));
    stayDuration =
      hours >= 24
        ? `${Math.floor(hours / 24)}d ${hours % 24}h`
        : `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    nights = totalNights;
    roomCharges = round2(nights * nightlyRate);
    stayDuration = `${nights} night${nights !== 1 ? "s" : ""}`;
  }

  const subtotal = round2(roomCharges + foodCharges + extraCharges);
  const taxableAmount = round2(subtotal - discountAmount);
  const taxAmount = round2(taxableAmount * (taxPercent / 100));
  const totalAmount = round2(taxableAmount + taxAmount);

  return {
    stayDuration,
    nights,
    hours,
    roomCharges,
    foodCharges,
    extraCharges,
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
