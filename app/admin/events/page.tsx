"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
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
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

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
          }))
        );
      });
  }, []);

  const updateStatus = async (id: string, status: EnquiryStatus) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("event_enquiries").update({ status }).eq("id", id);
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
        {enquiries.map((enquiry) => (
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
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
