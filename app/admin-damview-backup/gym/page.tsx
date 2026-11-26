"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { GYM_PACKAGES as FALLBACK_PACKAGES } from "@/lib/data/admin-fallback";
import type { EnquiryStatus, GymEnquiry, GymPackage } from "@/types";

export default function AdminGymPage() {
  const [packages, setPackages] = useState<GymPackage[]>(FALLBACK_PACKAGES);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [enquiries, setEnquiries] = useState<GymEnquiry[]>([]);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("gym_packages")
      .select("id, name, price, billing_period, features")
      .order("id")
      .then(({ data, error }) => {
        if (error || !data) return;
        setPackages(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            price: row.price !== null ? Number(row.price) : null,
            billingPeriod: row.billing_period as GymPackage["billingPeriod"],
            features: row.features,
          }))
        );
      });

    supabase
      .from("gym_enquiries")
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
            packageId: row.package_id ?? undefined,
          }))
        );
      });
  }, []);

  const markConfirmed = async (id: string) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: "confirmed" } : e)));
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("gym_enquiries").update({ status: "confirmed" }).eq("id", id);
  };

  const savePrice = async (packageId: string) => {
    const price = Number(priceDrafts[packageId]);
    if (!price || price <= 0) return;

    setPackages((prev) => prev.map((p) => (p.id === packageId ? { ...p, price } : p)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("gym_packages").update({ price }).eq("id", packageId);
  };

  return (
    <AdminShell title="Gym">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Changes here
          won&apos;t be saved.
        </div>
      )}

      <h2 className="mb-3 font-serif text-lg text-dv-forest">Membership packages</h2>
      <div className="mb-8 flex flex-col gap-2">
        {packages.map((pkg) => (
          <div key={pkg.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
            <div>
              <p className="font-medium text-dv-black">{pkg.name}</p>
              <p className="text-xs text-muted-foreground">per {pkg.billingPeriod}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={priceDrafts[pkg.id] ?? pkg.price ?? ""}
                onChange={(e) => setPriceDrafts((prev) => ({ ...prev, [pkg.id]: e.target.value }))}
                className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm"
              />
              <button
                type="button"
                onClick={() => savePrice(pkg.id)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-dv-forest hover:bg-dv-cream"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-serif text-lg text-dv-forest">Enquiries</h2>
      {enquiries.length === 0 && (
        <p className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          No gym enquiries yet.
        </p>
      )}
      <div className="flex flex-col gap-3">
        {enquiries.map((enquiry) => (
          <div
            key={enquiry.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-dv-black">{enquiry.name}</p>
              <p className="text-sm text-muted-foreground">{enquiry.phone}</p>
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
        ))}
      </div>
    </AdminShell>
  );
}
