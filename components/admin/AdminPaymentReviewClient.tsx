"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck, Ban, Clock3 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { recordDocument } from "@/lib/documents";
import { cn } from "@/lib/utils";
import type { PaymentAuditLogEntry, PaymentStatus } from "@/types";

interface PaymentRow {
  id: string;
  paymentReference: string;
  enquiryType: "lodge" | "event";
  lodgeEnquiryId?: string;
  eventEnquiryId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  expectedAmount: number;
  currency: string;
  amountClaimed?: number;
  ecocashTransactionReference?: string;
  customerEcocashNumber?: string;
  proofFilePath?: string;
  proofFileType?: string;
  paymentStatus: PaymentStatus;
  paymentDeadline: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  receiptNumber?: string;
  roomId?: string;
  bookedHours?: number;
}

function toBadge(status: PaymentStatus) {
  if (status === "VERIFIED") return "confirmed" as const;
  if (status === "REJECTED" || status === "EXPIRED" || status === "CANCELLED") return "maintenance" as const;
  return "pending" as const;
}

export function AdminPaymentReviewClient({ reference }: { reference: string }) {
  const [payment, setPayment] = useState<PaymentRow | null>(null);
  const [auditLog, setAuditLog] = useState<PaymentAuditLogEntry[]>([]);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [checklist, setChecklist] = useState({ exists: false, recipient: false, amount: false, notReused: false });
  const [busy, setBusy] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = await supabase.from("payment_submissions").select("*").eq("payment_reference", reference).maybeSingle();
    if (!data) return;

    const row: PaymentRow = {
      id: data.id,
      paymentReference: data.payment_reference,
      enquiryType: data.enquiry_type as "lodge" | "event",
      lodgeEnquiryId: data.lodge_enquiry_id ?? undefined,
      eventEnquiryId: data.event_enquiry_id ?? undefined,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerEmail: data.customer_email ?? undefined,
      expectedAmount: Number(data.expected_amount),
      currency: data.currency,
      amountClaimed: data.amount_claimed ? Number(data.amount_claimed) : undefined,
      ecocashTransactionReference: data.ecocash_transaction_reference ?? undefined,
      customerEcocashNumber: data.customer_ecocash_number ?? undefined,
      proofFilePath: data.proof_file_path ?? undefined,
      proofFileType: data.proof_file_type ?? undefined,
      paymentStatus: data.payment_status as PaymentStatus,
      paymentDeadline: data.payment_deadline,
      submittedAt: data.submitted_at ?? undefined,
      verifiedAt: data.verified_at ?? undefined,
      rejectionReason: data.rejection_reason ?? undefined,
      receiptNumber: data.receipt_number ?? undefined,
    };
    if (row.enquiryType === "lodge" && row.lodgeEnquiryId) {
      const { data: lodgeEnquiry } = await supabase.from("lodge_enquiries").select("room_id").eq("id", row.lodgeEnquiryId).maybeSingle();
      row.roomId = lodgeEnquiry?.room_id ?? undefined;

      // booked_hours is a newer column that may not be live yet - fetched
      // separately so a missing-column error there can never break roomId above.
      const { data: hoursRow } = await supabase.from("lodge_enquiries").select("booked_hours").eq("id", row.lodgeEnquiryId).maybeSingle();
      row.bookedHours = hoursRow?.booked_hours ?? undefined;
    }

    setPayment(row);
    setEmailDraft(row.customerEmail ?? "");

    if (row.proofFilePath) {
      const { data: signed } = await supabase.storage.from("payment-proofs").createSignedUrl(row.proofFilePath, 300);
      setSignedUrl(signed?.signedUrl ?? null);
    }

    const { data: log } = await supabase
      .from("payment_audit_log")
      .select("*")
      .eq("payment_id", data.id)
      .order("created_at", { ascending: false });
    if (log) {
      setAuditLog(
        log.map((l) => ({
          id: l.id,
          paymentId: l.payment_id,
          previousStatus: (l.previous_status as PaymentStatus) ?? undefined,
          newStatus: l.new_status as PaymentStatus,
          action: l.action,
          performedBy: l.performed_by ?? undefined,
          reason: l.reason ?? undefined,
          createdAt: l.created_at,
        }))
      );
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return;
        const { data: profile } = await supabase.from("staff_profiles").select("is_admin").eq("user_id", data.user.id).maybeSingle();
        setIsAdmin(profile?.is_admin ?? false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const logAction = async (previousStatus: string, newStatus: string, action: string, reason?: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !payment) return;
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("payment_audit_log").insert({
      payment_id: payment.id,
      previous_status: previousStatus,
      new_status: newStatus,
      action,
      performed_by: userData.user?.id,
      reason,
    });
  };

  const saveEmail = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !payment) return;
    await supabase.from("payment_submissions").update({ customer_email: emailDraft || null }).eq("id", payment.id);
    setPayment((prev) => (prev ? { ...prev, customerEmail: emailDraft || undefined } : prev));
  };

  const sendReceiptEmail = async (toEmail: string, receiptNumber: string) => {
    if (!payment) return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/send-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toEmail,
          invoice: {
            documentType: "Receipt",
            documentNumber: receiptNumber,
            customerName: payment.customerName,
            issueDate: new Date().toISOString().slice(0, 10),
            items: [
              {
                description: payment.enquiryType === "lodge" ? "Accommodation payment - Damview Resort" : "Event payment - Damview Resort",
                quantity: 1,
                unitPrice: payment.expectedAmount,
              },
            ],
            amountPaid: payment.expectedAmount,
            paymentMethod: "EcoCash",
          },
        }),
      });
      setEmailStatus(res.ok ? "sent" : "failed");
    } catch {
      setEmailStatus("failed");
    }
  };

  const markUnderVerification = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !payment) return;
    setBusy(true);
    await supabase.from("payment_submissions").update({ payment_status: "UNDER_VERIFICATION" }).eq("id", payment.id);
    await logAction(payment.paymentStatus, "UNDER_VERIFICATION", "marked_under_verification");
    setBusy(false);
    load();
  };

  const approve = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !payment) return;
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const amountPaid = payment.amountClaimed ?? payment.expectedAmount;
    let receiptNumber: string;
    try {
      ({ documentNumber: receiptNumber } = await recordDocument(supabase, {
        documentType: "Receipt",
        customerName: payment.customerName,
        items: [{ description: `${payment.enquiryType === "lodge" ? "Accommodation" : "Event"} - ${payment.paymentReference}`, quantity: 1, unitPrice: amountPaid }],
        amountPaid,
        paymentMethod: "EcoCash",
      }));
    } catch {
      setBusy(false);
      window.alert("Could not record the receipt. Please try approving again.");
      return;
    }

    await supabase
      .from("payment_submissions")
      .update({
        payment_status: "VERIFIED",
        verified_at: new Date().toISOString(),
        verified_by: userData.user?.id,
        receipt_number: receiptNumber,
      })
      .eq("id", payment.id);

    if (payment.enquiryType === "lodge" && payment.lodgeEnquiryId) {
      await supabase.from("lodge_enquiries").update({ status: "confirmed" }).eq("id", payment.lodgeEnquiryId);
      if (payment.roomId) {
        await supabase.rpc("confirm_room_booking", { p_room_id: payment.roomId, p_hours: payment.bookedHours });
      }
    } else if (payment.enquiryType === "event" && payment.eventEnquiryId) {
      await supabase.from("event_enquiries").update({ status: "confirmed" }).eq("id", payment.eventEnquiryId);
    }

    await logAction(payment.paymentStatus, "VERIFIED", "approved");
    setBusy(false);
    setConfirmAction(null);

    if (emailDraft) {
      await sendReceiptEmail(emailDraft, receiptNumber);
    }

    load();
  };

  const reject = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !payment || !rejectionReason.trim()) return;
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();

    await supabase
      .from("payment_submissions")
      .update({
        payment_status: "REJECTED",
        rejected_at: new Date().toISOString(),
        rejected_by: userData.user?.id,
        rejection_reason: rejectionReason.trim(),
      })
      .eq("id", payment.id);

    if (payment.enquiryType === "lodge" && payment.roomId) {
      await supabase.rpc("release_room_hold", { p_room_id: payment.roomId });
    }

    await logAction(payment.paymentStatus, "REJECTED", "rejected", rejectionReason.trim());
    setBusy(false);
    setConfirmAction(null);
    setRejectionReason("");
    load();
  };

  if (!payment) {
    return (
      <AdminShell title="Payment review">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </AdminShell>
    );
  }

  const canAct = payment.paymentStatus === "PROOF_SUBMITTED" || payment.paymentStatus === "UNDER_VERIFICATION";
  const checklistComplete = Object.values(checklist).every(Boolean);

  return (
    <AdminShell title="Payment review">
      <Link href="/admin/payments" className="mb-6 inline-flex items-center gap-2 text-sm text-dv-pool hover:underline">
        <ArrowLeft size={15} /> Back to payments
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-dv-forest">{payment.paymentReference}</h2>
              <StatusBadge status={toBadge(payment.paymentStatus)} label={payment.paymentStatus.replace("_", " ")} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Customer</dt><dd className="font-medium">{payment.customerName}</dd></div>
              <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{payment.customerPhone}</dd></div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Email (for receipt)</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-normal"
                  />
                  <button
                    type="button"
                    onClick={saveEmail}
                    className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-dv-forest hover:bg-dv-cream"
                  >
                    Save
                  </button>
                </dd>
              </div>
              <div><dt className="text-muted-foreground">Expected amount</dt><dd className="font-medium">${payment.expectedAmount.toFixed(2)} {payment.currency}</dd></div>
              {payment.bookedHours && (
                <div><dt className="text-muted-foreground">Stay length</dt><dd className="font-medium">{payment.bookedHours} hours (hourly rate)</dd></div>
              )}
              <div>
                <dt className="text-muted-foreground">Amount claimed</dt>
                <dd className={cn("font-medium", payment.amountClaimed != null && payment.amountClaimed !== payment.expectedAmount && "text-destructive")}>
                  {payment.amountClaimed ? `$${payment.amountClaimed.toFixed(2)}` : "-"}
                </dd>
              </div>
              <div><dt className="text-muted-foreground">EcoCash reference</dt><dd className="font-medium">{payment.ecocashTransactionReference ?? "-"}</dd></div>
              <div><dt className="text-muted-foreground">EcoCash number</dt><dd className="font-medium">{payment.customerEcocashNumber ?? "-"}</dd></div>
              <div><dt className="text-muted-foreground">Submitted</dt><dd className="font-medium">{payment.submittedAt ? new Date(payment.submittedAt).toLocaleString() : "-"}</dd></div>
              <div><dt className="text-muted-foreground">Deadline</dt><dd className="font-medium">{new Date(payment.paymentDeadline).toLocaleString()}</dd></div>
            </dl>
            {payment.rejectionReason && (
              <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Rejection reason: {payment.rejectionReason}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="font-serif text-lg text-dv-forest">Proof of payment</h3>
            {signedUrl ? (
              payment.proofFileType === "application/pdf" ? (
                <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-dv-pool hover:underline">
                  <FileText size={16} /> Open PDF evidence
                </a>
              ) : (
                <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                  <img src={signedUrl} alt="Proof of payment" className="max-h-96 rounded-lg border border-border object-contain" />
                </a>
              )
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No proof uploaded yet.</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">This link expires in 5 minutes.</p>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          {canAct && (
            <div className="rounded-2xl border border-dv-gold/40 bg-dv-sunshine/10 p-6">
              <h3 className="font-serif text-lg text-dv-forest">Verify &amp; decide</h3>
              {payment.amountClaimed != null && payment.amountClaimed !== payment.expectedAmount && (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                  Guest claims they paid ${payment.amountClaimed.toFixed(2)}, but ${payment.expectedAmount.toFixed(2)} was due - check
                  this carefully before approving.
                </p>
              )}
              {payment.paymentStatus === "PROOF_SUBMITTED" && (
                <button
                  type="button"
                  onClick={markUnderVerification}
                  disabled={busy}
                  className="mt-3 flex items-center gap-2 rounded-full border border-dv-gold px-4 py-2 text-xs font-bold text-dv-black hover:bg-dv-sunshine/30"
                >
                  <Clock3 size={14} /> Mark under verification
                </button>
              )}

              {isAdmin === false && (
                <p className="mt-3 rounded-lg bg-dv-black/5 px-3 py-2 text-sm text-dv-black/70">
                  Only admin staff can approve or reject a payment. You can still review the evidence
                  and mark it under verification for an admin to finish.
                </p>
              )}

              <div className={cn("mt-4 flex flex-col gap-2 text-sm", isAdmin !== true && "pointer-events-none opacity-50")}>
                {[
                  ["exists", "The transaction exists in Damview's merchant records"],
                  ["recipient", "The recipient is Damview's merchant account"],
                  ["amount", "The amount and currency are correct"],
                  ["notReused", "This transaction hasn't already been used elsewhere"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={checklist[key as keyof typeof checklist]}
                      onChange={(e) => setChecklist((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="mt-0.5"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {isAdmin === true && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmAction("approve")}
                    disabled={!checklistComplete || busy}
                    className="flex items-center gap-2 rounded-full bg-dv-leaf px-4 py-2 text-xs font-bold text-dv-ivory hover:bg-dv-forest disabled:opacity-50"
                  >
                    <ShieldCheck size={14} /> Approve payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction("reject")}
                    disabled={busy}
                    className="flex items-center gap-2 rounded-full border border-destructive px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
                  >
                    <Ban size={14} /> Reject payment
                  </button>
                </div>
              )}

              {confirmAction === "approve" && (
                <div className="mt-4 rounded-lg border border-dv-leaf bg-dv-leaf/10 p-4">
                  <p className="text-sm">Confirm this payment is verified and the booking should be marked confirmed?</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={approve} disabled={busy} className="rounded-full bg-dv-leaf px-4 py-2 text-xs font-bold text-dv-ivory">
                      Yes, approve
                    </button>
                    <button type="button" onClick={() => setConfirmAction(null)} className="rounded-full border border-border px-4 py-2 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {confirmAction === "reject" && (
                <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4">
                  <label className="text-sm font-medium">Rejection reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="e.g. Amount doesn't match, reference not found in merchant records"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={reject}
                      disabled={busy || !rejectionReason.trim()}
                      className="rounded-full bg-destructive px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Confirm reject
                    </button>
                    <button type="button" onClick={() => setConfirmAction(null)} className="rounded-full border border-border px-4 py-2 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {payment.paymentStatus === "VERIFIED" && (
            <div className="rounded-2xl border border-dv-leaf/40 bg-dv-leaf/10 p-6 text-sm">
              <p>Verified. Receipt {payment.receiptNumber}. The customer can download it from their payment status page.</p>
              {payment.customerEmail && emailStatus === "sent" && <p className="mt-2 text-dv-leaf">Receipt emailed to {payment.customerEmail}.</p>}
              {emailStatus === "sending" && <p className="mt-2 text-muted-foreground">Sending receipt email...</p>}
              {emailStatus === "failed" && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-destructive">Couldn&apos;t send the email.</p>
                  <button
                    type="button"
                    onClick={() => payment.customerEmail && payment.receiptNumber && sendReceiptEmail(payment.customerEmail, payment.receiptNumber)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-dv-cream"
                  >
                    Retry
                  </button>
                </div>
              )}
              {!payment.customerEmail && (
                <p className="mt-2 text-muted-foreground">No email on file - add one above and resend if needed.</p>
              )}
              {payment.customerEmail && emailStatus !== "sent" && emailStatus !== "sending" && emailStatus !== "failed" && (
                <button
                  type="button"
                  onClick={() => payment.customerEmail && payment.receiptNumber && sendReceiptEmail(payment.customerEmail, payment.receiptNumber)}
                  className="mt-2 rounded-full border border-dv-leaf px-3 py-1.5 text-xs font-semibold text-dv-leaf hover:bg-dv-leaf/10"
                >
                  Email receipt
                </button>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="font-serif text-lg text-dv-forest">Audit history</h3>
            <div className="mt-3 flex flex-col gap-3 text-sm">
              {auditLog.length === 0 && <p className="text-muted-foreground">No activity yet.</p>}
              {auditLog.map((entry) => (
                <div key={entry.id} className="border-b border-border pb-2 last:border-0">
                  <p className="font-medium capitalize">{entry.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                  {entry.reason && <p className="text-xs text-dv-black/70">{entry.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
