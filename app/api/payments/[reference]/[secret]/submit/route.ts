import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { detectFileType } from "@/lib/payments/validateFile";
import { hashAccessSecret } from "@/lib/payments/token";

const RESUBMITTABLE_STATUSES = ["AWAITING_PAYMENT", "REJECTED"];

export async function POST(request: Request, { params }: { params: Promise<{ reference: string; secret: string }> }) {
  const { reference, secret } = await params;
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
  }

  const { data: payment } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  if (payment.access_token_hash) {
    const providedHash = await hashAccessSecret(secret);
    if (providedHash !== payment.access_token_hash) {
      return NextResponse.json({ error: "This link is invalid or has been revoked." }, { status: 403 });
    }
  }

  if (payment.payment_status === "AWAITING_PAYMENT" && new Date(payment.payment_deadline) < new Date()) {
    await supabase.from("payment_submissions").update({ payment_status: "EXPIRED" }).eq("id", payment.id);
    return NextResponse.json(
      { error: "The payment deadline has passed. Please contact Damview Resort to continue." },
      { status: 410 }
    );
  }

  if (!RESUBMITTABLE_STATUSES.includes(payment.payment_status)) {
    return NextResponse.json(
      { error: "This payment already has a submission being reviewed and can't be resubmitted right now." },
      { status: 409 }
    );
  }

  const formData = await request.formData();
  const ecocashTransactionReference = String(formData.get("ecocashTransactionReference") ?? "").trim();
  const customerEcocashNumber = String(formData.get("customerEcocashNumber") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const amountClaimedRaw = String(formData.get("amountClaimed") ?? "").trim();
  const file = formData.get("file");

  if (!ecocashTransactionReference) {
    return NextResponse.json({ error: "Please enter the EcoCash transaction reference." }, { status: 400 });
  }
  if (!customerEcocashNumber) {
    return NextResponse.json({ error: "Please enter the EcoCash number used to pay." }, { status: 400 });
  }
  const amountClaimed = Number(amountClaimedRaw);
  if (!amountClaimedRaw || !Number.isFinite(amountClaimed) || amountClaimed <= 0) {
    return NextResponse.json({ error: "Please enter the amount you actually paid." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please attach your proof of payment." }, { status: 400 });
  }

  const { data: settings } = await supabase.from("payment_settings").select("upload_max_mb").eq("id", true).maybeSingle();
  const maxBytes = (settings?.upload_max_mb ?? 5) * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File is too large. Maximum size is ${settings?.upload_max_mb ?? 5}MB.` }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const detected = detectFileType(bytes);
  if (!detected) {
    return NextResponse.json({ error: "Unsupported file type. Please upload a JPG, PNG or PDF." }, { status: 400 });
  }

  const path = `${payment.payment_reference}/${Date.now()}-proof.${detected.ext}`;
  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(path, bytes, { contentType: detected.type, upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("payment_submissions")
    .update({
      ecocash_transaction_reference: ecocashTransactionReference,
      customer_ecocash_number: customerEcocashNumber,
      customer_email: customerEmail || payment.customer_email,
      amount_claimed: amountClaimed,
      proof_file_path: path,
      proof_file_type: detected.type,
      payment_status: "PROOF_SUBMITTED",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) {
    await supabase.storage.from("payment-proofs").remove([path]);
    if (updateError.code === "23505") {
      return NextResponse.json(
        { error: "This EcoCash transaction reference has already been used for another payment." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Something went wrong saving your submission. Please try again." }, { status: 500 });
  }

  await supabase.from("payment_audit_log").insert({
    payment_id: payment.id,
    previous_status: payment.payment_status,
    new_status: "PROOF_SUBMITTED",
    action: "proof_submitted",
  });

  return NextResponse.json({ ok: true });
}
