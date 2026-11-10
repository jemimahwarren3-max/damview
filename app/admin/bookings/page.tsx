"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SAMPLE_LODGE_ENQUIRIES } from "@/lib/data/admin-mock";
import { ROOM_BLOCKS } from "@/lib/data/admin-fallback";
import type { EnquiryStatus, LodgeEnquiry } from "@/types";

const STATUS_FLOW: EnquiryStatus[] = ["new", "contacted", "confirmed"];

export default function AdminBookingsPage() {
  const [enquiries, setEnquiries] = useState<LodgeEnquiry[]>(SAMPLE_LODGE_ENQUIRIES);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

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
              </div>
              <div className="flex items-center gap-3">
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
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
