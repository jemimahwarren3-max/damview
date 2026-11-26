"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ROOM_BLOCKS, DAMSIDE_ACTIVITIES, RECREATIONAL_ACTIVITIES } from "@/lib/data/admin-fallback";

const ALL_ACTIVITIES = [...DAMSIDE_ACTIVITIES, ...RECREATIONAL_ACTIVITIES];

interface Report {
  lodgeTotal: number;
  lodgeConfirmed: number;
  lodgeRevenue: number;
  eventTotal: number;
  eventConfirmed: number;
  eventRevenue: number;
  activityTotal: number;
  activityConfirmed: number;
  activityRevenue: number;
  gymTotal: number;
  gymConfirmed: number;
  byStatus: Record<string, number>;
  topActivities: { name: string; count: number }[];
  documentsIssued: number;
  documentsTotal: number;
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    Promise.all([
      supabase.from("lodge_enquiries").select("status, block_id"),
      supabase.from("event_enquiries").select("status, quoted_amount"),
      supabase.from("activity_enquiries").select("status, activity_id, price_amount"),
      supabase.from("gym_enquiries").select("status"),
      supabase.from("documents").select("id, amount_paid"),
    ]).then(([lodge, event, activity, gym, documents]) => {
      const lodgeRows = lodge.data ?? [];
      const eventRows = event.data ?? [];
      const activityRows = activity.data ?? [];
      const gymRows = gym.data ?? [];
      const documentRows = documents.data ?? [];

      const byStatus: Record<string, number> = {};
      [...lodgeRows, ...eventRows, ...activityRows, ...gymRows].forEach((row) => {
        byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
      });

      const activityCounts: Record<string, number> = {};
      activityRows.forEach((row) => {
        activityCounts[row.activity_id] = (activityCounts[row.activity_id] ?? 0) + 1;
      });
      const topActivities = Object.entries(activityCounts)
        .map(([id, count]) => ({ name: ALL_ACTIVITIES.find((a) => a.id === id)?.name ?? id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const lodgeConfirmedRows = lodgeRows.filter((r) => r.status === "confirmed");
      const lodgeRevenue = lodgeConfirmedRows.reduce((sum, r) => {
        const block = ROOM_BLOCKS.find((b) => b.id === r.block_id);
        return sum + (block?.ratePerStay ?? 0);
      }, 0);

      const eventConfirmedRows = eventRows.filter((r) => r.status === "confirmed");
      const eventRevenue = eventConfirmedRows.reduce((sum, r) => sum + (r.quoted_amount ? Number(r.quoted_amount) : 0), 0);

      const activityConfirmedRows = activityRows.filter((r) => r.status === "confirmed");
      const activityRevenue = activityConfirmedRows.reduce((sum, r) => sum + (r.price_amount ? Number(r.price_amount) : 0), 0);

      setReport({
        lodgeTotal: lodgeRows.length,
        lodgeConfirmed: lodgeConfirmedRows.length,
        lodgeRevenue,
        eventTotal: eventRows.length,
        eventConfirmed: eventConfirmedRows.length,
        eventRevenue,
        activityTotal: activityRows.length,
        activityConfirmed: activityConfirmedRows.length,
        activityRevenue,
        gymTotal: gymRows.length,
        gymConfirmed: gymRows.filter((r) => r.status === "confirmed").length,
        byStatus,
        topActivities,
        documentsIssued: documentRows.length,
        documentsTotal: documentRows.reduce((sum, d) => sum + Number(d.amount_paid), 0),
      });
    });
  }, []);

  return (
    <AdminShell title="Reports">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so there&apos;s nothing to report on.
        </div>
      )}

      {configured && !report && <p className="text-sm text-muted-foreground">Loading...</p>}

      {report && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-border bg-background p-5">
              <span className="block font-serif text-2xl text-dv-forest">${report.lodgeRevenue.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">Confirmed lodge revenue</span>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <span className="block font-serif text-2xl text-dv-forest">${report.eventRevenue.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">Confirmed event revenue</span>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <span className="block font-serif text-2xl text-dv-forest">${report.activityRevenue.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">Confirmed activity revenue</span>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <span className="block font-serif text-2xl text-dv-forest">${report.documentsTotal.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">On {report.documentsIssued} documents issued</span>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <span className="block font-serif text-2xl text-dv-forest">
                {report.lodgeTotal + report.eventTotal + report.activityTotal + report.gymTotal}
              </span>
              <span className="text-xs text-muted-foreground">Total enquiries</span>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-serif text-lg text-dv-forest">Enquiries by status</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(report.byStatus).map(([status, count]) => (
                <div key={status} className="rounded-xl border border-border bg-background px-4 py-3">
                  <span className="block font-serif text-xl text-dv-forest">{count}</span>
                  <span className="text-xs capitalize text-muted-foreground">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-serif text-lg text-dv-forest">Enquiries by area</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <span className="block font-serif text-xl text-dv-forest">
                  {report.lodgeConfirmed}/{report.lodgeTotal}
                </span>
                <span className="text-xs text-muted-foreground">Lodge confirmed</span>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <span className="block font-serif text-xl text-dv-forest">
                  {report.eventConfirmed}/{report.eventTotal}
                </span>
                <span className="text-xs text-muted-foreground">Events confirmed</span>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <span className="block font-serif text-xl text-dv-forest">
                  {report.activityConfirmed}/{report.activityTotal}
                </span>
                <span className="text-xs text-muted-foreground">Activities confirmed</span>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <span className="block font-serif text-xl text-dv-forest">
                  {report.gymConfirmed}/{report.gymTotal}
                </span>
                <span className="text-xs text-muted-foreground">Gym confirmed</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-serif text-lg text-dv-forest">Most-enquired activities</h2>
            {report.topActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity enquiries yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {report.topActivities.map((a) => (
                  <div key={a.name} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                    <span className="text-sm font-medium text-dv-black">{a.name}</span>
                    <span className="text-sm text-muted-foreground">{a.count} enquiries</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Revenue figures are estimated from confirmed enquiries and current rates/quotes, not a
            real accounting ledger - cross-check against actual receipts issued.
          </p>
        </div>
      )}
    </AdminShell>
  );
}
