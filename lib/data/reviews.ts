import type { GuestReview } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

/** Only ever returns 'approved' reviews — enforced both by the query and by RLS. */
export async function getApprovedReviews(): Promise<GuestReview[]> {
  "use cache";
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("guest_reviews")
    .select("id, guest_name, rating, quote, image")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data.map((review) => ({
    id: review.id,
    guestName: review.guest_name,
    rating: review.rating as GuestReview["rating"],
    quote: review.quote,
    image: review.image ?? undefined,
    isSample: review.quote.startsWith("[Sample"),
  }));
}
