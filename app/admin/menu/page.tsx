"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { MENU_CATEGORIES, MENU_ITEMS } from "@/lib/data/admin-fallback";

export default function AdminMenuPage() {
  const [items, setItems] = useState(MENU_ITEMS);

  const updatePrice = (id: string, price: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, price } : item)));
  };

  return (
    <AdminShell title="Menu">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Edits here are local to your browser only. Connecting this to the live site needs the backend
        (Stage 10).
      </div>

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
