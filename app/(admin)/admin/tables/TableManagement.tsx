"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Users,
  Loader2,
  Edit3,
  Check,
  X,
  CircleDot,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  addTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} from "@/lib/actions/tables";
import { useConfirm } from "@/components/ui/ConfirmDialog";

type Table = {
  id: string;
  table_number: number;
  capacity: number;
  status: string;
  created_at: string;
};

export default function TableManagement({
  initialTables,
  role,
}: {
  initialTables: Table[];
  role: string;
}) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [tables, setTables] = useState(initialTables);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNum, setEditNum] = useState(0);
  const [editCap, setEditCap] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [newNum, setNewNum] = useState("");
  const [newCap, setNewCap] = useState("4");

  async function handleAdd() {
    const num = parseInt(newNum, 10);
    const cap = parseInt(newCap, 10);
    if (!num || num < 1) return toast.error("Enter a valid table number.");
    if (!cap || cap < 1) return toast.error("Enter a valid capacity.");

    setActionLoading("add");
    const result = await addTable(num, cap);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    toast.success(`Table ${num} added`);
    setNewNum("");
    setNewCap("4");
    setShowAdd(false);
    startTransition(() => router.refresh());
  }

  function startEdit(t: Table) {
    setEditingId(t.id);
    setEditNum(t.table_number);
    setEditCap(t.capacity);
  }

  async function handleSaveEdit(id: string) {
    setActionLoading(id);
    const result = await updateTable(id, {
      table_number: editNum,
      capacity: editCap,
    });
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, table_number: editNum, capacity: editCap }
          : t,
      ),
    );
    setEditingId(null);
    toast.success("Table updated");
  }

  async function handleDelete(id: string, num: number) {
    const ok = await confirm({
      title: "Delete Table",
      message: `Delete Table ${num}? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setActionLoading(id);
    const result = await deleteTable(id);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    setTables((prev) => prev.filter((t) => t.id !== id));
    toast.success(`Table ${num} deleted`);
  }

  async function handleToggleStatus(t: Table) {
    const newStatus = t.status === "occupied" ? "available" : "occupied";
    if (newStatus === "available") {
      const ok = await confirm({
        title: "Free Table",
        message: `Mark Table ${t.table_number} as available? Any unsettled orders will be cancelled.`,
        variant: "warning",
      });
      if (!ok) return;
    }
    setActionLoading(t.id);
    const result = await updateTableStatus(
      t.id,
      newStatus as "available" | "occupied",
    );
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    setTables((prev) =>
      prev.map((tb) =>
        tb.id === t.id ? { ...tb, status: newStatus } : tb,
      ),
    );
    toast.success(
      `Table ${t.table_number} ${newStatus === "available" ? "freed" : "occupied"}`,
    );
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Table
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass-card p-5">
          <h3 className="font-bold text-sm mb-3">New Table</h3>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Table Number
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={newNum}
                onChange={(e) => setNewNum(e.target.value)}
                className="premium-input w-24"
                placeholder="#"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Capacity
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={newCap}
                onChange={(e) => setNewCap(e.target.value)}
                className="premium-input w-24"
                placeholder="4"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={actionLoading === "add"}
              className="btn-primary flex items-center gap-1"
            >
              {actionLoading === "add" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table grid */}
      {tables.length === 0 ? (
        <div className="glass-card text-center py-16 text-neutral-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No restaurant tables yet</p>
          <p className="text-xs mt-1">Add tables to start managing restaurant seating</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tables.map((t) => {
            const isOccupied = t.status === "occupied";
            const isEditing = editingId === t.id;
            const isLoading = actionLoading === t.id;

            return (
              <div
                key={t.id}
                className={`glass-card p-4 relative transition-all ${
                  isOccupied
                    ? "border-red-200 bg-red-50/50"
                    : "border-green-200 bg-green-50/30"
                }`}
              >
                {/* Status dot */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CircleDot
                      className={`h-3.5 w-3.5 ${isOccupied ? "text-red-500" : "text-green-500"}`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase ${isOccupied ? "text-red-600" : "text-green-600"}`}
                    >
                      {isOccupied ? "Occupied" : "Available"}
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={editNum}
                      onChange={(e) => setEditNum(parseInt(e.target.value, 10))}
                      className="premium-input w-full text-sm"
                      min={1}
                      max={999}
                    />
                    <input
                      type="number"
                      value={editCap}
                      onChange={(e) => setEditCap(parseInt(e.target.value, 10))}
                      className="premium-input w-full text-sm"
                      min={1}
                      max={50}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSaveEdit(t.id)}
                        disabled={isLoading}
                        className="flex-1 btn-primary text-xs py-1"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                        ) : (
                          "Save"
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-secondary text-xs py-1 px-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-neutral-900">
                      {t.table_number}
                    </h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {t.capacity} seats
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-3">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        disabled={isLoading}
                        className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          isOccupied
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                        ) : isOccupied ? (
                          "Free"
                        ) : (
                          "Occupy"
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(t)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.table_number)}
                        disabled={isLoading || isOccupied}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
