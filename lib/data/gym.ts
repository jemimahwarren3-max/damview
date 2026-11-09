import type { GymPackage, BillingPeriod } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

export const GYM_IMAGE =
  "https://images.pexels.com/photos/7031705/pexels-photo-7031705.jpeg?auto=compress&cs=tinysrgb&w=1200";

export async function getGymPackages(): Promise<GymPackage[]> {
  "use cache";
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("gym_packages").select("id, name, price, billing_period, features").order("id");
  if (error) throw error;

  return data.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price === null ? null : Number(pkg.price),
    billingPeriod: pkg.billing_period as BillingPeriod,
    features: pkg.features,
  }));
}
