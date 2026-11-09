"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SAMPLE_LODGE_ENQUIRIES } from "@/lib/data/admin-mock";
import { ROOM_BLOCKS } from "@/lib/data/rooms";
import type { EnquiryStatus } from "@/types";

const STATUS_FLOW: EnquiryStatus[] = ["new", "contacted", "confirmed"];

export default function AdminBookingsPage() {
  const [enquiries, setEnquiries] = useState(SAMPLE_LODGE_ENQUIRIES);

  const advanceStatus = (id: string) => {
    setEnquiries((prev) =>
      prev.map((enquiry) => {
        if (enquiry.id !== id) return enquiry;
        const currentIndex = STATUS_FLOW.indexOf(enquiry.status);
        const next = STATUS_FLOW[Math.min(currentIndex + 1, STATUS_FLOW.length - 1)];
        return { ...enquiry, status: next };
      })
    );
  };

  return (
    <AdminShell title="Bookings">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Sample enquiries — changes here are local to your browser and not saved anywhere yet.
      </div>

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
                  {block?.name ?? enquiry.blockId} · {enquiry.checkIn} · {enquiry.guests} guests · {enquiry.phone}
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
