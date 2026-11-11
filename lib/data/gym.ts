import type { GymPackage, BillingPeriod } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { GYM_PACKAGES as FALLBACK_GYM_PACKAGES } from "@/lib/data/admin-fallback";

export const GYM_IMAGE = "/images/gym/real/gym-1.jpg";

export async function getGymPackages(): Promise<GymPackage[]> {
  "use cache";
  const supabase = getSupabaseClient();
  if (!supabase) return FALLBACK_GYM_PACKAGES;

  const { data, error } = await supabase.from("gym_packages").select("id, name, price, billing_period, features").order("id");
  if (error) return FALLBACK_GYM_PACKAGES;

  return data.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price === null ? null : Number(pkg.price),
    billingPeriod: pkg.billing_period as BillingPeriod,
    features: pkg.features,
  }));
}
