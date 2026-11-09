"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/shared/FormField";
import { CONTACT_NUMBERS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getSupabaseClient } from "@/lib/supabase/client";
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
    const lines = [
      "Hi, I'd like to enquire about a lodge booking at Damview Resort.",
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Preferred room type: ${block?.displayName ?? values.blockId}`,
      `Check-in date: ${values.checkIn}`,
      `Guests: ${values.guests}`,
      values.message ? `Note: ${values.message}` : null,
    ].filter(Boolean);

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("lodge_enquiries").insert({
          name: values.name,
          phone: values.phone,
          block_id: values.blockId,
          check_in: values.checkIn,
          guests: values.guests,
          message: values.message || null,
        });
      }
    } catch {
      // Don't block the enquiry on a database hiccup — WhatsApp still goes through below.
    }

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
                {block.displayName}, from ${block.ratePerStay}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Check-in date" name="checkIn" error={errors.checkIn?.message}>
          <input id="checkIn" type="date" {...register("checkIn")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <FormField label="Guests" name="guests" error={errors.guests?.message}>
          <input id="guests" type="number" min={1} {...register("guests")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
      </div>
      <FormField label="Anything else we should know?" name="message">
        <textarea id="message" {...register("message")} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
      </FormField>
      <button
        type="submit"
        className="w-fit rounded-full bg-dv-forest px-7 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf"
      >
        Send enquiry on WhatsApp
      </button>
      <span className="text-xs text-muted-foreground">
        This sends an enquiry, not a confirmed booking. Our team will confirm availability with you directly.
      </span>
    </form>
  );
}
