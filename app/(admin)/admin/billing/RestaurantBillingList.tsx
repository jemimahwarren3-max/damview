"use client";

import { useEffect, useState } from "react";
import { printRestaurantBill } from "@/lib/printing";
import { settleTableBill } from "@/lib/actions/restaurantBilling";
import { Armchair, Receipt, DollarSign, Check, X, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type TableOrder = {
  table_id: string;
  order_items: { quantity: number; price_snapshot: number }[];
};

type RestaurantTable = {
  id: string;
  table_number: number;
  capacity: number;
  status: "available" | "occupied";
};

type RecentBill = {
  id: string;
  table_id: string;
  food_charges: number;
  discount_amount: number;
  gst_amount: number;
  total_amount: number;
  payment_mode: string;
  created_at: string;
  items?: { name: string; quantity: number; price: number }[];
  restaurant_tables: { table_number: number } | null;
};

export default function RestaurantBillingList({
  tables,
  tableOrdersMap,
  tableItemsMap = {},
  unservedMap = {},
  recentBills,
}: {
  tables: RestaurantTable[];
  tableOrdersMap: Record<string, number>;
  tableItemsMap?: Record<
    string,
    { name: string; quantity: number; price: number }[]
  >;
  unservedMap?: Record<string, boolean>;
  recentBills: RecentBill[];
}) {
  const router = useRouter();
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [pendingBillId, setPendingBillId] = useState<string | null>(null);
  const [processingTableId, setProcessingTableId] = useState<string | null>(null);
  const [locallySettledTableIds, setLocallySettledTableIds] = useState<
    Record<string, true>
  >({});
  const [localRecentBills, setLocalRecentBills] = useState<RecentBill[]>(recentBills);
  const [discount, setDiscount] = useState("0");
  const [gstPercent, setGstPercent] = useState("5");
  const [paymentMode, setPaymentMode] = useState("Cash");

  useEffect(() => {
    setLocalRecentBills(recentBills);
  }, [recentBills]);

  const occupiedTables = tables.filter(
    (t) => t.status === "occupied" && !locallySettledTableIds[t.id],
  );

  const handleSettle = async (table: RestaurantTable) => {
    if (unservedMap[table.id]) {
      toast.error("Cannot settle bill. Pending food orders must be served or cancelled first.");
      return;
    }
    const foodCharges = tableOrdersMap[table.id] || 0;
    if (foodCharges === 0) {
      toast.error("Cannot settle bill. No orders have been placed for this table.");
      return;
    }
    if (processingTableId) return;
    setProcessingTableId(table.id);
    const foodChargesCalc = tableOrdersMap[table.id] || 0;
    const discountAmount = parseFloat(discount) || 0;
    const gstAmount =
      Math.round(
        (((foodChargesCalc - discountAmount) * (parseFloat(gstPercent) || 0)) /
          100) *
          100,
      ) / 100;
    const totalAmount = foodChargesCalc - discountAmount + gstAmount;

    if (totalAmount < 0) {
      toast.error("Total cannot be negative");
      setProcessingTableId(null);
      return;
    }

    const result = await settleTableBill(
      table.id,
      foodChargesCalc,
      discountAmount,
      gstAmount,
      totalAmount,
      paymentMode,
      tableItemsMap[table.id] || [],
      pendingBillId
    );

    if (result.error) toast.error(result.error);
    else {
      toast.success(`Table ${table.table_number} bill settled!`);

      // Optimistically remove from current billing list immediately
      // to avoid accidental double billing before refresh completes.
      setLocallySettledTableIds((prev) => ({ ...prev, [table.id]: true }));
      setLocalRecentBills((prev) => [
        {
          id: pendingBillId || `temp-${table.id}-${Date.now()}`,
          table_id: table.id,
          food_charges: foodChargesCalc,
          discount_amount: discountAmount,
          gst_amount: gstAmount,
          total_amount: totalAmount,
          payment_mode: paymentMode,
          created_at: new Date().toISOString(),
          items: tableItemsMap[table.id] || [],
          restaurant_tables: { table_number: table.table_number },
        },
        ...prev,
      ]);

      setSettlingId(null);
      setPendingBillId(null);
      setDiscount("0");
      setPaymentMode("Cash");
      router.refresh();
    }
    setProcessingTableId(null);
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Occupied Tables with Bills */}
      {occupiedTables.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <Armchair className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No occupied tables</p>
          <p className="text-sm mt-1">
            Orders placed for tables will appear here for billing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {occupiedTables.map((table) => {
            const foodTotal = tableOrdersMap[table.id] || 0;
            const isSettling = settlingId === table.id;

            return (
              <div
                key={table.id}
                className="glass-card overflow-hidden flex flex-col border-amber-200/50"
              >
                {/* Header */}
                <div className="bg-amber-50/50 border-b border-amber-100 p-4 text-neutral-900">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Armchair className="h-5 w-5 text-amber-600" />
                      <h3 className="text-lg font-semibold">
                        Table {table.table_number}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-100/80 text-amber-800">
                      Occupied
                    </span>
                  </div>
                  <p className="text-amber-700/70 font-medium text-sm">
                    {tableItemsMap[table.id]?.length || 0} Items Ordered
                  </p>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 space-y-4">
                  {/* Running total — shown before settlement so staff can quote the amount */}
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 space-y-1.5">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                      Current Order Total
                    </p>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Food</span>
                      <span>${foodTotal.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Tax ({gstPercent}%)</span>
                      <span>
                        ${(Math.round(foodTotal * (parseFloat(gstPercent) || 0) / 100 * 100) / 100).toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-amber-700 pt-1.5 border-t border-amber-200 text-sm">
                      <span>Est. Total</span>
                      <span>
                        ${(foodTotal + Math.round(foodTotal * (parseFloat(gstPercent) || 0) / 100 * 100) / 100).toLocaleString("en-US")}
                      </span>
                    </div>
                    <p className="text-[9px] text-amber-400 italic">*Before discount. Final total set at settlement.</p>
                  </div>
                  {/* Itemized Breakdown */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 max-h-48 overflow-y-auto">
                    <div className="text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                      Order Details
                    </div>
                    {tableItemsMap[table.id] &&
                    tableItemsMap[table.id].length > 0 ? (
                      <div className="space-y-2">
                        {tableItemsMap[table.id].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start text-sm"
                          >
                            <div className="flex-1 pr-2">
                              <span className="font-medium text-neutral-700">
                                {item.name}
                              </span>
                              <div className="text-xs text-neutral-500">
                                {item.quantity} x ${item.price}
                              </div>
                            </div>
                            <span className="font-bold text-neutral-900">
                              $
                              {(item.quantity * item.price).toLocaleString(
                                "en-US",
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500 italic">
                        No items details available
                      </div>
                    )}
                  </div>

                  {isSettling && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Discount ($)
                        </label>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="premium-input text-sm py-2"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Tax (%)
                        </label>
                        <input
                          type="number"
                          value={gstPercent}
                          onChange={(e) => setGstPercent(e.target.value)}
                          className="premium-input text-sm py-2"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 mt-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                          Payment Mode
                        </label>
                        <select
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className="premium-select text-sm py-2"
                        >
                          <option>Cash</option>
                          <option>EcoCash</option>
                          <option>Bank Transfer</option>
                        </select>
                      </div>
                    </div>
                      <div className="bg-neutral-50 rounded-xl p-3 space-y-1.5 border border-neutral-100">
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Food</span>
                          <span>${foodTotal}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>
                            VAT ({parseFloat(gstPercent) || 0}%)
                          </span>
                          <span>
                            $
                            {Math.round(
                              (foodTotal - (parseFloat(discount) || 0)) *
                                ((parseFloat(gstPercent) || 0) / 100) *
                                100,
                            ) / 100}
                          </span>
                        </div>
                        {parseFloat(discount) > 0 && (
                          <div className="flex justify-between text-xs text-rose-500">
                            <span>Discount</span>
                            <span>-${parseFloat(discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-semibold text-neutral-900 pt-1.5 border-t border-neutral-200">
                          <span>Total Due</span>
                          <span>
                            $
                            {(
                              foodTotal -
                              (parseFloat(discount) || 0) +
                              Math.round(
                                (foodTotal - (parseFloat(discount) || 0)) *
                                  ((parseFloat(gstPercent) || 0) / 100) *
                                  100,
                              ) /
                                100
                            ).toLocaleString("en-US")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t border-amber-100/50 space-y-2 bg-white/50">
                  {isSettling ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const discountAmount = parseFloat(discount) || 0;
                          const gstAmount =
                            Math.round(
                              (foodTotal - discountAmount) *
                                ((parseFloat(gstPercent) || 0) / 100) *
                                100,
                            ) / 100;
                          const total = foodTotal - discountAmount + gstAmount;
                          printRestaurantBill({
                            tableNumber: table.table_number,
                            billId: pendingBillId ? pendingBillId.slice(0, 8).toUpperCase() : undefined,
                            items: tableItemsMap[table.id] || [],
                            foodCharges: foodTotal,
                            discount: discountAmount,
                            gstAmount: gstAmount,
                            gstPercent: parseFloat(gstPercent) || 0,
                            totalAmount: total,
                            paymentMode: paymentMode,
                          });
                        }}
                        className="py-2 px-4 rounded-xl bg-neutral-100 text-neutral-700 border border-neutral-200 text-sm font-bold hover:bg-neutral-200 transition-colors shadow-sm"
                        title="Print Bill"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                        <button
                          onClick={() => handleSettle(table)}
                          disabled={processingTableId === table.id}
                          className="flex-1 py-3 rounded-xl text-white text-sm font-bold shadow-sm transition-all w-full items-center justify-center gap-2 flex"
                          style={{
                            background: "#10b981",
                          }}
                        >
                          {processingTableId === table.id ? "Processing..." : "✓ Final Settlement"}
                        </button>
                        <button
                          onClick={() => {
                            setSettlingId(null);
                            setPendingBillId(null);
                            setDiscount("0");
                          }}
                          className="py-3 px-4 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                  ) : (
                    <div className="space-y-2">
                      {unservedMap[table.id] && (
                        <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium flex items-center gap-2">
                          ⚠️ Unserved orders pending — settle only after all items are served or cancelled.
                        </div>
                      )}
                      {(tableOrdersMap[table.id] || 0) === 0 && (
                        <div className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-500 text-xs font-medium flex items-center gap-2">
                          ℹ️ No orders placed yet — bill cannot be settled.
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSettlingId(table.id);
                          setPendingBillId(crypto.randomUUID());
                        }}
                        disabled={(tableOrdersMap[table.id] || 0) === 0}
                        className="w-full py-3 rounded-xl text-sm font-bold text-amber-900 bg-amber-100/50 hover:bg-amber-200/50 border border-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Receipt className="h-4 w-4" /> Start Settlement
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recently Settled */}
      {localRecentBills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Recently Settled
          </h3>
          <div className="space-y-2">
            {localRecentBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">
                      Table {bill.restaurant_tables?.table_number || "?"}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-200 px-1.5 py-0.5 rounded-md font-mono">
                      #{bill.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(bill.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-full">
                    {bill.payment_mode}
                  </span>
                  <span className="font-bold text-neutral-900">
                    ${Number(bill.total_amount).toLocaleString("en-US")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const foodCharges = Number(bill.food_charges) || 0;
                    const discount = Number(bill.discount_amount) || 0;
                    const gstAmount = Number(bill.gst_amount) || 0;
                    const taxableBase = foodCharges - discount;
                    const gstPercent =
                      taxableBase > 0
                        ? Math.round((gstAmount / taxableBase) * 10000) / 100
                        : 0;
                    printRestaurantBill({
                      tableNumber: bill.restaurant_tables?.table_number || 0,
                      billId: bill.id.slice(0, 8).toUpperCase(),
                      items: bill.items || [],
                      foodCharges,
                      discount,
                      gstAmount,
                      gstPercent,
                      totalAmount: Number(bill.total_amount),
                      paymentMode: bill.payment_mode,
                    });
                  }}
                  className="p-1.5 rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  title="Print Bill"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
