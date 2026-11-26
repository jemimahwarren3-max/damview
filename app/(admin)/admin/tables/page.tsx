import { createClient } from "@/lib/supabase/server";
import { getCachedAuth } from "@/lib/supabase/cached-auth";
import { getOrSetVersionedCache } from "@/lib/cache/redis";
import { redirect } from "next/navigation";
import TableManagement from "./TableManagement";
import { Armchair } from "lucide-react";

export default async function TablesPage() {
  const { role } = await getCachedAuth();

  if (role === "kitchen") redirect("/admin/orders");

  const { tables, error } = await getOrSetVersionedCache({
    domain: "tables",
    key: "admin:tables:list",
    ttlSeconds: 30,
    loader: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .order("table_number", { ascending: true });
      return { tables: data || [], error: error?.message || null };
    },
  });

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Failed to load tables: {error}
      </div>
    );
  }

  const available = tables.filter((t: any) => t.status === "available").length;
  const occupied = tables.filter((t: any) => t.status === "occupied").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
          <Armchair className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-neutral-900">
            Restaurant Tables
          </h1>
          <p className="text-sm text-neutral-500">
            {tables.length} tables · {available} available · {occupied} occupied
          </p>
        </div>
      </div>

      <TableManagement initialTables={tables} role={role} />
    </div>
  );
}
