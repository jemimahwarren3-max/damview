"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

interface GuestCentreResult {
  name: string;
  blockName: string | null;
  checkIn: string;
  guests: number;
  status: string;
  roomAssigned: boolean;
  payment: { reference: string; status: string; receiptNumber: string | null } | null;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Received - our team will be in touch",
  contacted: "We've been in touch about this booking",
  confirmed: "Confirmed",
  declined: "Declined",
};

const PAYMENT_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting your payment",
  PROOF_SUBMITTED: "Payment evidence received - under review",
  UNDER_VERIFICATION: "Under review",
  VERIFIED: "Payment verified",
  REJECTED: "Payment evidence was not accepted",
  EXPIRED: "Payment window expired",
  CANCELLED: "Cancelled",
};

export default function GuestCentrePage() {
  const [bookingReference, setBookingReference] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<GuestCentreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/guest-centre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingReference, phone }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20">
      <Container className="max-w-xl">
        <SectionHeading
          eyebrow="Guest Centre"
          title="Check your booking."
          subtitle="Lost your payment link, or just want an update? Enter your booking reference and the phone number you booked with."
        />

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6">
          <div>
            <label className="text-sm font-medium text-dv-black">Booking reference</label>
            <input
              required
              value={bookingReference}
              onChange={(e) => setBookingReference(e.target.value)}
              placeholder="DV-XXXXXXXXXX"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 uppercase"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dv-black">Phone number used to book</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-fit items-center gap-2 rounded-full bg-dv-forest px-6 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf disabled:opacity-60"
          >
            <Search size={15} /> {loading ? "Checking..." : "Check status"}
          </button>
        </form>

        {result && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Booking status</span>
              <span className="text-sm font-bold text-dv-forest">{STATUS_LABELS[result.status] ?? result.status}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Room type</span>
              <span className="text-sm font-medium">{result.blockName ?? "Not yet assigned"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Check-in</span>
              <span className="text-sm font-medium">{result.checkIn} &middot; {result.guests} guests</span>
            </div>
            {result.payment && (
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Payment</span>
                <span className="text-sm font-medium">{PAYMENT_LABELS[result.payment.status] ?? result.payment.status}</span>
              </div>
            )}
            {result.payment?.receiptNumber && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Receipt</span>
                <span className="text-sm font-medium">{result.payment.receiptNumber}</span>
              </div>
            )}
            <div className="mt-5 border-t border-border pt-4">
              <WhatsAppButton label="Questions? Message us" message={`Hi, I'm checking on booking ${bookingReference}.`} />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
