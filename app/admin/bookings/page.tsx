"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { generatePaymentReference } from "@/lib/payments/reference";
import { SAMPLE_LODGE_ENQUIRIES } from "@/lib/data/admin-mock";
import { ROOM_BLOCKS } from "@/lib/data/admin-fallback";
import type { EnquiryStatus, LodgeEnquiry } from "@/types";

const STATUS_FLOW: EnquiryStatus[] = ["new", "contacted", "confirmed"];

export default function AdminBookingsPage() {
  const [enquiries, setEnquiries] = useState<LodgeEnquiry[]>(SAMPLE_LODGE_ENQUIRIES);
  const [paymentRefs, setPaymentRefs] = useState<Record<string, string>>({});
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);
  const [requesting, setRequesting] = useState<string | null>(null);

  const loadPaymentRefs = () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("payment_submissions")
      .select("payment_reference, lodge_enquiry_id")
      .eq("enquiry_type", "lodge")
      .not("payment_status", "in", "(CANCELLED,EXPIRED,REJECTED)")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((row) => {
          if (row.lodge_enquiry_id) map[row.lodge_enquiry_id] = row.payment_reference;
        });
        setPaymentRefs(map);
      });
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("lodge_enquiries")
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
            blockId: row.block_id ?? undefined,
            checkIn: row.check_in,
            guests: row.guests,
          }))
        );
      });

    loadPaymentRefs();
  }, []);

  const advanceStatus = async (id: string) => {
    const enquiry = enquiries.find((e) => e.id === id);
    if (!enquiry) return;
    const currentIndex = STATUS_FLOW.indexOf(enquiry.status);
    const next = STATUS_FLOW[Math.min(currentIndex + 1, STATUS_FLOW.length - 1)];

    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: next } : e)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("lodge_enquiries").update({ status: next }).eq("id", id);
  };

  const requestPayment = async (enquiry: LodgeEnquiry) => {
    const supabase = getSupabaseBrowserClient();
    const block = ROOM_BLOCKS.find((b) => b.id === enquiry.blockId);
    if (!supabase || !block) return;

    setRequesting(enquiry.id);

    const { data: settings } = await supabase.from("payment_settings").select("payment_deadline_hours").eq("id", true).maybeSingle();
    const deadlineHours = settings?.payment_deadline_hours ?? 2;
    const reference = generatePaymentReference();

    const { error } = await supabase.from("payment_submissions").insert({
      payment_reference: reference,
      enquiry_type: "lodge",
      lodge_enquiry_id: enquiry.id,
      customer_name: enquiry.name,
      customer_phone: enquiry.phone,
      expected_amount: block.ratePerStay,
      payment_deadline: new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toISOString(),
    });

    setRequesting(null);
    if (!error) {
      setPaymentRefs((prev) => ({ ...prev, [enquiry.id]: reference }));
    }
  };

  return (
    <AdminShell title="Bookings">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Status changes
          here won&apos;t be saved.
        </div>
      )}

      {configured && enquiries.length === 0 && (
        <div className="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          No lodge enquiries yet. They&apos;ll show up here as soon as someone submits the
          accommodation enquiry form.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {enquiries.map((enquiry) => {
          const block = ROOM_BLOCKS.find((b) => b.id === enquiry.blockId);
          const paymentRef = paymentRefs[enquiry.id];
          const payLink = paymentRef && typeof window !== "undefined" ? `${window.location.origin}/pay/${paymentRef}` : undefined;

          return (
            <div
              key={enquiry.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-dv-black">{enquiry.name}</p>
                <p className="text-sm text-muted-foreground">
                  {block?.name ?? enquiry.blockId ?? "No block chosen"} &middot; {enquiry.checkIn} &middot; {enquiry.guests} guests &middot; {enquiry.phone}
                </p>
                {paymentRef && (
                  <p className="mt-2 text-xs text-dv-pool">
                    Payment requested: <Link href={`/admin/payments/${paymentRef}`} className="underline">{paymentRef}</Link>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={enquiry.status === "confirmed" ? "confirmed" : "pending"} label={enquiry.status} />
                {enquiry.status !== "confirmed" && (
                  <button
                    type="button"
                    onClick={() => advanceStatus(enquiry.id)}
                    className="rounded-full bg-dv-forest px-4 py-2 text-xs font-bold text-dv-ivory hover:bg-dv-leaf"
                  >
                    Mark as {STATUS_FLOW[STATUS_FLOW.indexOf(enquiry.status) + 1]}
                  </button>
                )}
                {configured && block && !paymentRef && (
                  <button
                    type="button"
                    onClick={() => requestPayment(enquiry)}
                    disabled={requesting === enquiry.id}
                    className="flex items-center gap-1.5 rounded-full border border-dv-pool px-4 py-2 text-xs font-bold text-dv-pool hover:bg-dv-pool/10 disabled:opacity-60"
                  >
                    <CreditCard size={14} /> {requesting === enquiry.id ? "Requesting..." : "Request Payment"}
                  </button>
                )}
                {payLink && (
                  <WhatsAppButton
                    phone={enquiry.phone.replace(/^0/, "263").replace(/\D/g, "")}
                    label="Send payment link"
                    message={`Hi ${enquiry.name}, please complete your payment for Damview Resort here: ${payLink}`}
                    className="bg-dv-pool text-dv-ivory hover:bg-dv-forest"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
