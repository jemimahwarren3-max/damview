"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Calendar,
  Phone,
  User,
  X,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createReservation,
  cancelReservation,
  checkInFromReservation,
  markNoShow,
} from "@/lib/actions/reservations";
import { useConfirm } from "@/components/ui/ConfirmDialog";

function useSimpleConfirm() {
  const { confirm } = useConfirm();
  return (message: string) =>
    confirm({ title: "Confirm", message, variant: "warning" });
}

type Room = {
  id: string;
  room_number: number;
  type: string;
  label: string | null;
  base_price: number;
  status: string;
  max_occupancy: number;
};

type Reservation = {
  id: string;
  room_id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  people_count: number;
  check_in_date: string;
  check_out_date: string | null;
  billing_mode: string;
  rate: number;
  hourly_rate: number | null;
  deposit_amount: number;
  deposit_paid: boolean;
  notes: string | null;
  status: string;
  created_at: string;
  rooms: { room_number: number; type: string; label: string | null } | null;
};

const STATUS_TABS = [
  { key: "confirmed", label: "Upcoming" },
  { key: "checked_in", label: "Checked In" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

export default function ReservationList({
  reservations,
  rooms,
  currentStatus,
  searchQuery,
  role,
}: {
  reservations: Reservation[];
  rooms: Room[];
  currentStatus: string;
  searchQuery: string;
  role: string;
}) {
  const router = useRouter();
  const confirm = useSimpleConfirm();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState(searchQuery);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const availableRooms = rooms.filter(
    (r) => r.status === "available" || r.status === "reserved",
  );

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.status && params.status !== "confirmed")
      sp.set("status", params.status);
    if (params.search) sp.set("search", params.search);
    if (params.date) sp.set("date", params.date);
    router.push(`/admin/reservations?${sp.toString()}`);
  }

  async function handleCreate(formData: FormData) {
    const result = await createReservation(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Reservation created");
    setShowForm(false);
    startTransition(() => router.refresh());
  }

  async function handleCancel(id: string) {
    const ok = await confirm("Cancel this reservation?");
    if (!ok) return;
    setActionLoading(id);
    const result = await cancelReservation(id);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    toast.success("Reservation cancelled");
    startTransition(() => router.refresh());
  }

  async function handleNoShow(id: string) {
    const ok = await confirm("Mark this reservation as a no-show?");
    if (!ok) return;
    setActionLoading(id);
    const result = await markNoShow(id);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    toast.success("Marked as no-show");
    startTransition(() => router.refresh());
  }

  async function handleCheckIn(id: string) {
    const ok = await confirm("Check in this guest from their reservation?");
    if (!ok) return;
    setActionLoading(id);
    const result = await checkInFromReservation(id);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    toast.success("Guest checked in successfully");
    startTransition(() => router.refresh());
  }

  const statusColor: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-800",
    checked_in: "bg-green-100 text-green-800",
    completed: "bg-neutral-100 text-neutral-600",
    cancelled: "bg-red-100 text-red-700",
    no_show: "bg-amber-100 text-amber-800",
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Status tabs */}
      <div className="seg-group">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`seg-item ${currentStatus === tab.key ? "active" : ""}`}
            onClick={() => navigate({ status: tab.key, search })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                navigate({ status: currentStatus, search });
            }}
            className="premium-input pl-9 w-full"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Reservation
        </button>
      </div>

      {/* New reservation form */}
      {showForm && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">New Reservation</h3>
          <form action={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Guest Name *
              </label>
              <input
                name="guest_name"
                required
                minLength={2}
                className="premium-input w-full"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Phone
              </label>
              <input
                name="guest_phone"
                type="tel"
                className="premium-input w-full"
                placeholder="+263..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Email
              </label>
              <input
                name="guest_email"
                type="email"
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Room *
              </label>
              <select name="room_id" required className="premium-select w-full">
                <option value="">Select room</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} — {r.label || r.type} ($
                    {r.base_price}/night)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Check-in Date *
              </label>
              <input
                name="check_in_date"
                type="date"
                required
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Check-out Date
              </label>
              <input
                name="check_out_date"
                type="date"
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Guests *
              </label>
              <input
                name="people_count"
                type="number"
                min={1}
                defaultValue={1}
                required
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Billing Mode
              </label>
              <select
                name="billing_mode"
                defaultValue="nightly"
                className="premium-select w-full"
              >
                <option value="nightly">Per Night</option>
                <option value="hourly">Per Hour</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Nightly Rate ($) *
              </label>
              <input
                name="rate"
                type="number"
                step="0.01"
                min={0}
                required
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Hourly Rate ($)
              </label>
              <input
                name="hourly_rate"
                type="number"
                step="0.01"
                min={0}
                className="premium-input w-full"
                placeholder="Only if hourly billing"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Deposit ($)
              </label>
              <input
                name="deposit_amount"
                type="number"
                step="0.01"
                min={0}
                defaultValue={0}
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                ID Type
              </label>
              <select name="guest_id_type" className="premium-select w-full">
                <option value="">None</option>
                <option value="National ID">National ID</option>
                <option value="Passport">Passport</option>
                <option value="Driver's License">Driver&apos;s License</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={2}
                className="premium-input w-full"
                placeholder="Special requests, arrival time, etc."
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" className="btn-primary">
                Create Reservation
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reservation list */}
      <div className="glass-card overflow-hidden">
        {reservations.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No reservations found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-neutral-900">
                      {r.guest_name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[r.status] || "bg-neutral-100"}`}
                    >
                      {r.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(r.check_in_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {r.check_out_date && (
                        <>
                          {" → "}
                          {new Date(r.check_out_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </>
                      )}
                    </span>
                    {r.rooms && (
                      <span>
                        Room {r.rooms.room_number}
                        {r.rooms.label ? ` (${r.rooms.label})` : ""}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {r.people_count}
                    </span>
                    {r.guest_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {r.guest_phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />$
                      {r.rate}
                      {r.billing_mode === "hourly" ? "/hr" : "/night"}
                    </span>
                    {r.deposit_amount > 0 && (
                      <span
                        className={
                          r.deposit_paid ? "text-green-600" : "text-amber-600"
                        }
                      >
                        Deposit: ${r.deposit_amount}{" "}
                        {r.deposit_paid ? "✓" : "(unpaid)"}
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <p className="text-xs text-neutral-400 mt-1 truncate">
                      {r.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {r.status === "confirmed" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCheckIn(r.id)}
                      disabled={actionLoading === r.id}
                      className="btn-primary text-xs flex items-center gap-1"
                    >
                      {actionLoading === r.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ArrowRight className="h-3 w-3" />
                      )}
                      Check In
                    </button>
                    <button
                      onClick={() => handleNoShow(r.id)}
                      disabled={actionLoading === r.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all disabled:opacity-50"
                    >
                      <Clock className="h-3 w-3" />
                      No Show
                    </button>
                    <button
                      onClick={() => handleCancel(r.id)}
                      disabled={actionLoading === r.id}
                      className="btn-danger text-xs flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                )}
                {r.status === "checked_in" && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    In House
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
