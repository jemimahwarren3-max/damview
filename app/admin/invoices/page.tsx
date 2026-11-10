"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormField } from "@/components/shared/FormField";
import { generateInvoicePdf } from "@/lib/pdf/invoice";
import { ECOCASH } from "@/lib/constants";

const PAYMENT_METHODS = ["Cash", "EcoCash", "Bank Transfer"] as const;

const SAMPLE_INVOICES = [
  { number: "DV-Q-0001", customer: "Chiedza Events Co.", type: "Quotation" as const, total: 850 },
  { number: "DV-INV-0014", customer: "Tendai Moyo", type: "Invoice" as const, total: 35 },
  { number: "0004", customer: "Seke High School", type: "Receipt" as const, total: 900 },
];

export default function AdminInvoicesPage() {
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("Cash");
  const [receivedBy, setReceivedBy] = useState("");

  const handleDownload = (invoice: (typeof SAMPLE_INVOICES)[number]) => {
    generateInvoicePdf({
      documentType: invoice.type,
      documentNumber: invoice.number,
      customerName: invoice.customer,
      issueDate: new Date().toISOString().slice(0, 10),
      items: [{ description: "Sample service line item", quantity: 1, unitPrice: invoice.total }],
      amountPaid: invoice.type === "Receipt" ? invoice.total : invoice.type === "Invoice" ? invoice.total : 0,
      paymentMethod: invoice.type === "Receipt" ? "Cash" : undefined,
      receivedBy: invoice.type === "Receipt" ? "Panashe Mumba" : undefined,
    });
  };

  const onCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(amount);
    if (!customerName || !description || !total) return;

    generateInvoicePdf({
      documentType: "Receipt",
      documentNumber: String(Date.now()).slice(-6),
      customerName,
      issueDate: new Date().toISOString().slice(0, 10),
      items: [{ description, quantity: 1, unitPrice: total }],
      amountPaid: total,
      paymentMethod,
      receivedBy: receivedBy || undefined,
    });

    setCustomerName("");
    setDescription("");
    setAmount("");
    setReceivedBy("");
  };

  return (
    <AdminShell title="Invoices">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Receipts you create below download as a real branded PDF. This page doesn&apos;t keep a
        record of past receipts yet (no Supabase table for documents is wired up) — download and
        file each one as you go.
      </div>

      <form onSubmit={onCreateReceipt} className="mb-10 flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
        <h2 className="font-serif text-lg text-dv-forest">Create a receipt</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Customer name" name="customerName">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
              required
            />
          </FormField>
          <FormField label="What for" name="description">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Poolside Rooms, 1 night"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
              required
            />
          </FormField>
          <FormField label="Amount ($)" name="amount">
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
              required
            />
          </FormField>
          <FormField label="Payment method" name="paymentMethod">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as (typeof PAYMENT_METHODS)[number])}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Received by (optional)" name="receivedBy">
            <input
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
            />
          </FormField>
        </div>

        {paymentMethod === "EcoCash" && (
          <div className="rounded-lg border border-dv-pool/30 bg-dv-pool/10 px-4 py-3 text-sm text-dv-black">
            EcoCash line: <span className="font-semibold">{ECOCASH.line}</span> &middot; dial{" "}
            <span className="font-semibold">{ECOCASH.dialCode}</span> to confirm the guest&apos;s payment
            before issuing this receipt.
          </div>
        )}

        <button
          type="submit"
          className="flex w-fit items-center gap-2 rounded-full bg-dv-forest px-5 py-2.5 text-sm font-bold text-dv-ivory hover:bg-dv-leaf"
        >
          <Download size={15} /> Generate &amp; download receipt
        </button>
      </form>

      <h2 className="mb-3 font-serif text-lg text-dv-forest">Examples</h2>
      <div className="flex flex-col gap-3">
        {SAMPLE_INVOICES.map((invoice) => (
          <div
            key={invoice.number}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5"
          >
            <div>
              <p className="font-medium text-dv-black">{invoice.customer}</p>
              <p className="text-sm text-muted-foreground">
                {invoice.type} {invoice.number} &middot; ${invoice.total.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDownload(invoice)}
              className="inline-flex items-center gap-2 rounded-full bg-dv-forest px-4 py-2.5 text-xs font-bold text-dv-ivory hover:bg-dv-leaf"
            >
              <Download size={15} /> PDF
            </button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
