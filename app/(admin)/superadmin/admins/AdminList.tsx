"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  toggleAdminStatus,
  deleteAdmin,
  resetAdminPassword,
} from "@/lib/actions/admins";
import {
  ShieldCheck,
  Shield,
  ShieldOff,
  Trash2,
  KeyRound,
  Mail,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export default function AdminList({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { confirm, prompt } = useConfirm();
  const router = useRouter();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleToggle = async (userId: string, currentRole: string) => {
    if (currentRole === "superadmin") {
      toast.error("Superadmin roles cannot be modified.");
      return;
    }
    setLoadingId(userId);
    const isDisabled = currentRole === "disabled";
    const { error } = await toggleAdminStatus(userId, currentRole);
    if (error) {
      toast.error(error);
    } else {
      toast.success(
        `Account ${isDisabled ? "enabled" : "disabled"} successfully`,
      );
      router.refresh();
    }
    setLoadingId(null);
  };

  const handleDelete = async (userId: string, role: string) => {
    if (role === "superadmin") {
      toast.error("Cannot delete the Superadmin.");
      return;
    }

    const confirmed = await confirm({
      title: "Delete Admin Account",
      message:
        "Are you sure you want to permanently delete this administrator? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    setLoadingId(userId);
    const { error } = await deleteAdmin(userId);
    if (error) {
      toast.error(error);
    } else {
      setUsers(users.filter((u) => u.id !== userId));
      toast.success("Admin account deleted");
    }
    setLoadingId(null);
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = await prompt({
      title: "Reset Admin Password",
      message:
        "Enter a new password for this administrator (minimum 6 characters).",
      placeholder: "New password",
      confirmText: "Reset Password",
      required: true,
    });
    if (!newPassword) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoadingId(userId);
    const { error } = await resetAdminPassword(userId, newPassword);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Password updated successfully.");
    }
    setLoadingId(null);
  };

  const roleLabels: Record<string, string> = {
    superadmin: "Admin",
    admin: "Manager 1",
    manager: "Manager 2",
    kitchen: "Kitchen",
    disabled: "Disabled",
  };

  const roleConfig: Record<
    string,
    { bg: string; text: string; border: string; icon: any; glow: string }
  > = {
    superadmin: {
      bg: "bg-neutral-50",
      text: "text-neutral-700",
      border: "border-neutral-200",
      icon: ShieldCheck,
      glow: "shadow-neutral-100",
    },
    admin: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: Shield,
      glow: "shadow-emerald-100",
    },
    manager: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: Shield,
      glow: "shadow-blue-100",
    },
    kitchen: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Shield,
      glow: "shadow-amber-100",
    },
    disabled: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
      icon: ShieldOff,
      glow: "shadow-rose-100",
    },
  };

  return (
    <div className="p-5 space-y-3 stagger-children">
      {users.map((user) => {
        const rc = roleConfig[user.role] || roleConfig.disabled;
        const isLoading = loadingId === user.id;
        const isSuperadmin = user.role === "superadmin";

        return (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-xl border bg-white transition-all duration-200 ${isSuperadmin ? "border-neutral-200 bg-neutral-50" : "border-neutral-200/80 hover:border-neutral-300/80"}`}
          >
            {/* Avatar */}
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${isSuperadmin ? "bg-neutral-50 border border-neutral-200 shadow-sm shadow-black/5" : "bg-neutral-50 border border-neutral-200 shadow-neutral-200/50"}`}
            >
              <span className="text-neutral-700 text-lg font-bold">
                {user.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-neutral-900 text-sm truncate">
                  {user.email}
                </h4>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${rc.bg} ${rc.text} ${rc.border}`}
                >
                  <rc.icon className="h-3 w-3" />
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
              <p
                className="text-xs text-neutral-400 mt-1 flex items-center gap-1"
                suppressHydrationWarning
              >
                <Mail className="h-3 w-3" />
                Joined{" "}
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {!isSuperadmin ? (
                <>
                  <button
                    onClick={() => handleResetPassword(user.id)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 hover:bg-neutral-100 transition-all disabled:opacity-50"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Reset
                  </button>

                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(user.id, user.role)}
                    disabled={isLoading}
                    title={
                      user.role === "disabled"
                        ? "Enable account"
                        : "Disable account"
                    }
                    className="flex items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 w-10 text-right">
                      {user.role === "disabled" ? "OFF" : "ON"}
                    </span>
                    <span
                      className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors duration-200 ${
                        user.role === "disabled"
                          ? "bg-neutral-200 border-neutral-300"
                          : "bg-emerald-500 border-emerald-600"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white absolute left-1/2 -translate-x-1/2" />
                      ) : (
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                            user.role === "disabled"
                              ? "translate-x-0.5"
                              : "translate-x-5"
                          }`}
                        />
                      )}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(user.id, user.role)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 p-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-neutral-400 italic font-medium px-3 py-2">
                  🔒 Protected
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
