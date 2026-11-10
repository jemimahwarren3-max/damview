"use client";

import { useEffect, useState } from "react";
import { Clock, Copy, Check, AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { getSupabaseClient } from "@/lib/supabase/client";
import { generateInvoicePdf } from "@/lib/pdf/invoice";

interface PaymentStatusResponse {
  paymentReference: string;
  customerName: string;
  expectedAmount: number;
  currency: string;
  amountClaimed: number | null;
  paymentStatus: string;
  paymentDeadline: string;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  receiptNumber: string | null;
  ecocashTransactionReference: string | null;
  customerEmail: string | null;
  detail: { label: string; value: string } | null;
}

interface MerchantSettings {
  merchant_name: string;
  merchant_code: string;
  merchant_instructions: string;
}

const STATUS_COPY: Record<string, { label: string; tone: string }> = {
  AWAITING_PAYMENT: { label: "Awaiting payment", tone: "text-dv-pool" },
  PROOF_SUBMITTED: { label: "Under review", tone: "text-dv-gold" },
  UNDER_VERIFICATION: { label: "Under review", tone: "text-dv-gold" },
  VERIFIED: { label: "Paid & verified", tone: "text-dv-leaf" },
  REJECTED: { label: "Needs attention", tone: "text-destructive" },
  EXPIRED: { label: "Expired", tone: "text-destructive" },
  CANCELLED: { label: "Cancelled", tone: "text-muted-foreground" },
};

export function PaymentStatusClient({ reference }: { reference: string }) {
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [settings, setSettings] = useState<MerchantSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [ecocashRef, setEcocashRef] = useState("");
  const [ecocashNumber, setEcocashNumber] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/payments/${reference}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Payment not found.");
        }
        return res.json();
      })
      .then((data: PaymentStatusResponse) => {
        setPayment(data);
        if (data.customerEmail) setEmail(data.customerEmail);
      })
      .catch((e) => setLoadError(e.message));
  };

  useEffect(() => {
    load();
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase
        .from("payment_settings")
        .select("merchant_name, merchant_code, merchant_instructions")
        .eq("id", true)
        .maybeSingle()
        .then(({ data }) => setSettings(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const copyCode = async () => {
    if (!settings) return;
    try {
      await navigator.clipboard.writeText(settings.merchant_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable - the code is also shown as plain text.
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!file) {
      setSubmitError("Please attach your proof of payment.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("ecocashTransactionReference", ecocashRef);
    formData.append("customerEcocashNumber", ecocashNumber);
    formData.append("customerEmail", email);
    formData.append("file", file);

    try {
      const res = await fetch(`/api/payments/${reference}/submit`, { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReceipt = () => {
    if (!payment || !payment.receiptNumber) return;
    generateInvoicePdf({
      documentType: "Receipt",
      documentNumber: payment.receiptNumber,
      customerName: payment.customerName,
      issueDate: (payment.verifiedAt ?? payment.submittedAt ?? new Date().toISOString()).slice(0, 10),
      items: [{ description: payment.detail?.value ?? "Payment to Damview Resort", quantity: 1, unitPrice: payment.expectedAmount }],
      amountPaid: payment.expectedAmount,
      paymentMethod: "EcoCash",
    });
  };

  if (loadError) {
    return (
      <Container className="py-24 text-center">
        <SectionHeading eyebrow="Payment" title="We couldn't find this payment." subtitle={loadError} />
      </Container>
    );
  }

  if (!payment) {
    return <Container className="py-24 text-center text-muted-foreground">Loading...</Container>;
  }

  const status = STATUS_COPY[payment.paymentStatus] ?? { label: payment.paymentStatus, tone: "text-muted-foreground" };
  const canSubmit = payment.paymentStatus === "AWAITING_PAYMENT" || payment.paymentStatus === "REJECTED";

  return (
    <div className="py-20">
      <Container className="max-w-xl">
        <SectionHeading eyebrow={`Reference ${payment.paymentReference}`} title="Your payment" />

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-sm font-bold ${status.tone}`}>{status.label}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Customer</span>
            <span className="text-sm font-medium">{payment.customerName}</span>
          </div>
          {payment.detail && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{payment.detail.label}</span>
              <span className="text-sm font-medium text-right">{payment.detail.value}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount due</span>
            <span className="font-serif text-xl text-dv-forest">
              ${payment.expectedAmount.toFixed(2)} {payment.currency}
            </span>
          </div>
          {payment.paymentStatus === "AWAITING_PAYMENT" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-dv-gold">
              <Clock size={15} />
              Pay before {new Date(payment.paymentDeadline).toLocaleString()}
            </div>
          )}
        </div>

        {payment.paymentStatus === "AWAITING_PAYMENT" && settings && (
          <div className="mt-6 rounded-2xl border border-dv-pool/30 bg-dv-pool/10 p-6">
            <h3 className="font-serif text-lg text-dv-forest">Pay with EcoCash</h3>
            <p className="mt-2 text-sm text-dv-black/80">{settings.merchant_instructions}</p>
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-dv-pool/30 bg-background px-4 py-3">
              <div>
                <span className="text-xs text-muted-foreground">Merchant code</span>
                <p className="font-serif text-lg text-dv-forest">{settings.merchant_code}</p>
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-dv-forest px-4 py-2 text-xs font-bold text-dv-ivory hover:bg-dv-leaf"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs text-dv-black/60">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Never share your EcoCash PIN, password or one-time code with anyone.
            </p>
          </div>
        )}

        {canSubmit && (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-serif text-lg text-dv-forest">Submit your payment details</h3>
            {payment.paymentStatus === "REJECTED" && payment.rejectionReason && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Previous submission was not accepted: {payment.rejectionReason}
              </p>
            )}
            <div>
              <label className="text-sm font-medium text-dv-black">EcoCash transaction reference</label>
              <input
                required
                value={ecocashRef}
                onChange={(e) => setEcocashRef(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dv-black">EcoCash number used to pay</label>
              <input
                required
                value={ecocashNumber}
                onChange={(e) => setEcocashNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dv-black">Email (optional, to receive your receipt)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dv-black">Proof of payment (JPG, PNG or PDF)</label>
              <input
                required
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-fit items-center gap-2 rounded-full bg-dv-forest px-6 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf disabled:opacity-60"
            >
              <Upload size={15} /> {submitting ? "Submitting..." : "Submit for verification"}
            </button>
          </form>
        )}

        {(payment.paymentStatus === "PROOF_SUBMITTED" || payment.paymentStatus === "UNDER_VERIFICATION") && (
          <div className="mt-6 rounded-2xl border border-dv-gold/40 bg-dv-sunshine/20 p-6 text-sm text-dv-black">
            Thanks - your payment evidence has been received and is being checked against Damview&apos;s
            merchant account. We&apos;ll update this page once it&apos;s verified.
          </div>
        )}

        {payment.paymentStatus === "VERIFIED" && (
          <div className="mt-6 rounded-2xl border border-dv-leaf/40 bg-dv-leaf/10 p-6 text-center">
            <CheckCircle2 className="mx-auto text-dv-leaf" size={28} />
            <p className="mt-2 font-serif text-lg text-dv-forest">Payment verified</p>
            <p className="mt-1 text-sm text-dv-black/70">Receipt {payment.receiptNumber}</p>
            {payment.customerEmail && (
              <p className="mt-1 text-xs text-dv-black/50">Also emailed to {payment.customerEmail}</p>
            )}
            <button
              type="button"
              onClick={downloadReceipt}
              className="mt-4 rounded-full bg-dv-forest px-6 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf"
            >
              Download receipt
            </button>
          </div>
        )}

        {payment.paymentStatus === "EXPIRED" && (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-sm text-dv-black/80">
              The payment deadline passed before this was completed. Please get in touch so we can
              help.
            </p>
            <div className="mt-4 flex justify-center">
              <WhatsAppButton label="Contact Damview on WhatsApp" message={`Hi, my payment (ref ${payment.paymentReference}) expired, please help.`} />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
