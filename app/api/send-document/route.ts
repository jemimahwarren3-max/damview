import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getResendClient, EMAIL_FROM } from "@/lib/email/resend";
import { renderInvoicePdfBytes, type InvoiceData } from "@/lib/pdf/invoice";

interface SendDocumentBody {
  to: string;
  invoice: InvoiceData;
}

const DOC_SUBJECTS: Record<InvoiceData["documentType"], string> = {
  Quotation: "Your quotation from Damview Resort",
  Invoice: "Your invoice from Damview Resort",
  Receipt: "Your receipt from Damview Resort",
};

export async function POST(request: Request) {
  // Only signed-in staff may trigger an email send.
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SendDocumentBody>;
  if (!body.to || !body.invoice) {
    return NextResponse.json({ error: "Missing recipient or document data." }, { status: 400 });
  }

  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json({ error: "Email isn't configured yet (RESEND_API_KEY missing)." }, { status: 503 });
  }

  const pdfBytes = renderInvoicePdfBytes(body.invoice);
  const filename = `${body.invoice.documentType.toLowerCase()}-${body.invoice.documentNumber}.pdf`;

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: body.to,
    subject: DOC_SUBJECTS[body.invoice.documentType],
    text: `Hi ${body.invoice.customerName},\n\nPlease find your ${body.invoice.documentType.toLowerCase()} from Damview Resort attached.\n\nThank you,\nDamview Resort`,
    attachments: [{ filename, content: Buffer.from(pdfBytes) }],
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send email." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
