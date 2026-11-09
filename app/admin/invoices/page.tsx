"use client";

import { Download } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { generateInvoicePdf } from "@/lib/pdf/invoice";

const SAMPLE_INVOICES = [
  { number: "DV-Q-0001", customer: "Chiedza Events Co.", type: "Quotation" as const, total: 850 },
  { number: "DV-INV-0014", customer: "Tendai Moyo", type: "Invoice" as const, total: 35 },
];

export default function AdminInvoicesPage() {
  const handleDownload = (invoice: (typeof SAMPLE_INVOICES)[number]) => {
    generateInvoicePdf({
      documentType: invoice.type,
      documentNumber: invoice.number,
      customerName: invoice.customer,
      issueDate: new Date().toISOString().slice(0, 10),
      items: [{ description: "Sample service line item", quantity: 1, unitPrice: invoice.total }],
      amountPaid: invoice.type === "Invoice" ? invoice.total : 0,
    });
  };

  return (
    <AdminShell title="Invoices">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Sample documents — real invoice records and numbering will come with the backend (Stage 10). The
        PDF generation itself is real and working now.
      </div>

      <div className="flex flex-col gap-3">
        {SAMPLE_INVOICES.map((invoice) => (
          <div
            key={invoice.number}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5"
          >
            <div>
              <p className="font-medium text-dv-black">{invoice.customer}</p>
              <p className="text-sm text-muted-foreground">
                {invoice.type} {invoice.number} · ${invoice.total.toFixed(2)}
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
