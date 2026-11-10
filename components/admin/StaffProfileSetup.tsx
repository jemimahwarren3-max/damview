"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const ROLES = [
  { value: "director", label: "Director" },
  { value: "general_manager", label: "General Manager" },
  { value: "managerial_officer", label: "Managerial Officer" },
  { value: "department_head", label: "Department Head" },
  { value: "employee", label: "Employee" },
] as const;

export function StaffProfileSetup({ onDone }: { onDone: () => void }) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("employee");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Not signed in.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("staff_profiles").insert({
      user_id: userData.user.id,
      full_name: fullName,
      role,
      department: department || null,
    });

    setSaving(false);
    if (insertError) {
      setError("Couldn't save your profile. Please try again.");
      return;
    }
    onDone();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dv-cream px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-background p-8">
        <h1 className="font-serif text-xl text-dv-forest">Finish setting up your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This only happens once. If you&apos;re the first person to set this up, you&apos;ll be
          made an admin automatically.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-dv-black">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dv-black">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-dv-black">Department (optional)</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full rounded-full bg-dv-forest px-6 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf disabled:opacity-60"
        >
          {saving ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
