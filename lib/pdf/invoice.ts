import jsPDF from "jspdf";
import { SITE_NAME, LOCATION, CONTACT_NUMBERS } from "@/lib/constants";
import { amountToWords } from "./numberToWords";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  documentType: "Quotation" | "Invoice" | "Receipt";
  documentNumber: string;
  customerName: string;
  issueDate: string;
  items: InvoiceLineItem[];
  amountPaid: number;
  /** Receipt only — e.g. "Cash", "EcoCash", "Bank Transfer". */
  paymentMethod?: string;
  /** Receipt only — staff member who received payment. */
  receivedBy?: string;
}

const FOREST = [23, 61, 43] as const;
const GOLD = [229, 160, 91] as const;

/** Builds the PDF document itself - safe to call from the browser or a server Route Handler. */
export function buildInvoiceDoc(data: InvoiceData): jsPDF {
  const doc = new jsPDF();
  const marginX = 20;
  let y = 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...FOREST);
  doc.text("DAMVIEW RESORT", marginX, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(LOCATION, marginX, y);
  y += 5;
  doc.text(`WhatsApp: 077 444 ${CONTACT_NUMBERS.primary.slice(-4)} / 077 444 ${CONTACT_NUMBERS.secondary.slice(-4)}`, marginX, y);

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...GOLD);
  doc.text(data.documentType === "Receipt" ? "CASH RECEIPT" : data.documentType.toUpperCase(), marginX, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`${data.documentType} #: ${data.documentNumber}`, marginX, y);
  doc.text(`Date: ${data.issueDate}`, 140, y);
  y += 6;
  doc.text(`${data.documentType === "Receipt" ? "Received From" : "Client"}: ${data.customerName}`, marginX, y);

  y += 10;
  doc.setFillColor(...FOREST);
  doc.rect(marginX, y, 170, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Description", marginX + 3, y + 5.5);
  doc.text("Qty", 130, y + 5.5);
  doc.text("Unit", 148, y + 5.5);
  doc.text("Total", 170, y + 5.5);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  let subtotal = 0;
  for (const item of data.items) {
    const lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
    doc.text(item.description, marginX + 3, y + 6);
    doc.text(String(item.quantity), 130, y + 6);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 148, y + 6);
    doc.text(`$${lineTotal.toFixed(2)}`, 170, y + 6);
    y += 8;
  }

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, y, 190, y);
  y += 8;

  const balance = subtotal - data.amountPaid;

  if (data.documentType === "Receipt") {
    doc.setFont("helvetica", "normal");
    doc.text("Total Amount Due", marginX, y);
    doc.text(`$${subtotal.toFixed(2)}`, 170, y);
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Cash Received", marginX, y);
    doc.text(`$${data.amountPaid.toFixed(2)}`, 170, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...FOREST);
    doc.text("Balance", marginX, y);
    doc.text(`$${balance.toFixed(2)}`, 170, y);
    doc.setTextColor(40, 40, 40);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Amount Received in Words:", marginX, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(amountToWords(data.amountPaid), marginX, y, { maxWidth: 170 });

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Payment Method: ", marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.paymentMethod ?? "Cash", marginX + 36, y);

    y += 9;
    doc.setFont("helvetica", "bold");
    doc.text("Received By: ", marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.receivedBy ?? "-", marginX + 28, y);

    y += 18;
    doc.setFont("helvetica", "italic");
    doc.text("Damview Resort - Thank you for your business.", marginX, y);
  } else {
    doc.setFont("helvetica", "bold");
    doc.text("Total", 148, y);
    doc.text(`$${subtotal.toFixed(2)}`, 170, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text("Amount paid", 148, y);
    doc.text(`$${data.amountPaid.toFixed(2)}`, 170, y);
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...FOREST);
    doc.text("Balance", 148, y);
    doc.text(`$${balance.toFixed(2)}`, 170, y);
  }

  y += 16;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(`${SITE_NAME} - generated document`, marginX, y);

  return doc;
}

/** Browser only - builds the document and triggers a download. */
export function generateInvoicePdf(data: InvoiceData) {
  const doc = buildInvoiceDoc(data);
  doc.save(`${data.documentType.toLowerCase()}-${data.documentNumber}.pdf`);
}

/** Server-safe - builds the document and returns its raw bytes, e.g. to attach to an email. */
export function renderInvoicePdfBytes(data: InvoiceData): Uint8Array {
  const doc = buildInvoiceDoc(data);
  return new Uint8Array(doc.output("arraybuffer"));
}
