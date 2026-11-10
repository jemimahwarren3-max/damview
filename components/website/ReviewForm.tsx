"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { FormField } from "@/components/shared/FormField";
import { getSupabaseClient } from "@/lib/supabase/client";

export function ReviewForm() {
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      let imageUrl: string | null = null;

      if (photo) {
        const path = `reviews/${Date.now()}-${photo.name}`;
        const { error: uploadError } = await supabase.storage.from("media").upload(path, photo);
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
      }

      const { error: insertError } = await supabase.from("guest_reviews").insert({
        guest_name: name,
        rating,
        quote,
        image: imageUrl,
      });
      if (insertError) throw insertError;

      setStatus("done");
      setName("");
      setQuote("");
      setRating(5);
      setPhoto(null);
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p className="rounded-2xl border border-border bg-card p-6 text-sm text-dv-forest">
        Thank you for sharing your experience. Your review will appear here once our team
        reviews it.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Your name" name="name">
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
          />
        </FormField>

        <FormField label="Rating" name="rating">
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} out of 5 stars`}
                className="text-dv-gold"
              >
                <Star size={22} fill={value <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </FormField>
      </div>

      <FormField label="Your experience" name="quote">
        <textarea
          id="quote"
          required
          rows={3}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
        />
      </FormField>

      <FormField label="Add a photo (optional)" name="photo">
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        />
      </FormField>

      {status === "error" && (
        <p className="text-sm text-destructive">
          Something went wrong submitting your review. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-fit rounded-full bg-dv-forest px-7 py-3 text-sm font-bold text-dv-ivory transition-colors hover:bg-dv-leaf disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit your review"}
      </button>
      <span className="text-xs text-muted-foreground">
        Reviews are checked by our team before they appear on the site.
      </span>
    </form>
  );
}
