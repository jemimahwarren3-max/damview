"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { PaymentStatus, PaymentSubmission } from "@/types";

const STATUS_FILTERS: (PaymentStatus | "ALL")[] = [
  "ALL",
  "AWAITING_PAYMENT",
  "PROOF_SUBMITTED",
  "UNDER_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
];

function toBadge(status: PaymentStatus) {
  if (status === "VERIFIED") return "confirmed" as const;
  if (status === "REJECTED" || status === "EXPIRED" || status === "CANCELLED") return "maintenance" as const;
  return "pending" as const;
}

export default function AdminPaymentsQueuePage() {
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [filter, setFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("payment_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) return;
        setPayments(
          data.map((row) => ({
            id: row.id,
            paymentReference: row.payment_reference,
            enquiryType: row.enquiry_type as PaymentSubmission["enquiryType"],
            lodgeEnquiryId: row.lodge_enquiry_id ?? undefined,
            eventEnquiryId: row.event_enquiry_id ?? undefined,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            expectedAmount: Number(row.expected_amount),
            currency: row.currency as "USD",
            amountClaimed: row.amount_claimed ? Number(row.amount_claimed) : undefined,
            ecocashTransactionReference: row.ecocash_transaction_reference ?? undefined,
            customerEcocashNumber: row.customer_ecocash_number ?? undefined,
            proofFilePath: row.proof_file_path ?? undefined,
            proofFileType: row.proof_file_type ?? undefined,
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status as PaymentStatus,
            paymentDeadline: row.payment_deadline,
            submittedAt: row.submitted_at ?? undefined,
            verifiedAt: row.verified_at ?? undefined,
            verifiedBy: row.verified_by ?? undefined,
            rejectedAt: row.rejected_at ?? undefined,
            rejectedBy: row.rejected_by ?? undefined,
            rejectionReason: row.rejection_reason ?? undefined,
            receiptNumber: row.receipt_number ?? undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }))
        );
      });
  }, []);

  const [summary, setSummary] = useState({
    awaiting: 0,
    submitted: 0,
    underVerification: 0,
    verifiedToday: 0,
    rejected: 0,
    expired: 0,
  });

  useEffect(() => {
    // "Verified today" depends on the current date, which must be read at
    // runtime (in an effect, not a render-time useMemo) or it breaks
    // prerendering - see the Next.js "unstable value new Date()" error.
    const today = new Date().toDateString();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setSummary({
      awaiting: payments.filter((p) => p.paymentStatus === "AWAITING_PAYMENT").length,
      submitted: payments.filter((p) => p.paymentStatus === "PROOF_SUBMITTED").length,
      underVerification: payments.filter((p) => p.paymentStatus === "UNDER_VERIFICATION").length,
      verifiedToday: payments.filter((p) => p.paymentStatus === "VERIFIED" && p.verifiedAt && new Date(p.verifiedAt).toDateString() === today).length,
      rejected: payments.filter((p) => p.paymentStatus === "REJECTED").length,
      expired: payments.filter((p) => p.paymentStatus === "EXPIRED").length,
    });
  }, [payments]);

  const filtered = payments.filter((p) => {
    if (filter !== "ALL" && p.paymentStatus !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${p.paymentReference} ${p.customerName} ${p.ecocashTransactionReference ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <AdminShell title="Payments">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so there&apos;s nothing to show here.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Awaiting payment", summary.awaiting],
          ["Proof submitted", summary.submitted],
          ["Under verification", summary.underVerification],
          ["Verified today", summary.verifiedToday],
          ["Rejected", summary.rejected],
          ["Expired", summary.expired],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl border border-border bg-background p-4">
            <span className="block font-serif text-2xl text-dv-forest">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search reference, customer, EcoCash ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as PaymentStatus | "ALL")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            No payments match these filters.
          </p>
        )}
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/admin/payments/${p.paymentReference}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-5 hover:border-dv-pool"
          >
            <div>
              <p className="font-medium text-dv-black">{p.customerName}</p>
              <p className="text-sm text-muted-foreground">
                {p.paymentReference} &middot; ${p.expectedAmount.toFixed(2)} {p.currency} &middot; {p.enquiryType}
              </p>
            </div>
            <StatusBadge status={toBadge(p.paymentStatus)} label={p.paymentStatus.replace("_", " ")} />
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
