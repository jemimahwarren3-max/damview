import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { redirect } from "next/navigation";
import ReconciliationClient from "./ReconciliationClient";

export default async function ReconciliationPage() {
  const { role } = await getCachedAuth();
  if (!role || role === "kitchen") redirect("/admin/orders");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Daily Cash Reconciliation</h2>
        <p className="page-subtitle">Shift report — cash, EcoCash, and bank transfer totals for the day.</p>
      </div>
      <ReconciliationClient />
    </div>
  );
}
