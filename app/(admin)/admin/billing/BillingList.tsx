"use client";

import { useState } from "react";
import { differenceInDays, startOfDay } from "date-fns";
import { processCheckout } from "@/lib/actions/billing";
import {
  Plus,
  X,
  FileDown,
  Receipt,
  Printer,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { printFinalBill } from "@/lib/printing";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export default function BillingList({
  activeGuests,
  ordersMap,
  unservedMap = {},
}: {
  activeGuests: any[];
  ordersMap: Record<string, number>;
  unservedMap?: Record<string, boolean>;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const [extraExpenses, setExtraExpenses] = useState<
    Record<string, { name: string; amount: number }[]>
  >({});
  const [newExpenseNames, setNewExpenseNames] = useState<
    Record<string, string>
  >({});
  const [newExpenseAmounts, setNewExpenseAmounts] = useState<
    Record<string, string>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm } = useConfirm();

  const handleDiscountChange = (guestId: string, value: string) => {
    setDiscounts((prev) => ({ ...prev, [guestId]: value }));
  };

  const handleAddExpense = (guestId: string) => {
    const name = newExpenseNames[guestId]?.trim();
    const amountStr = newExpenseAmounts[guestId];
    const amount = parseFloat(amountStr);
    if (!name || isNaN(amount) || amount <= 0) return;
    setExtraExpenses((prev) => ({
      ...prev,
      [guestId]: [...(prev[guestId] || []), { name, amount }],
    }));
    setNewExpenseNames((prev) => ({ ...prev, [guestId]: "" }));
    setNewExpenseAmounts((prev) => ({ ...prev, [guestId]: "" }));
  };

  const handleRemoveExpense = (guestId: string, index: number) => {
    setExtraExpenses((prev) => ({
      ...prev,
      [guestId]: (prev[guestId] || []).filter((_, i) => i !== index),
    }));
  };

  const generatePdf = async (
    guest: any,
    roomCharges: number,
    foodCharges: number,
    extraChargesDetails: { name: string; amount: number }[],
    discountAmount: number,
    subTotal: number,
    gstAmount: number,
    totalAmount: number,
    paymentMode: string,
    isPreliminary: boolean = false,
  ) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(isPreliminary ? "PRELIMINARY INVOICE" : "HOTEL INVOICE", 105, 20, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(`Guest ID: ${guest.guest_code || "N/A"}`, 20, 40);
    doc.text(`Guest Name: ${guest.name}`, 20, 50);
    doc.text(`Room Number: ${guest.rooms?.room_number}`, 20, 60);
    doc.line(20, 65, 190, 65);
    doc.text("Description", 20, 75);
    doc.text("Amount (USD)", 150, 75);
    doc.line(20, 80, 190, 80);
    let currY = 90;
    const daysStayed = Math.max(
      1,
      differenceInDays(
        startOfDay(new Date()),
        startOfDay(new Date(guest.check_in)),
      ),
    );
    doc.text(
      `Room Charges (${daysStayed} days @ ${guest.rate}/day)`,
      20,
      currY,
    );
    doc.text(roomCharges.toFixed(2), 150, currY);
    currY += 10;
    doc.text("Food & Beverage Charges", 20, currY);
    doc.text(foodCharges.toFixed(2), 150, currY);
    currY += 10;
    if (extraChargesDetails.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Extra Expenses", 20, currY);
      doc.setFont("helvetica", "normal");
      currY += 10;
      extraChargesDetails.forEach((expense) => {
        doc.text(` - ${expense.name}`, 20, currY);
        doc.text(expense.amount.toFixed(2), 150, currY);
        currY += 10;
      });
    }
    if (discountAmount > 0) {
      doc.text("Discount Applied", 20, currY);
      doc.text(`-${discountAmount.toFixed(2)}`, 150, currY);
      currY += 10;
    }
    doc.line(20, currY, 190, currY);
    currY += 10;
    doc.text(`Subtotal`, 100, currY);
    doc.text(subTotal.toFixed(2), 150, currY);
    currY += 10;
    
    doc.text(`VAT (${guest.gst_percent}%)`, 100, currY);
    doc.text(gstAmount.toFixed(2), 150, currY);
    currY += 5;
    
    doc.line(100, currY, 190, currY);
    currY += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount`, 100, currY);
    doc.text(`$${totalAmount.toFixed(2)}`, 150, currY);
    
    doc.save(
      `${isPreliminary ? "preliminary_" : ""}invoice_room_${guest.rooms?.room_number}_${guest.name.replace(/ /g, "_")}.pdf`,
    );
  };

  const calculateAmounts = (guest: any, foodCharges: number) => {
    const daysStayed = Math.max(
      1,
      differenceInDays(
        startOfDay(new Date()),
        startOfDay(new Date(guest.check_in)),
      ),
    );
    const roomCharges = daysStayed * guest.rate;
    const discountAmount = parseFloat(discounts[guest.id] || "0") || 0;
    const guestExtraExpenses = extraExpenses[guest.id] || [];
    const extraChargesAmount = guestExtraExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );
    const subTotal = Math.max(
      0,
      roomCharges + foodCharges + extraChargesAmount - discountAmount,
    );
    const gstAmount = (subTotal * guest.gst_percent) / 100;
    const totalAmount = subTotal + gstAmount;
    const paymentMode = "Cash";
    return {
      roomCharges,
      discountAmount,
      extraChargesAmount,
      extraChargesDetails: guestExtraExpenses,
      subTotal,
      gstAmount,
      totalAmount,
      paymentMode,
    };
  };

  const downloadPreliminary = (guest: any, foodCharges: number) => {
    const {
      roomCharges,
      discountAmount,
      extraChargesDetails,
      subTotal,
      gstAmount,
      totalAmount,
      paymentMode,
    } = calculateAmounts(guest, foodCharges);
    generatePdf(
      guest,
      roomCharges,
      foodCharges,
      extraChargesDetails,
      discountAmount,
      subTotal,
      gstAmount,
      totalAmount,
      paymentMode,
      true,
    );
  };

  const handleCheckout = async (guest: any, foodCharges: number) => {
    if (unservedMap[guest.room_id]) {
      toast.error("Cannot checkout. Pending food orders must be served or cancelled first.");
      return;
    }

    const confirmed = await confirm({
      title: "Confirm Final Checkout",
      message: `Process FINAL checkout for ${guest.name} (Room ${guest.rooms?.room_number})? This will generate the invoice and free the room.`,
      confirmText: "Process Checkout",
      variant: "warning",
    });
    if (!confirmed) return;
    setLoadingId(guest.id);
    const {
      roomCharges,
      discountAmount,
      extraChargesAmount,
      extraChargesDetails,
      subTotal,
      gstAmount,
      totalAmount,
      paymentMode,
    } = calculateAmounts(guest, foodCharges);
    const { error } = await processCheckout(
      guest.id,
      guest.room_id,
      roomCharges,
      foodCharges,
      discountAmount,
      extraChargesAmount,
      extraChargesDetails,
      gstAmount,
      totalAmount,
      paymentMode,
    );
    if (error) {
      toast.error("Checkout failed: " + error);
      setLoadingId(null);
      return;
    }
    generatePdf(
      guest,
      roomCharges,
      foodCharges,
      extraChargesDetails,
      discountAmount,
      subTotal,
      gstAmount,
      totalAmount,
      paymentMode,
      false,
    );
    toast.success("Checkout successful! Invoice downloaded.");
    setLoadingId(null);
  };

  if (activeGuests.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-20 h-20 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto mb-5">
          <Receipt className="h-10 w-10 text-neutral-300" />
        </div>
        <p className="text-neutral-500 font-semibold text-lg">No active bills</p>
        <p className="text-neutral-500 text-sm mt-1">
          Check in a guest to generate a bill.
        </p>
      </div>
    );
  }


  const filteredGuests = activeGuests.filter((guest) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const roomNum = String(guest.rooms?.room_number || "");
    const guestName = (guest.name || "").toLowerCase();
    const guestCode = ((guest as any).guest_code || "").toLowerCase();
    return (
      roomNum.includes(q) || guestName.includes(q) || guestCode.includes(q)
    );
  });

  return (
    <div className="space-y-4 mt-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by room number, guest name, or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-400 transition-all text-neutral-900 placeholder:text-neutral-400 font-medium shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {filteredGuests.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-neutral-300" />
          </div>
          <p className="text-neutral-500 font-semibold">No matching bills</p>
          <p className="text-neutral-400 text-sm mt-1">
            Try a different room number or name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {filteredGuests.map((guest) => {
            const daysStayed = Math.max(
              1,
              differenceInDays(
                startOfDay(new Date()),
                startOfDay(new Date(guest.check_in)),
              ),
            );
            const roomCharges = daysStayed * guest.rate;
            const foodCharges = ordersMap[guest.room_id] || 0;
            const discountAmount = parseFloat(discounts[guest.id] || "0") || 0;
            const guestExtraExpenses = extraExpenses[guest.id] || [];
            const extraChargesAmount = guestExtraExpenses.reduce(
              (sum, exp) => sum + exp.amount,
              0,
            );
            const rawTotal = roomCharges + foodCharges + extraChargesAmount;
            const subTotal = Math.max(0, rawTotal - discountAmount);
            const gstAmount = (subTotal * guest.gst_percent) / 100;
            const totalAmount = subTotal + gstAmount;

            return (
              <div
                key={guest.id}
                className="glass-card overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="bg-neutral-50 border border-neutral-200 p-4 text-neutral-900 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        Room {guest.rooms?.room_number}
                      </h3>
                      {guest.guest_code && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-lg">
                          {guest.guest_code}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-neutral-200 text-neutral-600 px-2.5 py-1 rounded-lg capitalize">
                      {guest.rooms?.type}
                    </span>
                  </div>
                  <p className="text-neutral-500 font-medium text-sm">
                    {guest.name} • {daysStayed}{" "}
                    {daysStayed === 1 ? "night" : "nights"}
                  </p>
                </div>

                <div className="p-5 flex-1 space-y-4">
                  {/* Charges breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-300">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Room
                      </p>
                      <p className="text-lg font-semibold text-neutral-900">
                        ${roomCharges.toLocaleString('en-US')}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {daysStayed}d × ${guest.rate}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                        Food
                      </p>
                      <p className="text-lg font-semibold text-amber-700">
                        ${foodCharges.toLocaleString('en-US')}
                      </p>
                      <p className="text-[10px] text-amber-400">Orders total</p>
                    </div>
                  </div>

                  {/* Extra Expenses */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                        Extras
                      </label>
                      {extraChargesAmount > 0 && (
                        <span className="text-xs font-bold text-emerald-600">
                          +${extraChargesAmount}
                        </span>
                      )}
                    </div>
                    {guestExtraExpenses.length > 0 && (
                      <div className="space-y-1">
                        {guestExtraExpenses.map((exp, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-lg text-sm"
                          >
                            <span className="text-neutral-700 font-medium">
                              {exp.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900">
                                ${exp.amount}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveExpense(guest.id, idx)
                                }
                                className="text-neutral-500 hover:text-rose-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newExpenseNames[guest.id] || ""}
                        onChange={(e) =>
                          setNewExpenseNames((prev) => ({
                            ...prev,
                            [guest.id]: e.target.value,
                          }))
                        }
                        placeholder="Item name"
                        className="premium-input"
                        style={{
                          padding: "0.4rem 0.75rem",
                          fontSize: "0.8rem",
                          flex: "1",
                          minWidth: 0,
                        }}
                      />
                      <input
                        type="number"
                        min="0"
                        value={newExpenseAmounts[guest.id] || ""}
                        onChange={(e) =>
                          setNewExpenseAmounts((prev) => ({
                            ...prev,
                            [guest.id]: e.target.value,
                          }))
                        }
                        placeholder="$ 0"
                        className="premium-input"
                        style={{
                          padding: "0.4rem 0.75rem",
                          fontSize: "0.8rem",
                          width: "5rem",
                          flex: "none",
                        }}
                      />
                      <button
                        onClick={() => handleAddExpense(guest.id)}
                        disabled={
                          !newExpenseNames[guest.id] ||
                          !newExpenseAmounts[guest.id]
                        }
                        className="p-1.5 rounded-xl bg-neutral-50 text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition-colors disabled:opacity-40"
                        style={{ flexShrink: 0 }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5 block">
                      Discount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={rawTotal}
                        value={discounts[guest.id] || ""}
                        onChange={(e) =>
                          handleDiscountChange(guest.id, e.target.value)
                        }
                        placeholder="0"
                        className="premium-input"
                        style={{
                          paddingLeft: "1.75rem",
                          paddingTop: "0.4rem",
                          paddingBottom: "0.4rem",
                        }}
                      />
                    </div>
                  </div>


                  {/* Totals */}
                  <div className="bg-neutral-50 rounded-xl p-3 space-y-1.5 border border-neutral-100">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Subtotal</span>
                      <span>${subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Tax ({guest.gst_percent}%)</span>
                      <span>${gstAmount.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-xs text-rose-500">
                        <span>Discount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold text-neutral-900 pt-1.5 border-t border-neutral-200">
                      <span>Total Due</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-neutral-200/50 space-y-2 bg-white/50">
                  {unservedMap[guest.room_id] && (
                    <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium flex items-center gap-2">
                      ⚠️ Unserved food orders pending — checkout only after all orders are served or cancelled.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => downloadPreliminary(guest, foodCharges)}
                      disabled={loadingId === guest.id}
                      className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 hover:bg-neutral-100 transition-all disabled:opacity-50"
                    >
                      <FileDown className="h-3.5 w-3.5" /> Download
                    </button>
                    <button
                      onClick={() => {
                        const calc = calculateAmounts(guest, foodCharges);
                        printFinalBill({
                          customerName: guest.name,
                          guestCode: guest.guest_code || "N/A",
                          roomNumber: guest.rooms?.room_number || 0,
                          checkIn: guest.check_in,
                          items: [],
                          roomCharges: calc.roomCharges,
                          foodCharges: foodCharges,
                          extraCharges: calc.extraChargesAmount,
                          extraChargesDetails: calc.extraChargesDetails,
                          discount: calc.discountAmount,
                          gstAmount: calc.gstAmount,
                          gstPercent: guest.gst_percent,
                          totalAmount: calc.totalAmount,
                          paymentMode: calc.paymentMode,
                        });
                      }}
                      disabled={loadingId === guest.id}
                      className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-all disabled:opacity-50"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print Bill
                    </button>
                  </div>
                  <button
                    onClick={() => handleCheckout(guest, foodCharges)}
                    disabled={loadingId === guest.id}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 shadow-sm"
                    style={{
                      background: "#10b981",
                    }}
                  >
                    {loadingId === guest.id
                      ? "Processing..."
                      : "✓ Final Checkout"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

