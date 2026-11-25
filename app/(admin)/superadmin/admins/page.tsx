import { createClient } from "@/lib/supabase/server";
import { getOrSetVersionedCache } from "@/lib/cache/redis";
import AdminList from "./AdminList";
import CreateAdminFormWrapper from "./CreateAdminFormWrapper";
import { ShieldCheck, Users } from "lucide-react";


export default async function ManageAdminsPage() {
  const { users, error } = await getOrSetVersionedCache({
    domain: "managers",
    key: "superadmin:managers:list",
    ttlSeconds: 30,
    loader: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: true });

      return { users: data || [], error: error?.message || null };
    },
  });

  if (error)
    return (
      <div className="p-8 text-red-500 font-medium">
        Error loading admins: {error}
      </div>
    );

  const admins = (users || []).filter((u: any) => u.role === "admin");
  const superadmins = (users || []).filter((u: any) => u.role === "superadmin");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">
          Manage Administrators
        </h2>
        <p className="page-subtitle">
          Create, view, and manage admin access.
        </p>
      </div>

      <div className="kpi-grid grid-cols-2">
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-neutral-100 p-2.5 rounded-xl">
            <Users className="h-5 w-5 text-neutral-900" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Admins
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {admins.length}
            </p>
          </div>
        </div>
        <div className="kpi-cell flex items-center gap-3">
          <div className="bg-neutral-100 p-2.5 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-neutral-900" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Super Admins
            </p>
            <p className="text-2xl font-semibold text-neutral-900">
              {superadmins.length}
            </p>
          </div>
        </div>
      </div>

      <CreateAdminFormWrapper />

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200/50">
          <h3 className="font-bold text-neutral-800">All Users</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            View and manage access for all registered users.
          </p>
        </div>
        <AdminList initialUsers={users || []} />
      </div>
    </div>
  );
}
