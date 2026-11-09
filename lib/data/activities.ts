import type { Activity, ActivityCategory, PricingUnit } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  DAMSIDE_ACTIVITIES as FALLBACK_DAMSIDE,
  RECREATIONAL_ACTIVITIES as FALLBACK_RECREATIONAL,
} from "@/lib/data/admin-fallback";

function mapActivity(row: {
  id: string;
  category: string;
  name: string;
  description: string;
  price_amount: number | null;
  price_unit: string | null;
  image: string | null;
}): Activity {
  return {
    id: row.id,
    category: row.category as ActivityCategory,
    name: row.name,
    description: row.description,
    pricing:
      row.price_amount === null || row.price_unit === null
        ? undefined
        : { amount: Number(row.price_amount), unit: row.price_unit as PricingUnit },
    image: row.image ?? undefined,
  };
}

export async function getDamsideActivities(): Promise<Activity[]> {
  "use cache";
  const supabase = getSupabaseClient();
  if (!supabase) return FALLBACK_DAMSIDE;

  const { data, error } = await supabase.from("activities").select("*").eq("category", "damside").order("id");
  if (error) return FALLBACK_DAMSIDE;
  return data.map(mapActivity);
}

export async function getRecreationalActivities(): Promise<Activity[]> {
  "use cache";
  const supabase = getSupabaseClient();
  if (!supabase) return FALLBACK_RECREATIONAL;

  const { data, error } = await supabase.from("activities").select("*").eq("category", "recreational").order("id");
  if (error) return FALLBACK_RECREATIONAL;
  return data.map(mapActivity);
}
