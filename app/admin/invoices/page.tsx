"use client";

import { useState } from "react";
import { Download, Mail } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormField } from "@/components/shared/FormField";
import { generateInvoicePdf, type InvoiceData } from "@/lib/pdf/invoice";
import { ECOCASH } from "@/lib/constants";

const PAYMENT_METHODS = ["Cash", "EcoCash", "Bank Transfer"] as const;
const DOCUMENT_TYPES: InvoiceData["documentType"][] = ["Quotation", "Invoice", "Receipt"];

const SAMPLE_INVOICES = [
  { number: "DV-Q-0001", customer: "Chiedza Events Co.", type: "Quotation" as const, total: 850 },
  { number: "DV-INV-0014", customer: "Tendai Moyo", type: "Invoice" as const, total: 35 },
  { number: "0004", customer: "Seke High School", type: "Receipt" as const, total: 900 },
];

export default function AdminInvoicesPage() {
  const [documentType, setDocumentType] = useState<InvoiceData["documentType"]>("Receipt");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("Cash");
  const [receivedBy, setReceivedBy] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

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

  const buildCurrentInvoice = (): InvoiceData | null => {
    const total = Number(amount);
    if (!customerName || !description || !total) return null;
    return {
      documentType,
      documentNumber: String(Date.now()).slice(-6),
      customerName,
      issueDate: new Date().toISOString().slice(0, 10),
      items: [{ description, quantity: 1, unitPrice: total }],
      amountPaid: documentType === "Quotation" ? 0 : total,
      paymentMethod: documentType === "Receipt" ? paymentMethod : undefined,
      receivedBy: documentType === "Receipt" ? receivedBy || undefined : undefined,
    };
  };

  const onDownload = (e: React.FormEvent) => {
    e.preventDefault();
    const invoice = buildCurrentInvoice();
    if (!invoice) return;
    generateInvoicePdf(invoice);
  };

  const onEmail = async () => {
    const invoice = buildCurrentInvoice();
    if (!invoice || !customerEmail) return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/send-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: customerEmail, invoice }),
      });
      setEmailStatus(res.ok ? "sent" : "failed");
    } catch {
      setEmailStatus("failed");
    }
  };

  return (
    <AdminShell title="Invoices">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Documents you create below generate as a real branded PDF, downloadable or emailable. This
        page doesn&apos;t keep a record of past documents yet (no Supabase table for documents is
        wired up) &mdash; download and file each one as you go.
      </div>

      <form onSubmit={onDownload} className="mb-10 flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
        <h2 className="font-serif text-lg text-dv-forest">Create a document</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Document type" name="documentType">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as InvoiceData["documentType"])}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Customer name" name="customerName">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
              required
            />
          </FormField>
          <FormField label="Customer email (optional, to send by email)" name="customerEmail">
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
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
          {documentType === "Receipt" && (
            <>
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
            </>
          )}
        </div>

        {documentType === "Receipt" && paymentMethod === "EcoCash" && (
          <div className="rounded-lg border border-dv-pool/30 bg-dv-pool/10 px-4 py-3 text-sm text-dv-black">
            EcoCash line: <span className="font-semibold">{ECOCASH.line}</span> &middot; dial{" "}
            <span className="font-semibold">{ECOCASH.dialCode}</span> to confirm the guest&apos;s payment
            before issuing this receipt.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="flex w-fit items-center gap-2 rounded-full bg-dv-forest px-5 py-2.5 text-sm font-bold text-dv-ivory hover:bg-dv-leaf"
          >
            <Download size={15} /> Download PDF
          </button>
          <button
            type="button"
            onClick={onEmail}
            disabled={!customerEmail || emailStatus === "sending"}
            className="flex w-fit items-center gap-2 rounded-full border border-dv-pool px-5 py-2.5 text-sm font-bold text-dv-pool hover:bg-dv-pool/10 disabled:opacity-50"
          >
            <Mail size={15} /> {emailStatus === "sending" ? "Sending..." : "Email to customer"}
          </button>
          {emailStatus === "sent" && <span className="text-sm text-dv-leaf">Sent.</span>}
          {emailStatus === "failed" && <span className="text-sm text-destructive">Failed to send.</span>}
        </div>
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
