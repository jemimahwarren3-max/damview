import type { getSupabaseClient } from "@/lib/supabase/client";
import { normalizePhone } from "@/lib/phone";

type SupabaseClient = NonNullable<ReturnType<typeof getSupabaseClient>>;

/**
 * Finds or creates a customer record by phone number, so repeat guests'
 * enquiries can be linked together without needing an account. Never
 * reveals or returns any of that customer's existing bookings - only the
 * id, for the caller to attach to the enquiry it's about to insert.
 */
export async function upsertCustomerByPhone(
  supabase: SupabaseClient,
  { fullName, phone }: { fullName: string; phone: string }
): Promise<string | undefined> {
  const normalized = normalizePhone(phone);
  if (!normalized) return undefined;

  const { data: inserted, error: insertError } = await supabase
    .from("customers")
    .insert({ full_name: fullName, phone, normalized_phone: normalized })
    .select("id")
    .single();

  if (!insertError) return inserted.id;

  // Unique violation on normalized_phone - the customer already exists, reuse it.
  if (insertError.code === "23505") {
    const { data: existing } = await supabase.from("customers").select("id").eq("normalized_phone", normalized).maybeSingle();
    return existing?.id;
  }

  return undefined;
}
