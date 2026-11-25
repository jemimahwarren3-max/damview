"use server";

import { requireAuth } from "@/lib/auth-guard";
import {
  getOrSetVersionedCache,
  stableCacheKey,
  bumpCacheVersions,
} from "@/lib/cache/redis";
import { revalidatePath } from "next/cache";

/**
 * Updates the payment mode on an existing bill (used post-checkout from history)
 */
export async function updateBillPaymentMode(
  billId: string,
  paymentMode: string,
) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);

  const { error } = await supabase
    .from("bills")
    .update({ payment_mode: paymentMode, payment_status: "paid" })
    .eq("id", billId);

  if (error) return { error: error.message };

  revalidatePath("/admin/history");
  revalidatePath("/superadmin/history");
  await bumpCacheVersions(["history"]);
  return { success: true };
}

/**
 * Fetches ALL history records for CSV export (bypasses pagination).
 * Only used when user clicks "Export CSV".
 */
export async function getAllHistoryForExport(searchQuery?: string) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);
  return getOrSetVersionedCache({
    domain: "history",
    key: stableCacheKey("export", { searchQuery: searchQuery || "" }),
    ttlSeconds: 30,
    loader: async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      let query = supabase
        .from("guests")
        .select(
          `
            id, name, guest_code, check_in, check_out, phone,
            email, gst_number,
            id_proof_name, id_proof_number, other_guest_names, people_count,
            rooms:room_id ( room_number, type )
        `,
        )
        .eq("is_active", false)
        .gte("check_in", oneYearAgo.toISOString());

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim();
        if (!/^\d+$/.test(q)) {
          query = query.or(`name.ilike.%${q}%,guest_code.ilike.%${q}%`);
        }
      }

      const { data, error } = await query.order("check_out", {
        ascending: false,
      });
      if (error) return { error: error.message };

      const guestIds = (data || []).map((guest) => guest.id);
      const latestBillByGuestId: Record<string, any> = {};

      if (guestIds.length > 0) {
        const { data: bills, error: billsError } = await supabase
          .from("bills")
          .select(
            "guest_id, total_amount, room_charges, food_charges, extra_charges, extra_charges_details, discount_amount, gst_amount, payment_mode, payment_status, created_at",
          )
          .in("guest_id", guestIds)
          .order("created_at", { ascending: false });

        if (billsError) return { error: billsError.message };

        for (const bill of bills || []) {
          if (bill.guest_id && !latestBillByGuestId[bill.guest_id]) {
            latestBillByGuestId[bill.guest_id] = bill;
          }
        }
      }

      return {
        data: (data ?? []).map((guest) => ({
          ...guest,
          bills: latestBillByGuestId[guest.id] || null,
        })),
      };
    },
  });
}

export async function getAllRestaurantHistoryForExport(searchQuery?: string) {
  const { supabase } = await requireAuth(["admin", "superadmin", "manager", "cashier"]);
  return getOrSetVersionedCache({
    domain: "history",
    key: stableCacheKey("export:restaurant", {
      searchQuery: searchQuery || "",
    }),
    ttlSeconds: 30,
    loader: async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      let query = supabase
        .from("restaurant_bills")
        .select(
          `
          id, table_id, food_charges, discount_amount, gst_amount, total_amount, payment_mode, created_at,
          restaurant_tables ( table_number )
        `,
        )
        .eq("payment_status", "paid")
        .gte("created_at", oneYearAgo.toISOString());

      const cleanRsearch = (searchQuery || "")
        .replace(/^#/, "")
        .replace(/-/g, "")
        .trim()
        .toLowerCase();

      if (cleanRsearch) {
        if (!/^[0-9a-f]{1,32}$/i.test(cleanRsearch)) {
          query = query.eq("id", "00000000-0000-0000-0000-000000000000");
        } else {
          const pad0 = cleanRsearch.padEnd(32, "0");
          const padF = cleanRsearch.padEnd(32, "f");
          const formatUuid = (s: string) =>
            `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;

          query = query.gte("id", formatUuid(pad0)).lte("id", formatUuid(padF));
        }
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) return { error: error.message };

      return { data: data || [] };
    },
  });
}
