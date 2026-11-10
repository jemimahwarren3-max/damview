"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { GALLERY_ITEMS } from "@/lib/data/admin-fallback";
import type { GalleryItem } from "@/types";

const CATEGORIES: GalleryItem["category"][] = [
  "accommodation",
  "pool",
  "restaurant",
  "gym",
  "waterfront",
  "activities",
  "events",
  "general",
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);
  const [category, setCategory] = useState<GalleryItem["category"]>("general");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("gallery_items")
      .select("id, category, type, url, caption")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!fetchError && data) {
          setItems(
            data.map((row) => ({
              id: row.id,
              category: row.category as GalleryItem["category"],
              type: row.type as GalleryItem["type"],
              url: row.url,
              caption: row.caption ?? undefined,
            }))
          );
        }
      });
  }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !file) return;

    setUploading(true);
    try {
      const path = `gallery/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);

      const { data: inserted, error: insertError } = await supabase
        .from("gallery_items")
        .insert({ category, type: "image", url: publicUrl.publicUrl, caption: caption || null })
        .select("id, category, type, url, caption")
        .single();
      if (insertError) throw insertError;

      setItems((prev) => [
        {
          id: inserted.id,
          category: inserted.category as GalleryItem["category"],
          type: inserted.type as GalleryItem["type"],
          url: inserted.url,
          caption: inserted.caption ?? undefined,
        },
        ...prev,
      ]);
      setCaption("");
      setFile(null);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onRemove = async (item: GalleryItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("gallery_items").delete().eq("id", item.id);
  };

  return (
    <AdminShell title="Gallery">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Uploads and
          removals here won&apos;t be saved.
        </div>
      )}

      <form onSubmit={onUpload} className="mb-8 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-4">
        <div>
          <label className="text-xs font-medium text-dv-black">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GalleryItem["category"])}
            className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-dv-black">Caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-1 block w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-dv-black">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!file || uploading}
          className="flex items-center gap-2 rounded-full bg-dv-forest px-5 py-2.5 text-sm font-semibold text-dv-ivory disabled:opacity-50"
        >
          <Upload size={16} /> {uploading ? "Uploading..." : "Upload photo"}
        </button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg">
            <Image src={item.url} alt={item.caption ?? item.category} fill className="object-cover" />
            <button
              type="button"
              onClick={() => onRemove(item)}
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
