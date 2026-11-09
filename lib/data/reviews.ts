import type { GuestReview } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

/** Sample-only placeholders, matching what's seeded in Supabase — used before Supabase is configured. */
const FALLBACK_REVIEWS: GuestReview[] = [
  {
    id: "sample-1",
    guestName: "Guest name (sample)",
    rating: 5,
    quote: "[Sample review text goes here]",
    image: "https://images.pexels.com/photos/8910365/pexels-photo-8910365.jpeg?auto=compress&cs=tinysrgb&w=600",
    isSample: true,
  },
  {
    id: "sample-2",
    guestName: "Guest name (sample)",
    rating: 5,
    quote: "[Sample review text goes here]",
    image: "https://images.pexels.com/photos/9287491/pexels-photo-9287491.jpeg?auto=compress&cs=tinysrgb&w=600",
    isSample: true,
  },
  {
    id: "sample-3",
    guestName: "Guest name (sample)",
    rating: 5,
    quote: "[Sample review text goes here]",
    image: "https://images.pexels.com/photos/6210611/pexels-photo-6210611.jpeg?auto=compress&cs=tinysrgb&w=600",
    isSample: true,
  },
];

/** Only ever returns 'approved' reviews — enforced both by the query and by RLS. */
export async function getApprovedReviews(): Promise<GuestReview[]> {
  "use cache";
  const supabase = getSupabaseClient();
  if (!supabase) return FALLBACK_REVIEWS;

  const { data, error } = await supabase
    .from("guest_reviews")
    .select("id, guest_name, rating, quote, image")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) return FALLBACK_REVIEWS;

  return data.map((review) => ({
    id: review.id,
    guestName: review.guest_name,
    rating: review.rating as GuestReview["rating"],
    quote: review.quote,
    image: review.image ?? undefined,
    isSample: review.quote.startsWith("[Sample"),
  }));
}
