import { createClient } from "@/lib/supabase/server";
import { getOrSetVersionedCache, stableCacheKey } from "@/lib/cache/redis";
import HistoryList from "@/components/admin/HistoryList";
import HistoryTabs from "@/components/admin/HistoryTabs";
import TableHistoryList from "@/components/admin/TableHistoryList";
import { Users, DollarSign } from "lucide-react";

const PAGE_SIZE = 50;
const TABLE_PAGE_SIZE = 20;


export default async function SuperadminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    rpage?: string;
    rsearch?: string;
  }>;
}) {
  const {
    page: pageStr,
    search = "",
    rpage: rPageStr,
    rsearch = "",
  } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1"));
  const offset = (page - 1) * PAGE_SIZE;
  const tablePage = Math.max(1, parseInt(rPageStr || "1"));
  const tableOffset = (tablePage - 1) * TABLE_PAGE_SIZE;

  const supabase = await createClient();
  const {
    data,
    count,
    error,
    tableBills,
    tableBillsCount,
    latestBillByGuestId,
    totalRevenue,
  } = await getOrSetVersionedCache({
    domain: "history",
    key: stableCacheKey("superadmin:history", {
      page,
      search,
      tablePage,
      rsearch,
    }),
    ttlSeconds: 20,
    loader: async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearAgoIso = oneYearAgo.toISOString();

      let dataQuery = supabase
        .from("guests")
        .select(
          `id, name, guest_code, check_in, check_out, phone, email, gst_number, id_proof_name, id_proof_number, other_guest_names, people_count, rooms:room_id ( room_number, type )`,
          { count: "exact" },
        )
        .eq("is_active", false)
        .gte("check_in", oneYearAgo.toISOString());

      if (search.trim()) {
        dataQuery = dataQuery.or(
          `name.ilike.%${search.trim()}%,guest_code.ilike.%${search.trim()}%`,
        );
      }

      const [{ data, count, error }, revenueResult] = await Promise.all([
        dataQuery
          .order("check_out", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1),
        (() => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return supabase
            .from("bills")
            .select("total_amount")
            .eq("payment_status", "paid")
            .gte("created_at", thirtyDaysAgo.toISOString())
            .limit(500);
        })(),
      ]);

      const cleanRsearch = rsearch
        .replace(/^#/, "")
        .replace(/-/g, "")
        .trim()
        .toLowerCase();

      const applyBillSearch = (query: any) => {
        if (!cleanRsearch) return query;
        if (!/^[0-9a-f]{1,32}$/i.test(cleanRsearch)) {
          return query.eq("id", "00000000-0000-0000-0000-000000000000");
        }
        const pad0 = cleanRsearch.padEnd(32, "0");
        const padF = cleanRsearch.padEnd(32, "f");
        const formatUuid = (s: string) =>
          `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
        return query.gte("id", formatUuid(pad0)).lte("id", formatUuid(padF));
      };

      let tableBillsQuery = supabase
        .from("restaurant_bills")
        .select(
          "id, table_id, food_charges, discount_amount, gst_amount, total_amount, payment_mode, created_at, items, restaurant_tables ( table_number )",
          { count: "exact" },
        )
        .eq("payment_status", "paid")
        .gte("created_at", oneYearAgoIso);

      tableBillsQuery = applyBillSearch(tableBillsQuery);

      const tableBillsWithItems = await tableBillsQuery
        .range(tableOffset, tableOffset + TABLE_PAGE_SIZE - 1)
        .order("created_at", { ascending: false });

      let tableBills: any[] = [];
      let tableBillsCount = 0;

      if (tableBillsWithItems.error) {
        const msg = (tableBillsWithItems.error.message || "").toLowerCase();
        const itemsColumnMissing =
          msg.includes("items") &&
          (msg.includes("schema cache") ||
            msg.includes("column") ||
            msg.includes("does not exist"));

        if (itemsColumnMissing) {
          let fallbackQuery = supabase
            .from("restaurant_bills")
            .select(
              "id, table_id, food_charges, discount_amount, gst_amount, total_amount, payment_mode, created_at, restaurant_tables ( table_number )",
              { count: "exact" },
            )
            .eq("payment_status", "paid")
            .gte("created_at", oneYearAgoIso);

          fallbackQuery = applyBillSearch(fallbackQuery);

          const tableBillsWithoutItems = await fallbackQuery
            .range(tableOffset, tableOffset + TABLE_PAGE_SIZE - 1)
            .order("created_at", { ascending: false });
          tableBills = tableBillsWithoutItems.data || [];
          tableBillsCount = tableBillsWithoutItems.count || 0;
        }
      } else {
        tableBills = tableBillsWithItems.data || [];
        tableBillsCount = tableBillsWithItems.count || 0;
      }

      const guestIds = (data || []).map((guest) => guest.id);
      const { data: bills } =
        guestIds.length > 0
          ? await supabase
              .from("bills")
              .select(
                "id, guest_id, total_amount, room_charges, food_charges, extra_charges, extra_charges_details, discount_amount, gst_amount, payment_mode, payment_status, created_at",
              )
              .in("guest_id", guestIds)
              .order("created_at", { ascending: false })
          : { data: [] };

      const latestBillByGuestId: Record<string, any> = {};
      for (const bill of bills || []) {
        if (bill.guest_id && !latestBillByGuestId[bill.guest_id]) {
          latestBillByGuestId[bill.guest_id] = bill;
        }
      }

      const totalRevenue =
        revenueResult.data?.reduce((s, b) => s + Number(b.total_amount), 0) ??
        0;

      return {
        data: data || [],
        count: count || 0,
        error: error?.message || null,
        tableBills,
        tableBillsCount,
        latestBillByGuestId,
        totalRevenue,
      };
    },
  });

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const totalCount = count ?? 0;

  const mappedTableBills = (tableBills || []).map((b: any) => ({
    id: b.id,
    table_number: b.restaurant_tables?.table_number || null,
    food_charges: Number(b.food_charges || 0),
    discount_amount: Number(b.discount_amount || 0),
    gst_amount: Number(b.gst_amount || 0),
    total_amount: b.total_amount,
    payment_mode: b.payment_mode,
    created_at: b.created_at,
    items: Array.isArray(b.items) ? b.items : [],
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">
          Full History
        </h2>
        <p className="page-subtitle">
          Complete checkout history with export capabilities.
        </p>
      </div>

      <div className="kpi-grid grid-cols-2">
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-neutral-100 p-2.5 rounded-xl">
            <Users className="h-5 w-5 text-neutral-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Checkouts
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {totalCount.toLocaleString("en-US")}
            </p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              ${totalRevenue.toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </div>

      <HistoryTabs
        hotelContent={
          <div className="glass-card overflow-hidden">
            <HistoryList
              historyLogs={(data || []).map((guest: any) => ({
                ...guest,
                rooms: Array.isArray(guest.rooms) ? guest.rooms[0] : guest.rooms,
                bills: latestBillByGuestId[guest.id] || null,
              }))}
              totalCount={totalCount}
              currentPage={page}
              pageSize={PAGE_SIZE}
              searchQuery={search}
              totalRevenue={totalRevenue}
            />
          </div>
        }
        restaurantContent={
          <TableHistoryList
            bills={mappedTableBills}
            totalCount={tableBillsCount}
            currentPage={tablePage}
            pageSize={TABLE_PAGE_SIZE}
            pageParam="rpage"
            searchQuery={rsearch}
          />
        }
      />
    </div>
  );
}
