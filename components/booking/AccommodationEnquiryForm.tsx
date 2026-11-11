"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/shared/FormField";
import { CONTACT_NUMBERS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getSupabaseClient } from "@/lib/supabase/client";
import { upsertCustomerByPhone } from "@/lib/customers";
import { generatePaymentReference } from "@/lib/payments/reference";
import { generateAccessSecret, hashAccessSecret } from "@/lib/payments/token";
import type { RoomBlock } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Please enter your name"),
  phone: z.string().min(1, "Please enter a phone number"),
  blockId: z.string().min(1, "Please choose a room type"),
  checkIn: z.string().min(1, "Please choose a date"),
  guests: z.coerce.number().min(1, "At least 1 guest"),
  message: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function AccommodationEnquiryForm({
  blocks,
  defaultBlockId,
}: {
  blocks: RoomBlock[];
  defaultBlockId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [fullyBooked, setFullyBooked] = useState(false);
  const [futureDate, setFutureDate] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: defaultBlockId ? { blockId: defaultBlockId } : undefined,
  });

  const onSubmit = async (values: FormOutput) => {
    const block = blocks.find((b) => b.id === values.blockId);
    setFullyBooked(false);
    setFutureDate(false);

    const today = new Date().toISOString().slice(0, 10);
    if (values.checkIn !== today) {
      // Room holds are instant, not date-scheduled - don't hold a room today for a future stay.
      setFutureDate(true);
      sendWhatsAppFallback(values, block?.displayName);
      return;
    }

    setSubmitting(true);

    const supabase = getSupabaseClient();
    if (!supabase || !block) {
      setSubmitting(false);
      sendWhatsAppFallback(values, block?.displayName);
      return;
    }

    try {
      const customerId = await upsertCustomerByPhone(supabase, { fullName: values.name, phone: values.phone });
      const bookingRef = generatePaymentReference();
      const { data: enquiry, error: enquiryError } = await supabase
        .from("lodge_enquiries")
        .insert({
          name: values.name,
          phone: values.phone,
          block_id: values.blockId,
          check_in: values.checkIn,
          guests: values.guests,
          message: values.message || null,
          customer_id: customerId,
          booking_reference: bookingRef,
        })
        .select("id")
        .single();

      if (enquiryError || !enquiry) throw enquiryError;
      setBookingReference(bookingRef);

      const { data: settings } = await supabase.from("payment_settings").select("room_hold_minutes").eq("id", true).maybeSingle();
      const holdMinutes = settings?.room_hold_minutes ?? 30;

      const { data: roomId } = await supabase.rpc("hold_room_for_enquiry", {
        p_block_id: values.blockId,
        p_enquiry_id: enquiry.id,
        p_hold_minutes: holdMinutes,
      });

      if (!roomId) {
        setFullyBooked(true);
        setSubmitting(false);
        sendWhatsAppFallback(values, block.displayName);
        return;
      }

      const reference = generatePaymentReference();
      const secret = generateAccessSecret();
      const secretHash = await hashAccessSecret(secret);

      await supabase.from("payment_submissions").insert({
        payment_reference: reference,
        access_token_hash: secretHash,
        enquiry_type: "lodge",
        lodge_enquiry_id: enquiry.id,
        customer_id: customerId,
        customer_name: values.name,
        customer_phone: values.phone,
        expected_amount: block.ratePerStay,
        // eslint-disable-next-line react-hooks/purity -- this runs inside the submit handler, not during render
        payment_deadline: new Date(Date.now() + holdMinutes * 60 * 1000).toISOString(),
      });

      router.push(`/pay/${reference}/${secret}`);
    } catch {
      setSubmitting(false);
      sendWhatsAppFallback(values, block.displayName);
    }
  };

  const sendWhatsAppFallback = (values: FormOutput, blockName?: string) => {
    const lines = [
      "Hi, I'd like to enquire about a lodge booking at Damview Resort.",
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Preferred room type: ${blockName ?? values.blockId}`,
      `Check-in date: ${values.checkIn}`,
      `Guests: ${values.guests}`,
      values.message ? `Note: ${values.message}` : null,
    ].filter(Boolean);
    window.open(buildWhatsAppUrl(CONTACT_NUMBERS.primary, lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Full name" name="name" error={errors.name?.message}>
          <input id="name" {...register("name")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <FormField label="Phone number" name="phone" error={errors.phone?.message}>
          <input id="phone" {...register("phone")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <FormField label="Preferred room type" name="blockId" error={errors.blockId?.message}>
          <select id="blockId" {...register("blockId")} defaultValue={defaultBlockId ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2.5">
            <option value="" disabled>
              Choose a room type
            </option>
            {blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.name} - {block.displayName}, from ${block.ratePerStay}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Check-in date" name="checkIn" error={errors.checkIn?.message}>
          <input id="checkIn" type="date" {...register("checkIn")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
          <span className="mt-1 block text-xs text-muted-foreground">
            Checking in today? We&apos;ll hold a room right now while you pay. For a future date,
            we&apos;ll pass your request to our team on WhatsApp instead.
          </span>
        </FormField>
        <FormField label="Guests" name="guests" error={errors.guests?.message}>
          <input id="guests" type="number" min={1} {...register("guests")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
      </div>
      <FormField label="Anything else we should know?" name="message">
        <textarea id="message" {...register("message")} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
      </FormField>

      {fullyBooked && (
        <p className="rounded-lg bg-dv-sunshine/20 px-3 py-2 text-sm text-dv-black">
          That room type is fully booked right now. We&apos;ve got your request and sent it to our
          team on WhatsApp - we&apos;ll follow up with you directly.
          {bookingReference && (
            <>
              {" "}Your booking reference is <strong>{bookingReference}</strong> - save it, you can
              check your status anytime in the Guest Centre.
            </>
          )}
        </p>
      )}
      {futureDate && (
        <p className="rounded-lg bg-dv-sunshine/20 px-3 py-2 text-sm text-dv-black">
          We&apos;ve sent your request for that date to our team on WhatsApp - we only hold a specific
          room the moment you&apos;re ready to pay, so a future stay needs a quick chat with us first.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-full bg-dv-forest px-7 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf disabled:opacity-60"
      >
        {submitting ? "Checking availability..." : "Check availability & pay"}
      </button>
      <span className="text-xs text-muted-foreground">
        We&apos;ll hold a room for you for a short time while you complete payment with EcoCash.
      </span>
    </form>
  );
}
