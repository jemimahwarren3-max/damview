"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ReceiptText,
  Search,
  X,
  Download,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/components/ui/Pagination";
import { getAllRestaurantHistoryForExport } from "@/lib/actions/history";

type TableBill = {
  id: string;
  table_number: number | null;
  food_charges: number;
  discount_amount: number;
  gst_amount: number;
  total_amount: number;
  payment_mode: string;
  created_at: string;
  items: { name?: string; quantity?: number; price?: number }[];
};

export default function TableHistoryList({
  bills,
  totalCount,
  currentPage,
  pageSize,
  pageParam,
  searchQuery = "",
}: {
  bills: TableBill[];
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  pageParam?: string;
  searchQuery?: string;
}) {
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
    if (query.trim()) params.set("rsearch", query.trim());
    else params.delete("rsearch");
    params.set(pageParam || "rpage", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearSearch = () => {
    setLocalSearch("");
    navigateSearch("");
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await getAllRestaurantHistoryForExport(searchQuery || undefined);
      if ("error" in result && result.error) {
        toast.error("Export failed: " + result.error);
        return;
      }
      const allBills = result.data ?? [];
      const headers = [
        "Bill ID",
        "Table Number",
        "Food Charges",
        "Discount",
        "Tax Amount",
        "Total Amount",
        "Payment Mode",
        "Date",
      ];
      const rows = allBills.map((bill: any) => {
        return [
          `"#${bill.id.slice(0, 8).toUpperCase()}"`,
          `"${bill.restaurant_tables?.table_number || "N/A"}"`,
          bill.food_charges || 0,
          bill.discount_amount || 0,
          bill.gst_amount || 0,
          bill.total_amount || 0,
          `"${bill.payment_mode || "N/A"}"`,
          `"${new Date(bill.created_at).toLocaleString('en-US')}"`,
        ].join(",");
      });
      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `restaurant_history_${new Date().toISOString().split("T")[0]}.csv`;
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${allBills.length.toLocaleString('en-US')} records`);
    } catch {
      toast.error("Failed to generate CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!bills || bills.length === 0) {
    return (
      <div className="flex flex-col">
        {/* Header (Empty state) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-neutral-200/60 gap-4 bg-neutral-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl">
              <UtensilsCrossed className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 text-base">Past Restaurant Bills</h3>
              <p className="text-xs text-neutral-500">
                Search or browse past orders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search Bill ID... (Enter)"
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
              disabled={isExporting || totalCount === 0 || !totalCount}
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
        
        <div className="p-16 text-center">
          <div className="w-20 h-20 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto mb-5">
            <Search className="h-10 w-10 text-neutral-300" />
          </div>
          <p className="text-neutral-500 font-semibold text-lg">
            No bills found
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            {searchQuery
              ? "Try a different search term."
              : "No table history available."}
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
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-neutral-200/60 gap-4 bg-neutral-50/30">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl">
            <UtensilsCrossed className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-800 text-base">Past Restaurant Bills</h3>
            <p className="text-xs text-neutral-500">
              {totalCount?.toLocaleString('en-US')}{" "}
              {searchQuery ? "results found" : "total bills"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search Bill ID... (Enter)"
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
            disabled={isExporting || totalCount === 0 || !totalCount}
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

      <div className="p-5 space-y-3">
      {bills.map((bill) => {
        const isExpanded = expandedId === bill.id;
        const totalItems = (bill.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        return (
          <div
            key={bill.id}
            className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm transition-all hover:border-neutral-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-neutral-900 text-lg">Table {bill.table_number || "Unknown"}</p>
                <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-neutral-400" />
                  {new Date(bill.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-full">
                  {bill.payment_mode || "Cash"}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Settled
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-2.5 py-2">
                <p className="text-neutral-500">Items</p>
                <p className="font-bold text-neutral-900">{totalItems}</p>
              </div>
              <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-2.5 py-2">
                <p className="text-neutral-500">Food</p>
                <p className="font-bold text-neutral-900">${Number(bill.food_charges).toLocaleString("en-US")}</p>
              </div>
              <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-2.5 py-2">
                <p className="text-neutral-500">Tax</p>
                <p className="font-bold text-neutral-900">${Number(bill.gst_amount).toLocaleString("en-US")}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-2">
                <p className="text-emerald-700">Total</p>
                <p className="font-semibold text-emerald-700">${Number(bill.total_amount).toLocaleString("en-US")}</p>
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={() => setExpandedId(isExpanded ? null : bill.id)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl py-2 transition-colors"
              >
                <ReceiptText className="h-3.5 w-3.5" />
                {isExpanded ? "Hide Details" : "View Details"}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200 p-3 space-y-3 animate-fade-in">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Dishes
                  </p>
                  {bill.items && bill.items.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {bill.items.map((item, idx) => {
                        const qty = Number(item.quantity || 0);
                        const price = Number(item.price || 0);
                        return (
                          <div key={`${bill.id}-${idx}`} className="flex justify-between text-sm">
                            <span className="text-neutral-700 truncate pr-2">
                              {item.name || "Unknown Item"} x {qty}
                            </span>
                            <span className="font-semibold text-neutral-900">
                              ${(qty * price).toLocaleString("en-US")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">
                      Dish breakdown unavailable for this bill.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white border border-neutral-200 px-2.5 py-2">
                    <p className="text-neutral-500">Discount</p>
                    <p className="font-bold text-rose-600">-${Number(bill.discount_amount).toLocaleString("en-US")}</p>
                  </div>
                  <div className="rounded-lg bg-white border border-neutral-200 px-2.5 py-2">
                    <p className="text-neutral-500">Bill ID</p>
                    <p className="font-semibold text-neutral-900 truncate">#{bill.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>

      {typeof totalCount === "number" &&
        typeof currentPage === "number" &&
        typeof pageSize === "number" && (
          <div className="bg-white border-t border-neutral-200 overflow-hidden">
            <Pagination
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              pageParam={pageParam || "rpage"}
            />
          </div>
        )}
    </div>
  );
}
