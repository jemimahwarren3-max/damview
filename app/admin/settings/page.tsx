"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormField } from "@/components/shared/FormField";
import { SITE_NAME, LOCATION, CONTACT_NUMBERS } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <AdminShell title="Settings">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        These fields aren&apos;t connected to anything yet. Saving here won&apos;t change the live site until
        the backend is built (Stage 10).
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
        className="flex max-w-lg flex-col gap-5 rounded-2xl border border-border bg-background p-6"
      >
        <FormField label="Business name" name="name">
          <input defaultValue={SITE_NAME} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <FormField label="Location" name="location">
          <input defaultValue={LOCATION} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <FormField label="Primary WhatsApp number" name="primary">
          <input defaultValue={CONTACT_NUMBERS.primary} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <FormField label="Secondary WhatsApp number" name="secondary">
          <input defaultValue={CONTACT_NUMBERS.secondary} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <button type="submit" className="w-fit rounded-full bg-dv-forest px-6 py-2.5 text-sm font-bold text-dv-ivory hover:bg-dv-leaf">
          Save
        </button>
        {saved && <span className="text-sm text-dv-pool">Saved locally, not yet connected to the live site.</span>}
      </form>
    </AdminShell>
  );
}
