import jsPDF from "jspdf";
import { SITE_NAME, LOCATION, CONTACT_NUMBERS } from "@/lib/constants";

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
}

const FOREST = [23, 61, 43] as const;
const GOLD = [229, 160, 91] as const;

export function generateInvoicePdf(data: InvoiceData) {
  const doc = new jsPDF();
  const marginX = 20;
  let y = 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...FOREST);
  doc.text("DAM VIEW RESORT", marginX, y);
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
  doc.text(data.documentType.toUpperCase(), marginX, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`${data.documentType} #: ${data.documentNumber}`, marginX, y);
  doc.text(`Date: ${data.issueDate}`, 140, y);
  y += 6;
  doc.text(`Customer: ${data.customerName}`, marginX, y);

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

  y += 16;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(`${SITE_NAME} — generated document, sample data`, marginX, y);

  doc.save(`${data.documentType.toLowerCase()}-${data.documentNumber}.pdf`);
}
