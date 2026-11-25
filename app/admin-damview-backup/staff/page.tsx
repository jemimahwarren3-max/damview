"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const ROLES = [
  { value: "director", label: "Director" },
  { value: "general_manager", label: "General Manager" },
  { value: "managerial_officer", label: "Managerial Officer" },
  { value: "department_head", label: "Department Head" },
  { value: "employee", label: "Employee" },
] as const;

interface StaffRow {
  userId: string;
  fullName: string;
  role: string;
  department: string | null;
  isAdmin: boolean;
  isActive: boolean;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  const load = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data: userData } = await supabase.auth.getUser();
    setSelfId(userData.user?.id ?? null);

    const { data } = await supabase.from("staff_profiles").select("*").order("full_name");
    if (!data) return;

    // is_active is a newer column that may not be live yet - fetched
    // separately so a missing column never breaks the rest of the list.
    const { data: activeRows } = await supabase.from("staff_profiles").select("user_id, is_active");
    const activeByUserId = new Map(activeRows?.map((row) => [row.user_id, row.is_active]));

    setStaff(
      data.map((row) => ({
        userId: row.user_id,
        fullName: row.full_name,
        role: row.role,
        department: row.department,
        isAdmin: row.is_admin,
        isActive: activeByUserId.get(row.user_id) ?? true,
      }))
    );
    setIsAdmin(data.find((row) => row.user_id === userData.user?.id)?.is_admin ?? false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  const updateStaff = async (
    userId: string,
    patch: Partial<{ full_name: string; department: string | null; role: string; is_admin: boolean; is_active: boolean }>
  ) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.userId === userId
          ? {
              ...s,
              fullName: patch.full_name ?? s.fullName,
              department: patch.department !== undefined ? patch.department : s.department,
              role: patch.role ?? s.role,
              isAdmin: patch.is_admin ?? s.isAdmin,
              isActive: patch.is_active ?? s.isActive,
            }
          : s
      )
    );

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("staff_profiles").update(patch).eq("user_id", userId);
  };

  const toggleAdmin = (member: StaffRow) => {
    if (member.userId === selfId && member.isAdmin) {
      if (!window.confirm("Remove your own admin access? You won't be able to undo this yourself.")) return;
    }
    updateStaff(member.userId, { is_admin: !member.isAdmin });
  };

  const toggleActive = (member: StaffRow) => {
    if (member.userId === selfId) {
      window.alert("You can't deactivate your own account - ask another admin to do it.");
      return;
    }
    if (member.isActive && !window.confirm(`Deactivate ${member.fullName}? They'll immediately lose access to the admin area.`)) return;
    updateStaff(member.userId, { is_active: !member.isActive });
  };

  return (
    <AdminShell title="Staff">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so there&apos;s no staff list to show.
        </div>
      )}

      {configured && !isAdmin && (
        <div className="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          You can see the staff list, but only an admin can change roles or access.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {staff.map((member) => (
          <div
            key={member.userId}
            className={`flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 sm:flex-row sm:items-center sm:justify-between ${
              member.isActive ? "" : "opacity-60"
            }`}
          >
            <div className="flex-1">
              {isAdmin ? (
                <input
                  value={member.fullName}
                  onChange={(e) => updateStaff(member.userId, { full_name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-2 py-1.5 font-medium text-dv-black"
                />
              ) : (
                <p className="font-medium text-dv-black">{member.fullName}</p>
              )}
              {member.userId === selfId && <span className="text-xs text-dv-pool">You</span>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdmin ? (
                <select
                  value={member.role}
                  onChange={(e) => updateStaff(member.userId, { role: e.target.value })}
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm capitalize text-muted-foreground">{member.role.replace("_", " ")}</span>
              )}

              {isAdmin ? (
                <input
                  value={member.department ?? ""}
                  placeholder="Department"
                  onChange={(e) => updateStaff(member.userId, { department: e.target.value || null })}
                  className="w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                />
              ) : (
                member.department && <span className="text-sm text-muted-foreground">{member.department}</span>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => toggleAdmin(member)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    member.isAdmin ? "bg-dv-forest text-dv-ivory" : "border border-border text-dv-black hover:bg-dv-cream"
                  }`}
                >
                  {member.isAdmin ? "Admin" : "Make admin"}
                </button>
              )}
              {!isAdmin && member.isAdmin && <span className="rounded-full bg-dv-forest px-3 py-1.5 text-xs font-bold text-dv-ivory">Admin</span>}

              {!member.isActive && (
                <span className="rounded-full bg-dv-black/10 px-3 py-1.5 text-xs font-bold text-dv-black">Deactivated</span>
              )}
              {isAdmin && member.userId !== selfId && (
                <button
                  type="button"
                  onClick={() => toggleActive(member)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    member.isActive ? "border border-border text-dv-black hover:bg-dv-cream" : "bg-dv-pool text-dv-ivory"
                  }`}
                >
                  {member.isActive ? "Deactivate" : "Reactivate"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
