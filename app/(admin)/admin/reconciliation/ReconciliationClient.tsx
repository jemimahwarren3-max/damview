"use client";

import { useState, useEffect } from "react";
import { getDailyReconciliation } from "@/lib/actions/reconciliation";
import {
  DollarSign,
  Banknote,
  Smartphone,
  Building2,
  Printer,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

type ReconciliationData = Awaited<ReturnType<typeof getDailyReconciliation>>;

export default function ReconciliationClient() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<ReconciliationData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(d: string) {
    setLoading(true);
    try {
      const result = await getDailyReconciliation(d);
      setData(result);
    } catch {
      toast.error("Failed to load reconciliation data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(date); }, [date]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!data) return null;

  const r = data;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Date picker + Print */}
      <div className="flex items-center justify-between print:hidden">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="premium-input w-48"
        />
        <button
          onClick={handlePrint}
          className="btn-secondary flex items-center gap-2"
        >
          <Printer className="h-4 w-4" /> Print Report
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <h1 className="text-xl font-bold">DAMVIEW RESORT</h1>
        <p className="text-sm">Daily Cash Reconciliation — {new Date(r.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        <p className="text-xs text-neutral-500">Generated: {new Date().toLocaleString("en-US")}</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI
          label="Total Collected"
          value={r.combined.total}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          bg="bg-emerald-50"
        />
        <KPI
          label="Cash"
          value={r.combined.byMode.Cash}
          icon={<Banknote className="h-5 w-5 text-green-600" />}
          bg="bg-green-50"
        />
        <KPI
          label="EcoCash"
          value={r.combined.byMode.EcoCash}
          icon={<Smartphone className="h-5 w-5 text-blue-600" />}
          bg="bg-blue-50"
        />
        <KPI
          label="Bank Transfer"
          value={r.combined.byMode["Bank Transfer"]}
          icon={<Building2 className="h-5 w-5 text-purple-600" />}
          bg="bg-purple-50"
        />
      </div>

      {/* Outstanding */}
      {r.hotel.outstanding > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">Outstanding Balance</p>
            <p className="text-xs text-amber-700">${r.hotel.outstanding.toFixed(2)} still owed from hotel checkouts today</p>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hotel */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Hotel Billing</h3>
          <div className="space-y-2">
            <Row label="Checkouts processed" value={r.hotel.count} isCurrency={false} />
            <Row label="Total billed" value={r.hotel.total} />
            <div className="border-t border-neutral-100 pt-2 space-y-1.5">
              <Row label="Cash" value={r.hotel.byMode.Cash} />
              <Row label="EcoCash" value={r.hotel.byMode.EcoCash} />
              <Row label="Bank Transfer" value={r.hotel.byMode["Bank Transfer"]} />
            </div>
            {r.hotel.outstanding > 0 && (
              <Row label="Outstanding" value={r.hotel.outstanding} variant="warning" />
            )}
          </div>
        </div>

        {/* Restaurant */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Restaurant Billing</h3>
          <div className="space-y-2">
            <Row label="Bills processed" value={r.restaurant.count} isCurrency={false} />
            <Row label="Total billed" value={r.restaurant.total} />
            <div className="border-t border-neutral-100 pt-2 space-y-1.5">
              <Row label="Cash" value={r.restaurant.byMode.Cash} />
              <Row label="EcoCash" value={r.restaurant.byMode.EcoCash} />
              <Row label="Bank Transfer" value={r.restaurant.byMode["Bank Transfer"]} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity summary */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Day Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <ArrowUpRight className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-neutral-500">Check-ins</p>
              <p className="text-lg font-bold text-neutral-900">{r.checkins}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ArrowDownRight className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xs text-neutral-500">Checkouts</p>
              <p className="text-lg font-bold text-neutral-900">{r.checkouts}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className={`${bg} p-2.5 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-neutral-900">${value.toFixed(2)}</p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  isCurrency = true,
  variant,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  variant?: "warning";
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className={variant === "warning" ? "text-amber-700 font-semibold" : "text-neutral-600"}>{label}</span>
      <span className={`font-bold ${variant === "warning" ? "text-amber-700" : "text-neutral-900"}`}>
        {isCurrency ? `$${value.toFixed(2)}` : value}
      </span>
    </div>
  );
}
