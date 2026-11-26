import { createClient } from "@/lib/supabase/server";
import { getOrSetVersionedCache } from "@/lib/cache/redis";
import { Utensils, Package, AlertTriangle } from "lucide-react";
import MenuList from "@/app/(admin)/admin/menu/MenuList";


export default async function SuperadminMenuPage() {
  const { menuItems, error } = await getOrSetVersionedCache({
    domain: "menu",
    key: "superadmin:menu:list",
    ttlSeconds: 20,
    loader: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("food_menu")
        .select("*")
        .order("name", { ascending: true });

      return { menuItems: data || [], error: error?.message || null };
    },
  });

  if (error)
    return <div className="p-8 text-red-500">Error: {error}</div>;

  const items = menuItems || [];
  const activeCount = items.filter((i) => i.is_active).length;
  const outOfStock = items.filter(
    (i) => i.available_quantity === 0 && i.is_active,
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">
          Menu Overview
        </h2>
        <p className="page-subtitle">
          Manage all food menu items and inventory levels.
        </p>
      </div>

      <div className="kpi-grid grid-cols-3">
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-neutral-100 p-2.5 rounded-xl">
            <Utensils className="h-5 w-5 text-neutral-900" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Items
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {items.length}
            </p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Active
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {activeCount}
            </p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-rose-100 p-2.5 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Out of Stock
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {outOfStock}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <MenuList initialItems={items} />
      </div>
    </div>
  );
}
