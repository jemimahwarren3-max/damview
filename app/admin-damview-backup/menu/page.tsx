"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { MENU_CATEGORIES, MENU_ITEMS } from "@/lib/data/admin-fallback";
import type { MenuItem } from "@/types";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [configured] = useState(() => getSupabaseBrowserClient() !== null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("menu_items")
      .select("id, category_id, name, price, description, image, available")
      .order("id")
      .then(({ data, error }) => {
        if (error || !data) return;
        setItems(
          data.map((row) => ({
            id: row.id,
            categoryId: row.category_id,
            name: row.name,
            price: Number(row.price),
            description: row.description ?? undefined,
            image: row.image ?? undefined,
            available: row.available,
          }))
        );
      });
  }, []);

  const updatePrice = async (id: string, price: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, price } : item)));

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("menu_items").update({ price }).eq("id", id);
  };

  return (
    <AdminShell title="Menu">
      {!configured && (
        <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
          Supabase isn&apos;t configured yet, so this is showing sample data only. Price changes
          here won&apos;t be saved or reflected on the live menu.
        </div>
      )}

      {MENU_CATEGORIES.map((category) => (
        <div key={category.id} className="mb-6 rounded-2xl border border-border bg-background p-5">
          <h2 className="font-serif text-lg text-dv-forest">{category.name}</h2>
          <div className="mt-3 flex flex-col divide-y divide-border">
            {items
              .filter((item) => item.categoryId === category.id)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="font-medium text-dv-black">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={item.price}
                      onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-right"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </AdminShell>
  );
}
