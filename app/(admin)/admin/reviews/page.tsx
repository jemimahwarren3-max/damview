"use client";

import { useEffect, useState } from "react";
import { Star, Check, X, Loader2, Image as ImageIcon } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import toast from "react-hot-toast";

interface Review {
  id: string;
  guest_name: string;
  rating: number;
  quote: string;
  image: string | null;
  status: string;
  created_at: string;
}

const STATUS_TABS = ["pending", "approved", "rejected"] as const;

export default function ReviewModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("pending");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from("guest_reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setReviews(data as Review[]);
      });
  }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(id);
    const { error } = await supabase
      .from("guest_reviews")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(status === "approved" ? "Review approved" : "Review rejected");
    }
    setBusy(null);
  };

  const deleteReview = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(id);
    const { error } = await supabase.from("guest_reviews").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    }
    setBusy(null);
  };

  const filtered = reviews.filter((r) => r.status === tab);
  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Guest Reviews</h2>
        <p className="page-subtitle">
          Moderate reviews from the gallery page. Approved reviews are shown publicly.
        </p>
      </div>

      <div className="flex gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === s
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] > 0 && (
              <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                s === "pending" && tab !== s ? "bg-amber-100 text-amber-700" : "bg-white/20 text-inherit"
              }`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          No {tab} reviews.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-neutral-900 text-sm">{review.guest_name}</p>
                <p className="text-xs text-neutral-400" suppressHydrationWarning>
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-neutral-200"}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-neutral-700 leading-relaxed flex-1">
              &ldquo;{review.quote}&rdquo;
            </p>

            {review.image && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <ImageIcon className="h-3.5 w-3.5" />
                Photo attached
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-neutral-100">
              {review.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(review.id, "approved")}
                    disabled={busy === review.id}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {busy === review.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(review.id, "rejected")}
                    disabled={busy === review.id}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </>
              )}
              {review.status === "approved" && (
                <button
                  onClick={() => updateStatus(review.id, "rejected")}
                  disabled={busy === review.id}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Revoke
                </button>
              )}
              {review.status === "rejected" && (
                <button
                  onClick={() => updateStatus(review.id, "approved")}
                  disabled={busy === review.id}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve
                </button>
              )}
              <button
                onClick={() => deleteReview(review.id)}
                disabled={busy === review.id}
                className="flex items-center justify-center rounded-lg bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-200 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
