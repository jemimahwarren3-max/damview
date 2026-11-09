"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SAMPLE_ACTIVITY_ENQUIRIES } from "@/lib/data/admin-mock";
import { DAMSIDE_ACTIVITIES, RECREATIONAL_ACTIVITIES } from "@/lib/data/admin-fallback";

const ALL_ACTIVITIES = [...DAMSIDE_ACTIVITIES, ...RECREATIONAL_ACTIVITIES];

export default function AdminActivitiesPage() {
  const [enquiries, setEnquiries] = useState(SAMPLE_ACTIVITY_ENQUIRIES);

  return (
    <AdminShell title="Activities">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Sample enquiries, local to your browser only, not saved yet.
      </div>

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
                  {activity?.name ?? enquiry.activityId} · {enquiry.partySize} people · {enquiry.phone}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={enquiry.status === "confirmed" ? "confirmed" : "pending"} label={enquiry.status} />
                {enquiry.status !== "confirmed" && (
                  <button
                    type="button"
                    onClick={() =>
                      setEnquiries((prev) =>
                        prev.map((e) => (e.id === enquiry.id ? { ...e, status: "confirmed" } : e))
                      )
                    }
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
