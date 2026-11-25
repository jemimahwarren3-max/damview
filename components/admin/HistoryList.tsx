"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Download,
  History,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Phone,
  User,
  Search,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/components/ui/Pagination";
import { getAllHistoryForExport, updateBillPaymentMode } from "@/lib/actions/history";

type PastGuest = {
  id: string;
  name: string;
  guest_code?: string;
  check_in: string;
  check_out: string | null;
  rooms: { room_number: number; type: string } | null;
  bills:
  | {
    id: string;
    total_amount: number;
    room_charges: number;
    food_charges: number;
    extra_charges: number;
    extra_charges_details?: { name: string; amount: number }[] | any;
    discount_amount: number;
    gst_amount?: number;
    payment_mode: string;
    payment_status?: string;
  }
  | {
    id: string;
    total_amount: number;
    room_charges: number;
    food_charges: number;
    extra_charges: number;
    extra_charges_details?: { name: string; amount: number }[] | any;
    discount_amount: number;
    gst_amount?: number;
    payment_mode: string;
    payment_status?: string;
  }[]
  | null;
  people_count?: number | null;
  phone?: string | null;
  id_proof_name?: string | null;
  id_proof_number?: string | null;
  other_guest_names?: string[] | null;
};

interface HistoryListProps {
  historyLogs: PastGuest[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  totalRevenue: number;
}

export default function HistoryList({
  historyLogs,
  totalCount,
  currentPage,
  pageSize,
  searchQuery,
  totalRevenue,
}: HistoryListProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const navigateSearch = (query: string) => {
    const params = new URLSearchParams(rawSearchParams.toString());
    if (query.trim()) params.set("search", query.trim());
    else params.delete("search");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearSearch = () => {
    setLocalSearch("");
    navigateSearch("");
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await getAllHistoryForExport(searchQuery || undefined);
      if ("error" in result && result.error) {
        toast.error("Export failed: " + result.error);
        return;
      }
      const allLogs = result.data ?? [];
      const headers = [
        "Guest ID",
        "Guest Name",
        "Room Number",
        "Room Type",
        "Check-In",
        "Check-Out",
        "Room Charges",
        "Food Charges",
        "Extra Charges",
        "Discount",
        "Tax",
        "Total Revenue Paid",
        "Payment Mode",
        "People Count",
      ];
      const rows = allLogs.map((guest: any) => {
        const finalBill = Array.isArray(guest.bills)
          ? guest.bills[0]
          : guest.bills;
        return [
          `"${guest.guest_code || "N/A"}"`,
          `"${guest.name}"`,
          `"${guest.rooms?.room_number || "N/A"}"`,
          `"${guest.rooms?.type || "N/A"}"`,
          `"${new Date(guest.check_in).toLocaleString('en-US')}"`,
          `"${guest.check_out ? new Date(guest.check_out).toLocaleString('en-US') : "N/A"}"`,
          finalBill?.room_charges || 0,
          finalBill?.food_charges || 0,
          finalBill?.extra_charges || 0,
          finalBill?.discount_amount || 0,
          finalBill?.gst_amount || 0,
          finalBill?.total_amount || 0,
          `"${finalBill?.payment_status === "pending" ? "Pending" : (finalBill?.payment_mode || "N/A")}"`,
          guest.people_count || 1,
        ].join(",");
      });
      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hotel_history_${new Date().toISOString().split("T")[0]}.csv`;
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${allLogs.length.toLocaleString('en-US')} records`);
    } catch {
      toast.error("Failed to generate CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const paymentModeConfig: Record<
    string,
    { bg: string; text: string; border: string; icon: string }
  > = {
    Cash: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "💵",
    },
    EcoCash: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "📱",
    },
    "Bank Transfer": {
      bg: "bg-neutral-50",
      text: "text-neutral-700",
      border: "border-neutral-200",
      icon: "🏦",
    },
    Pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: "⏳",
    },
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-neutral-200/60 gap-4 bg-neutral-50/30">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-100 p-2 rounded-xl">
            <History className="h-5 w-5 text-neutral-900" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-800 text-base">Past Records</h3>
            <p className="text-xs text-neutral-500">
              {totalCount.toLocaleString('en-US')}{" "}
              {searchQuery ? "results found" : "total checkouts"}
              {totalRevenue > 0 && (
                <span className="ml-2 font-bold text-emerald-600">
                  · ${totalRevenue.toLocaleString('en-US')} revenue
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search name or guest code… (Enter)"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && navigateSearch(localSearch)
              }
              className="w-full pl-9 pr-8 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-neutral-900/20 outline-none transition-all"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => navigateSearch(localSearch)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            Search
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 text-white shadow-sm bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Exporting…
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {historyLogs.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-20 h-20 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto mb-5">
            <Search className="h-10 w-10 text-neutral-300" />
          </div>
          <p className="text-neutral-500 font-semibold text-lg">
            No records found
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            {searchQuery
              ? "Try a different search term."
              : "No checkout history available."}
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="p-5 space-y-3 stagger-children">
            {historyLogs.map((log) => {
              const bill = Array.isArray(log.bills) ? log.bills[0] : log.bills;
              const pmConfig = paymentModeConfig[bill?.payment_status === "pending" ? "Pending" : (bill?.payment_mode || "")] || {
                bg: "bg-neutral-50",
                text: "text-neutral-600",
                border: "border-neutral-200",
                icon: "💰",
              };

              const checkIn = new Date(log.check_in);
              const checkOut = log.check_out ? new Date(log.check_out) : null;
              const nights = checkOut
                ? Math.max(
                  1,
                  Math.ceil(
                    (checkOut.getTime() - checkIn.getTime()) / 86400000,
                  ),
                )
                : 1;
              const isExpanded = expandedId === log.id;
              const otherNames = log.other_guest_names || [];

              return (
                <div
                  key={log.id}
                  className="flex flex-col rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300/80 transition-all duration-200 shadow-sm overflow-hidden group"
                >
                  {/* Summary Row */}
                  <div className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 text-sm font-bold flex-shrink-0">
                      {log.name?.charAt(0)?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-neutral-900 text-base">
                          {log.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-600 text-[11px] font-bold border border-neutral-200">
                          Room {log.rooms?.room_number}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {checkIn.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          -{" "}
                          {checkOut?.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Payment and Dropdown Toggle */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-sm">
                          $
                          {bill
                            ? Number(bill.total_amount).toLocaleString('en-US')
                            : "0"}
                        </p>
                      </div>
                      <span
                        className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${pmConfig.bg} ${pmConfig.text} ${pmConfig.border}`}
                      >
                        {bill?.payment_status === "pending" ? (
                          <select
                            className="bg-transparent border-none outline-none text-xs font-bold cursor-pointer"
                            defaultValue=""
                            onChange={async (e) => {
                              const mode = e.target.value;
                              if (!mode || !bill?.id) return;
                              const { error } = await updateBillPaymentMode(bill.id, mode);
                              if (error) {
                                toast.error("Failed to update: " + error);
                              } else {
                                toast.success(`Payment mode set to ${mode}`);
                              }
                            }}
                          >
                            <option value="" disabled>⏳ Pending</option>
                            <option value="Cash">💵 Cash</option>
                            <option value="EcoCash">📱 EcoCash</option>
                            <option value="Bank Transfer">🏦 Bank Transfer</option>
                          </select>
                        ) : (
                          <>{pmConfig.icon} {bill?.payment_mode || "N/A"}</>
                        )}
                      </span>
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="p-1.5 rounded-lg hover:bg-neutral-50 text-neutral-400 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-neutral-50 bg-neutral-50/30 animate-fade-in divide-y divide-neutral-100">
                      <div className="py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                        {/* Column 1: Stay Details */}
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Stay Records
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-500">
                                Guest Code:
                              </span>
                              <span className="font-bold text-neutral-900">
                                {log.guest_code || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-500">Duration:</span>
                              <span className="font-bold text-neutral-700">
                                {nights} {nights === 1 ? "Night" : "Nights"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-500">People:</span>
                              <span className="font-bold text-neutral-700">
                                {log.people_count || "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: ID & Contact */}
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Identity & Contact
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3 w-3 text-neutral-400" />
                              <span className="text-neutral-500 font-bold">
                                {log.phone || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <CreditCard className="h-3 w-3 text-neutral-400" />
                              <span className="text-neutral-500">
                                {log.id_proof_name || "ID"}:
                              </span>
                              <span className="font-bold text-neutral-700">
                                {log.id_proof_number || "—"}
                              </span>
                            </div>
                            {(log as any).email && (
                              <div className="flex items-center gap-2 text-xs">
                                <User className="h-3 w-3 text-neutral-400" />
                                <span className="text-neutral-500">
                                  Email:
                                </span>
                                <span className="font-bold text-neutral-700 truncate" title={(log as any).email}>
                                  {(log as any).email}
                                </span>
                              </div>
                            )}
                            {(log as any).gst_number && (
                              <div className="flex items-center gap-2 text-xs">
                                <CreditCard className="h-3 w-3 text-neutral-400" />
                                <span className="text-neutral-500">
                                  Tax No:
                                </span>
                                <span className="font-bold text-neutral-700">
                                  {(log as any).gst_number}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Column 3: Billing Breakdown */}
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Full Bill Breakdown
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-neutral-500">Room:</span>
                              <span className="font-medium text-neutral-700">
                                ${bill?.room_charges?.toLocaleString('en-US') || "0"}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-neutral-500">Food:</span>
                              <span className="font-medium text-neutral-700">
                                ${bill?.food_charges?.toLocaleString('en-US') || "0"}
                              </span>
                            </div>
                            {bill?.extra_charges_details &&
                              Array.isArray(bill.extra_charges_details) &&
                              bill.extra_charges_details.length > 0
                              ? bill.extra_charges_details.map(
                                (exp: { name: string; amount: number }, idx: number) => (
                                  <div
                                    key={`extra-${idx}`}
                                    className="flex justify-between text-[11px]"
                                  >
                                    <span className="text-neutral-500 capitalize">
                                      {exp.name}:
                                    </span>
                                    <span className="font-medium text-neutral-700">
                                      ${exp.amount.toLocaleString('en-US')}
                                    </span>
                                  </div>
                                ),
                              )
                              : (bill?.extra_charges || 0) > 0 && (
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-neutral-500">
                                    Extras:
                                  </span>
                                  <span className="font-medium text-neutral-700">
                                    ${bill?.extra_charges?.toLocaleString('en-US') || 0}
                                  </span>
                                </div>
                              )}
                            {(bill?.discount_amount || 0) > 0 && (
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-rose-500">
                                  Discount:
                                </span>
                                <span className="font-bold text-rose-600">
                                  -${bill?.discount_amount?.toLocaleString('en-US') || 0}
                                </span>
                              </div>
                            )}
                            {(bill?.gst_amount || 0) > 0 && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-neutral-500">Tax:</span>
                                <span className="font-medium text-neutral-700">
                                  $
                                  {bill?.gst_amount?.toLocaleString(undefined, {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 2,
                                  }) || 0}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Other Guests */}
                      {otherNames.length > 0 && (
                        <div className="py-3">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">
                            Companions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {otherNames.map((name: string, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-600 shadow-sm"
                              >
                                <User className="h-2.5 w-2.5 text-neutral-400" />
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        </>
      )}
    </div>
  );
}

