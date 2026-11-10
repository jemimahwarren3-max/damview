"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SAMPLE_ACTIVITY_ENQUIRIES } from "@/lib/data/admin-mock";
import { DAMSIDE_ACTIVITIES, RECREATIONAL_ACTIVITIES } from "@/lib/data/admin-fallback";
import type { ActivityEnquiry, EnquiryStatus } from "@/types";

const ALL_ACTIVITIES = [...DAMSIDE_ACTIVITIES, ...RECREATIONAL_ACTIVITIES];

export default function AdminActivitiesPage() {
  const [enquiries, setEnquiries] = useState<ActivityEnquiry[]>(SAMPLE_ACTIVITY_ENQUIRIES);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("activity_enquiries")
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
            activityId: row.activity_id,
            preferredDate: row.preferred_date ?? undefined,
            partySize: row.party_size ?? undefined,
          }))
        );
      });
  }, []);

  const markConfirmed = async (id: string) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: "confirmed" } : e)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("activity_enquiries").update({ status: "confirmed" }).eq("id", id);
  };

  return (
    <AdminShell title="Activities">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Status changes
          here won&apos;t be saved.
        </div>
      )}

      {configured && enquiries.length === 0 && (
        <div className="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          No activity enquiries yet. They&apos;ll show up here as soon as someone enquires about an
          activity.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {enquiries.map((enquiry) => {
          const activity = ALL_ACTIVITIES.find((a) => a.id === enquiry.activityId);
          return (
            <div
              key={enquiry.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-dv-black">{enquiry.name}</p>
                <p className="text-sm text-muted-foreground">
                  {activity?.name ?? enquiry.activityId} &middot; {enquiry.partySize ?? "?"} people &middot; {enquiry.phone}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={enquiry.status === "confirmed" ? "confirmed" : "pending"} label={enquiry.status} />
                {enquiry.status !== "confirmed" && (
                  <button
                    type="button"
                    onClick={() => markConfirmed(enquiry.id)}
                    className="rounded-full bg-dv-forest px-4 py-2 text-xs font-bold text-dv-ivory hover:bg-dv-leaf"
                  >
                    Mark confirmed
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
