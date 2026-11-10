import type { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { InvoiceData } from "@/lib/pdf/invoice";

type SupabaseClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

const PREFIXES: Record<InvoiceData["documentType"], string> = {
  Quotation: "DV-Q-",
  Invoice: "DV-INV-",
  Receipt: "RCT-",
};

/** Next sequential number for a document type, e.g. "DV-INV-0007". */
async function nextDocumentNumber(supabase: SupabaseClient, documentType: InvoiceData["documentType"]): Promise<string> {
  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("document_type", documentType);
  const next = (count ?? 0) + 1;
  return `${PREFIXES[documentType]}${String(next).padStart(4, "0")}`;
}

/**
 * Creates a real document record (documents + document_line_items) and
 * returns the InvoiceData to render as a PDF - the one place document
 * numbers come from, so they're never reused.
 */
export async function recordDocument(
  supabase: SupabaseClient,
  params: {
    documentType: InvoiceData["documentType"];
    customerName: string;
    items: InvoiceData["items"];
    amountPaid: number;
    paymentMethod?: string;
    receivedBy?: string;
  }
): Promise<InvoiceData> {
  const documentNumber = await nextDocumentNumber(supabase, params.documentType);
  const issueDate = new Date().toISOString().slice(0, 10);

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      document_type: params.documentType,
      document_number: documentNumber,
      customer_name: params.customerName,
      issue_date: issueDate,
      amount_paid: params.amountPaid,
    })
    .select("id")
    .single();

  if (!error && doc) {
    await supabase.from("document_line_items").insert(
      params.items.map((item) => ({
        document_id: doc.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))
    );
  }

  return {
    documentType: params.documentType,
    documentNumber,
    customerName: params.customerName,
    issueDate,
    items: params.items,
    amountPaid: params.amountPaid,
    paymentMethod: params.paymentMethod,
    receivedBy: params.receivedBy,
  };
}
