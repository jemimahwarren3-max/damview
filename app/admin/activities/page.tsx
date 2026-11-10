"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SAMPLE_ACTIVITY_ENQUIRIES } from "@/lib/data/admin-mock";
import { DAMSIDE_ACTIVITIES, RECREATIONAL_ACTIVITIES } from "@/lib/data/admin-fallback";
import type { Activity, ActivityEnquiry, EnquiryStatus, PricingUnit } from "@/types";

const FALLBACK_ACTIVITIES = [...DAMSIDE_ACTIVITIES, ...RECREATIONAL_ACTIVITIES];

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(FALLBACK_ACTIVITIES);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [enquiries, setEnquiries] = useState<ActivityEnquiry[]>(SAMPLE_ACTIVITY_ENQUIRIES);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("activities")
      .select("id, category, name, description, price_amount, price_unit, image")
      .order("id")
      .then(({ data, error }) => {
        if (error || !data) return;
        setActivities(
          data.map((row) => ({
            id: row.id,
            category: row.category as Activity["category"],
            name: row.name,
            description: row.description,
            pricing: row.price_amount !== null && row.price_unit ? { amount: Number(row.price_amount), unit: row.price_unit as PricingUnit } : undefined,
            image: row.image ?? undefined,
          }))
        );
      });

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

  const savePrice = async (activityId: string) => {
    const amount = Number(priceDrafts[activityId]);
    if (!amount || amount <= 0) return;

    setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, pricing: { amount, unit: a.pricing?.unit ?? "per_person" } } : a)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("activities").update({ price_amount: amount, price_unit: "per_person" }).eq("id", activityId);
  };

  return (
    <AdminShell title="Activities">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Changes here
          won&apos;t be saved.
        </div>
      )}

      <h2 className="mb-3 font-serif text-lg text-dv-forest">Pricing</h2>
      <div className="mb-8 flex flex-col gap-2">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
            <div>
              <p className="font-medium text-dv-black">{activity.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{activity.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={priceDrafts[activity.id] ?? activity.pricing?.amount ?? ""}
                onChange={(e) => setPriceDrafts((prev) => ({ ...prev, [activity.id]: e.target.value }))}
                className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm"
              />
              <span className="text-xs text-muted-foreground">pp</span>
              <button
                type="button"
                onClick={() => savePrice(activity.id)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-dv-forest hover:bg-dv-cream"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-serif text-lg text-dv-forest">Enquiries</h2>
      {configured && enquiries.length === 0 && (
        <div className="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          No activity enquiries yet. They&apos;ll show up here as soon as someone enquires about an
          activity.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {enquiries.map((enquiry) => {
          const activity = activities.find((a) => a.id === enquiry.activityId);
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
