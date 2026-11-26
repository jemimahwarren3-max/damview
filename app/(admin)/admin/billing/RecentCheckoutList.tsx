"use client";
import { useState } from "react";
import { differenceInDays, startOfDay } from "date-fns";
import { FileDown, Printer, Receipt, Plus, Undo2 } from "lucide-react";
import { printFinalBill } from "@/lib/printing";
import { processRefund, recordAdditionalPayment } from "@/lib/actions/extensions";
import toast from "react-hot-toast";

const PAYMENT_MODES = ["Cash", "EcoCash", "Bank Transfer"] as const;

export default function RecentCheckoutList({ guests }: { guests: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [action, setAction] = useState<"refund" | "payment" | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [payMode, setPayMode] = useState<string>("Cash");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setExpandedId(null);
    setAction(null);
    setAmount("");
    setReason("");
    setPayMode("Cash");
  };

  const openAction = (billId: string, type: "refund" | "payment") => {
    setExpandedId(billId);
    setAction(type);
    setAmount("");
    setReason("");
  };

  const handleSubmit = async (billId: string) => {
    const val = parseFloat(amount);
    if (!val || val <= 0) { toast.error("Enter a valid amount."); return; }
    setLoading(true);
    try {
      if (action === "refund") {
        if (!reason.trim()) { toast.error("Refund reason is required."); setLoading(false); return; }
        const res = await processRefund(billId, val, reason);
        if (res.error) toast.error(res.error);
        else toast.success("Refund processed.");
      } else {
        const res = await recordAdditionalPayment(billId, val, payMode);
        if (res.error) toast.error(res.error);
        else toast.success("Payment recorded.");
      }
      resetForm();
    } catch { toast.error("Something went wrong."); }
    setLoading(false);
  };
  const generatePdf = async (guest: any) => {
    const bill = Array.isArray(guest.bills) ? guest.bills[0] : guest.bills;
    if (!bill) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("HOTEL INVOICE (REPRINT)", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Guest ID: ${guest.guest_code || "N/A"}`, 20, 40);
    doc.text(`Guest Name: ${guest.name}`, 20, 50);
    doc.text(`Room Number: ${guest.rooms?.room_number}`, 20, 60);
    doc.text(
      `Check-in: ${new Date(guest.check_in).toLocaleString("en-US")}`,
      20,
      70,
    );
    doc.text(
      `Check-out: ${guest.check_out ? new Date(guest.check_out).toLocaleString("en-US") : "N/A"}`,
      20,
      80,
    );
    doc.line(20, 85, 190, 85);
    doc.text("Description", 20, 95);
    doc.text("Amount (USD)", 150, 95);
    doc.line(20, 100, 190, 100);
    let currY = 110;
    doc.text(`Room Charges`, 20, currY);
    doc.text(Number(bill.room_charges).toFixed(2), 150, currY);
    currY += 10;
    doc.text("Food & Beverage Charges", 20, currY);
    doc.text(Number(bill.food_charges).toFixed(2), 150, currY);
    currY += 10;
    if (bill.extra_charges > 0) {
      if (
        bill.extra_charges_details &&
        Array.isArray(bill.extra_charges_details)
      ) {
        doc.setFont("helvetica", "bold");
        doc.text("Extra Expenses", 20, currY);
        doc.setFont("helvetica", "normal");
        currY += 10;
        bill.extra_charges_details.forEach((exp: any) => {
          doc.text(` - ${exp.name}`, 20, currY);
          doc.text(exp.amount.toFixed(2), 150, currY);
          currY += 10;
        });
      } else {
        doc.text("Extra Charges", 20, currY);
        doc.text(Number(bill.extra_charges).toFixed(2), 150, currY);
        currY += 10;
      }
    }
    if (bill.discount_amount > 0) {
      doc.text("Discount Applied", 20, currY);
      doc.text(`-${Number(bill.discount_amount).toFixed(2)}`, 150, currY);
      currY += 10;
    }
    doc.line(20, currY, 190, currY);
    currY += 10;
    const subTotal = Number(bill.total_amount) - Number(bill.gst_amount);
    doc.text(`Subtotal`, 100, currY);
    doc.text(subTotal.toFixed(2), 150, currY);
    currY += 10;
    doc.text(`Tax`, 100, currY);
    doc.text(Number(bill.gst_amount).toFixed(2), 150, currY);
    currY += 5;
    doc.line(100, currY, 190, currY);
    currY += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount`, 100, currY);
    doc.text(`$${Number(bill.total_amount).toFixed(2)}`, 150, currY);
    currY += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Mode: ${bill.payment_mode || "N/A"}`, 20, currY);
    doc.save(
      `reprint_invoice_room_${guest.rooms?.room_number}_${guest.name.replace(/ /g, "_")}.pdf`,
    );
  };

  const handlePrint = (guest: any) => {
    const bill = Array.isArray(guest.bills) ? guest.bills[0] : guest.bills;
    if (!bill) return;

    printFinalBill({
      billId: bill.id.slice(0, 8).toUpperCase(),
      customerName: guest.name,
      guestCode: guest.guest_code || "N/A",
      roomNumber: guest.rooms?.room_number || 0,
      checkIn: guest.check_in,
      items: [],
      roomCharges: Number(bill.room_charges),
      foodCharges: Number(bill.food_charges),
      extraCharges: Number(bill.extra_charges || 0),
      extraChargesDetails: bill.extra_charges_details || [],
      discount: Number(bill.discount_amount || 0),
      gstAmount: Number(bill.gst_amount),
      gstPercent: 0,
      totalAmount: Number(bill.total_amount),
      paymentMode: bill.payment_mode || "Cash",
    });
  };

  const getTimeRemaining = (checkOut: string) => {
    const expiresAt = new Date(checkOut).getTime() + 24 * 60 * 60 * 1000;
    const remainingMs = expiresAt - Date.now();
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {guests.map((guest) => {
        const bill = Array.isArray(guest.bills) ? guest.bills[0] : guest.bills;
        if (!bill) return null;

        return (
          <div
            key={guest.id}
            className="glass-card overflow-hidden border-amber-200/50"
          >
            <div className="bg-amber-50 border-b border-amber-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-neutral-900">
                    Room {guest.rooms?.room_number}
                  </h3>
                  {guest.guest_code && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-700 px-2 py-0.5 rounded-lg">
                      {guest.guest_code}
                    </span>
                  )}
                </div>
                {bill.payment_status === "partial" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold uppercase">
                    Partial
                  </span>
                ) : bill.payment_status === "pending" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase">
                    Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase">
                    Paid
                  </span>
                )}
              </div>
              <p className="text-neutral-600 font-medium text-sm">{guest.name}</p>
              <p className="text-[10px] text-amber-600 font-bold mt-1">
                {getTimeRemaining(guest.check_out)}
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-neutral-50 rounded-xl p-3 space-y-1 border border-neutral-100">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Room</span>
                  <span>
                    ${Number(bill.room_charges).toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Food</span>
                  <span>
                    ${Number(bill.food_charges).toLocaleString("en-US")}
                  </span>
                </div>
                {bill.extra_charges > 0 && (
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Extras</span>
                    <span>
                      ${Number(bill.extra_charges).toLocaleString("en-US")}
                    </span>
                  </div>
                )}
                {bill.discount_amount > 0 && (
                  <div className="flex justify-between text-xs text-rose-500">
                    <span>Discount</span>
                    <span>
                      -${Number(bill.discount_amount).toLocaleString("en-US")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-1 border-t border-neutral-200">
                  <span>Total</span>
                  <span>
                    ${Number(bill.total_amount).toLocaleString("en-US")}
                  </span>
                </div>
                {bill.amount_paid != null && (
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Paid</span>
                    <span>${Number(bill.amount_paid).toLocaleString("en-US")}</span>
                  </div>
                )}
                {Number(bill.outstanding_balance || 0) > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-amber-600">
                    <span>Outstanding</span>
                    <span>${Number(bill.outstanding_balance).toLocaleString("en-US")}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => generatePdf(guest)}
                  className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-300 hover:bg-neutral-100 transition-all"
                >
                  <FileDown className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  onClick={() => handlePrint(guest)}
                  className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-all"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Bill
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Number(bill.outstanding_balance || 0) > 0 && (
                  <button
                    onClick={() => openAction(bill.id, "payment")}
                    className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Payment
                  </button>
                )}
                <button
                  onClick={() => openAction(bill.id, "refund")}
                  className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all"
                >
                  <Undo2 className="h-3.5 w-3.5" /> Refund
                </button>
              </div>

              {expandedId === bill.id && action && (
                <div className="bg-neutral-50 rounded-xl p-3 space-y-2 border border-neutral-200">
                  <p className="text-xs font-bold text-neutral-700 uppercase">
                    {action === "refund" ? "Process Refund" : "Record Payment"}
                  </p>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Amount (USD)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                  {action === "refund" && (
                    <input
                      type="text"
                      placeholder="Reason for refund"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    />
                  )}
                  {action === "payment" && (
                    <select
                      value={payMode}
                      onChange={(e) => setPayMode(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    >
                      {PAYMENT_MODES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmit(bill.id)}
                      disabled={loading}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50 ${
                        action === "refund" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {loading ? "Processing..." : "Confirm"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
