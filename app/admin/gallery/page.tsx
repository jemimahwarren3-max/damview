"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GALLERY_ITEMS } from "@/lib/data/gallery";

export default function AdminGalleryPage() {
  const [items, setItems] = useState(GALLERY_ITEMS);

  return (
    <AdminShell title="Gallery">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Removing here only updates your browser&apos;s view — photo storage/upload needs the backend
        (Stage 10), so uploading is disabled for now.
      </div>

      <button
        type="button"
        disabled
        className="mb-6 flex items-center gap-2 rounded-full border border-dashed border-border px-5 py-3 text-sm text-muted-foreground"
      >
        <Upload size={16} /> Upload photo (available once the backend is connected)
      </button>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg">
            <Image src={item.url} alt={item.caption ?? item.category} fill className="object-cover" />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-dv-black/70 text-dv-ivory"
              aria-label={`Remove ${item.caption ?? "photo"}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
