"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Receipt } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { generatePaymentReference } from "@/lib/payments/reference";
import { generateAccessSecret, hashAccessSecret } from "@/lib/payments/token";
import { recordDocument } from "@/lib/documents";
import { generateInvoicePdf } from "@/lib/pdf/invoice";
import { SAMPLE_LODGE_ENQUIRIES } from "@/lib/data/admin-mock";
import { ROOM_BLOCKS } from "@/lib/data/admin-fallback";
import type { EnquiryStatus, LodgeEnquiry } from "@/types";

const STATUS_FLOW: EnquiryStatus[] = ["new", "contacted", "confirmed"];

export default function AdminBookingsPage() {
  const [enquiries, setEnquiries] = useState<LodgeEnquiry[]>(SAMPLE_LODGE_ENQUIRIES);
  const [paymentRefs, setPaymentRefs] = useState<Record<string, string>>({});
  const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>({});
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);
  const [busy, setBusy] = useState<string | null>(null);

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

    setBusy(enquiry.id);

    const { data: settings } = await supabase.from("payment_settings").select("payment_deadline_hours, room_hold_minutes").eq("id", true).maybeSingle();
    const holdMinutes = settings?.room_hold_minutes ?? 30;

    const { data: roomId } = await supabase.rpc("hold_room_for_enquiry", {
      p_block_id: block.id,
      p_enquiry_id: enquiry.id,
      p_hold_minutes: holdMinutes,
    });

    if (!roomId) {
      setBusy(null);
      window.alert(`No ${block.name} rooms are free to hold right now.`);
      return;
    }

    const reference = generatePaymentReference();
    const secret = generateAccessSecret();
    const secretHash = await hashAccessSecret(secret);

    const { error } = await supabase.from("payment_submissions").insert({
      payment_reference: reference,
      access_token_hash: secretHash,
      enquiry_type: "lodge",
      lodge_enquiry_id: enquiry.id,
      customer_name: enquiry.name,
      customer_phone: enquiry.phone,
      expected_amount: block.ratePerStay,
      payment_deadline: new Date(Date.now() + holdMinutes * 60 * 1000).toISOString(),
    });

    setBusy(null);
    if (!error) {
      setPaymentRefs((prev) => ({ ...prev, [enquiry.id]: reference }));
      setPaymentLinks((prev) => ({ ...prev, [enquiry.id]: `${window.location.origin}/pay/${reference}/${secret}` }));
    }
  };

  const regenerateLink = async (enquiryId: string, paymentRef: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(enquiryId);
    const secret = generateAccessSecret();
    const secretHash = await hashAccessSecret(secret);
    const { error } = await supabase.from("payment_submissions").update({ access_token_hash: secretHash }).eq("payment_reference", paymentRef);
    setBusy(null);
    if (!error) {
      setPaymentLinks((prev) => ({ ...prev, [enquiryId]: `${window.location.origin}/pay/${paymentRef}/${secret}` }));
    }
  };

  const generateReceipt = async (enquiry: LodgeEnquiry) => {
    const block = ROOM_BLOCKS.find((b) => b.id === enquiry.blockId);
    if (!block) return;

    setBusy(enquiry.id);
    const supabase = getSupabaseBrowserClient();
    const items = [
      { description: `${block.displayName}, ${block.stayDurationHours}-hour stay`, quantity: 1, unitPrice: block.ratePerStay },
    ];

    const invoice = supabase
      ? await recordDocument(supabase, { documentType: "Receipt", customerName: enquiry.name, items, amountPaid: block.ratePerStay, paymentMethod: "Cash" })
      : {
          documentType: "Receipt" as const,
          documentNumber: String(Date.now()).slice(-6),
          customerName: enquiry.name,
          issueDate: new Date().toISOString().slice(0, 10),
          items,
          amountPaid: block.ratePerStay,
          paymentMethod: "Cash",
        };

    generateInvoicePdf(invoice);
    setBusy(null);
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
          const payLink = paymentLinks[enquiry.id];

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
                {configured && block && !paymentRef && enquiry.status !== "confirmed" && (
                  <button
                    type="button"
                    onClick={() => requestPayment(enquiry)}
                    disabled={busy === enquiry.id}
                    className="flex items-center gap-1.5 rounded-full border border-dv-pool px-4 py-2 text-xs font-bold text-dv-pool hover:bg-dv-pool/10 disabled:opacity-60"
                  >
                    <CreditCard size={14} /> {busy === enquiry.id ? "Holding room..." : "Request Payment"}
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
                {paymentRef && !payLink && enquiry.status !== "confirmed" && (
                  <button
                    type="button"
                    onClick={() => regenerateLink(enquiry.id, paymentRef)}
                    disabled={busy === enquiry.id}
                    className="rounded-full border border-dv-pool px-4 py-2 text-xs font-bold text-dv-pool hover:bg-dv-pool/10 disabled:opacity-60"
                  >
                    {busy === enquiry.id ? "Generating..." : "Generate new link"}
                  </button>
                )}
                {enquiry.status === "confirmed" && block && (
                  <button
                    type="button"
                    onClick={() => generateReceipt(enquiry)}
                    disabled={busy === enquiry.id}
                    className="flex items-center gap-1.5 rounded-full border border-dv-leaf px-4 py-2 text-xs font-bold text-dv-leaf hover:bg-dv-leaf/10 disabled:opacity-60"
                  >
                    <Receipt size={14} /> {busy === enquiry.id ? "Generating..." : "Generate Receipt"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
