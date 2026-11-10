"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { generatePaymentReference } from "@/lib/payments/reference";
import { generateAccessSecret, hashAccessSecret } from "@/lib/payments/token";
import { SAMPLE_EVENT_ENQUIRIES } from "@/lib/data/admin-mock";
import type { EnquiryStatus, EventEnquiry } from "@/types";

const STATUS_OPTIONS: EnquiryStatus[] = ["new", "contacted", "confirmed", "declined"];

function badgeStatus(status: EnquiryStatus) {
  if (status === "confirmed") return "confirmed" as const;
  if (status === "declined") return "maintenance" as const;
  return "pending" as const;
}

export default function AdminEventsPage() {
  const [enquiries, setEnquiries] = useState<EventEnquiry[]>(SAMPLE_EVENT_ENQUIRIES);
  const [paymentRefs, setPaymentRefs] = useState<Record<string, string>>({});
  const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>({});
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, string>>({});
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);
  const [requesting, setRequesting] = useState<string | null>(null);

  const loadPaymentRefs = () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("payment_submissions")
      .select("payment_reference, event_enquiry_id")
      .eq("enquiry_type", "event")
      .not("payment_status", "in", "(CANCELLED,EXPIRED,REJECTED)")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((row) => {
          if (row.event_enquiry_id) map[row.event_enquiry_id] = row.payment_reference;
        });
        setPaymentRefs(map);
      });
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("event_enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) return;
        setEnquiries(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            phone: row.phone,
            email: row.email ?? undefined,
            message: row.message ?? undefined,
            status: row.status as EnquiryStatus,
            createdAt: row.created_at,
            eventType: row.event_type as EventEnquiry["eventType"],
            proposedDate: row.proposed_date,
            expectedGuests: row.expected_guests,
            facilitiesRequired: row.facilities_required,
            cateringRequired: row.catering_required,
            accommodationRequired: row.accommodation_required,
            quotedAmount: row.quoted_amount ?? undefined,
          }))
        );
      });

    loadPaymentRefs();
  }, []);

  const updateStatus = async (id: string, status: EnquiryStatus) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("event_enquiries").update({ status }).eq("id", id);
  };

  const saveQuote = async (id: string) => {
    const amount = Number(quoteDrafts[id]);
    if (!amount || amount <= 0) return;

    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, quotedAmount: amount } : e)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("event_enquiries").update({ quoted_amount: amount }).eq("id", id);
  };

  const requestPayment = async (enquiry: EventEnquiry) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !enquiry.quotedAmount) return;

    setRequesting(enquiry.id);

    const { data: settings } = await supabase.from("payment_settings").select("payment_deadline_hours").eq("id", true).maybeSingle();
    const deadlineHours = settings?.payment_deadline_hours ?? 2;
    const reference = generatePaymentReference();
    const secret = generateAccessSecret();
    const secretHash = await hashAccessSecret(secret);

    const { error } = await supabase.from("payment_submissions").insert({
      payment_reference: reference,
      access_token_hash: secretHash,
      enquiry_type: "event",
      event_enquiry_id: enquiry.id,
      customer_name: enquiry.name,
      customer_phone: enquiry.phone,
      expected_amount: enquiry.quotedAmount,
      payment_deadline: new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toISOString(),
    });

    setRequesting(null);
    if (!error) {
      setPaymentRefs((prev) => ({ ...prev, [enquiry.id]: reference }));
      setPaymentLinks((prev) => ({ ...prev, [enquiry.id]: `${window.location.origin}/pay/${reference}/${secret}` }));
    }
  };

  const regenerateLink = async (enquiryId: string, paymentRef: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setRequesting(enquiryId);
    const secret = generateAccessSecret();
    const secretHash = await hashAccessSecret(secret);
    const { error } = await supabase.from("payment_submissions").update({ access_token_hash: secretHash }).eq("payment_reference", paymentRef);
    setRequesting(null);
    if (!error) {
      setPaymentLinks((prev) => ({ ...prev, [enquiryId]: `${window.location.origin}/pay/${paymentRef}/${secret}` }));
    }
  };

  return (
    <AdminShell title="Events">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Status changes
          here won&apos;t be saved.
        </div>
      )}

      {configured && enquiries.length === 0 && (
        <div className="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          No event enquiries yet. They&apos;ll show up here as soon as someone submits the form on
          /events.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {enquiries.map((enquiry) => {
          const paymentRef = paymentRefs[enquiry.id];
          const payLink = paymentLinks[enquiry.id];

          return (
            <div key={enquiry.id} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-dv-black">{enquiry.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {enquiry.eventType.replace("_", " ")} &middot; {enquiry.proposedDate} &middot; {enquiry.expectedGuests} guests
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={badgeStatus(enquiry.status)} label={enquiry.status} />
                  <select
                    value={enquiry.status}
                    onChange={(e) => updateStatus(enquiry.id, e.target.value as EnquiryStatus)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                <div>
                  <dt className="font-medium text-dv-black">Facilities</dt>
                  <dd>{enquiry.facilitiesRequired.join(", ") || "None listed"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-dv-black">Catering</dt>
                  <dd>{enquiry.cateringRequired ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-dv-black">Accommodation</dt>
                  <dd>{enquiry.accommodationRequired ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-dv-black">Phone</dt>
                  <dd>{enquiry.phone}</dd>
                </div>
              </dl>
              {enquiry.message && (
                <p className="mt-3 border-t border-border pt-3 text-sm text-dv-black/80">
                  &quot;{enquiry.message}&quot;
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                {paymentRef ? (
                  <>
                    <p className="text-xs text-dv-pool">
                      Quoted ${enquiry.quotedAmount?.toFixed(2)} &middot; Payment requested:{" "}
                      <Link href={`/admin/payments/${paymentRef}`} className="underline">{paymentRef}</Link>
                    </p>
                    {payLink && (
                      <WhatsAppButton
                        phone={enquiry.phone.replace(/^0/, "263").replace(/\D/g, "")}
                        label="Send payment link"
                        message={`Hi ${enquiry.name}, please complete your payment for your Damview Resort event here: ${payLink}`}
                        className="bg-dv-pool text-dv-ivory hover:bg-dv-forest"
                      />
                    )}
                    {!payLink && (
                      <button
                        type="button"
                        onClick={() => regenerateLink(enquiry.id, paymentRef)}
                        disabled={requesting === enquiry.id}
                        className="rounded-full border border-dv-pool px-4 py-2 text-xs font-bold text-dv-pool hover:bg-dv-pool/10 disabled:opacity-60"
                      >
                        {requesting === enquiry.id ? "Generating..." : "Generate new link"}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <label className="text-xs font-medium text-dv-black">Quoted amount ($)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={quoteDrafts[enquiry.id] ?? enquiry.quotedAmount ?? ""}
                      onChange={(e) => setQuoteDrafts((prev) => ({ ...prev, [enquiry.id]: e.target.value }))}
                      className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => saveQuote(enquiry.id)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-dv-forest hover:bg-dv-cream"
                    >
                      Save quote
                    </button>
                    {configured && enquiry.quotedAmount && (
                      <button
                        type="button"
                        onClick={() => requestPayment(enquiry)}
                        disabled={requesting === enquiry.id}
                        className="flex items-center gap-1.5 rounded-full border border-dv-pool px-4 py-2 text-xs font-bold text-dv-pool hover:bg-dv-pool/10 disabled:opacity-60"
                      >
                        <CreditCard size={14} /> {requesting === enquiry.id ? "Requesting..." : "Request Payment"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
