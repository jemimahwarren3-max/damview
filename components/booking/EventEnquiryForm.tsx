"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/shared/FormField";
import { CONTACT_NUMBERS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EventType } from "@/types";

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "private_party", label: "Private party" },
  { value: "family_gathering", label: "Family gathering" },
  { value: "corporate", label: "Corporate function" },
  { value: "conference", label: "Conference" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  name: z.string().min(1, "Please enter your name"),
  phone: z.string().min(1, "Please enter a phone number"),
  eventType: z.string().min(1, "Please choose an event type"),
  proposedDate: z.string().min(1, "Please choose a date"),
  expectedGuests: z.coerce.number().min(1, "At least 1 guest"),
  facilitiesRequired: z.string().optional(),
  cateringRequired: z.boolean(),
  accommodationRequired: z.boolean(),
  additionalInfo: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function EventEnquiryForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { cateringRequired: false, accommodationRequired: false },
  });

  const onSubmit = async (values: FormOutput) => {
    const eventTypeLabel =
      EVENT_TYPE_OPTIONS.find((option) => option.value === values.eventType)?.label ?? values.eventType;

    const lines = [
      "Hi, I'd like a quotation for an event at Dam View Resort.",
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Event type: ${eventTypeLabel}`,
      `Proposed date: ${values.proposedDate}`,
      `Expected guests: ${values.expectedGuests}`,
      values.facilitiesRequired ? `Facilities required: ${values.facilitiesRequired}` : null,
      `Catering required: ${values.cateringRequired ? "Yes" : "No"}`,
      `Accommodation required: ${values.accommodationRequired ? "Yes" : "No"}`,
      values.additionalInfo ? `Additional info: ${values.additionalInfo}` : null,
    ].filter(Boolean);

    try {
      const supabase = getSupabaseClient();
      await supabase.from("event_enquiries").insert({
        name: values.name,
        phone: values.phone,
        event_type: values.eventType,
        proposed_date: values.proposedDate,
        expected_guests: values.expectedGuests,
        facilities_required: values.facilitiesRequired
          ? values.facilitiesRequired.split(",").map((f) => f.trim()).filter(Boolean)
          : [],
        catering_required: values.cateringRequired,
        accommodation_required: values.accommodationRequired,
        message: values.additionalInfo || null,
      });
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
        <FormField label="Event type" name="eventType" error={errors.eventType?.message}>
          <select id="eventType" {...register("eventType")} defaultValue="" className="w-full rounded-lg border border-border bg-background px-3 py-2.5">
            <option value="" disabled>
              Choose an event type
            </option>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Proposed date" name="proposedDate" error={errors.proposedDate?.message}>
          <input id="proposedDate" type="date" {...register("proposedDate")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <FormField label="Expected guests" name="expectedGuests" error={errors.expectedGuests?.message}>
          <input id="expectedGuests" type="number" min={1} {...register("expectedGuests")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
        </FormField>
        <FormField label="Facilities required" name="facilitiesRequired">
          <input
            id="facilitiesRequired"
            placeholder="e.g. venue, sound system, tables"
            {...register("facilitiesRequired")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("cateringRequired")} /> Catering required
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("accommodationRequired")} /> Accommodation required
        </label>
      </div>

      <FormField label="Additional information" name="additionalInfo">
        <textarea id="additionalInfo" {...register("additionalInfo")} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
      </FormField>

      <button
        type="submit"
        className="w-fit rounded-full bg-dv-forest px-7 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf"
      >
        Request a quotation on WhatsApp
      </button>
      <span className="text-xs text-muted-foreground">
        This sends an enquiry for a custom quotation — not a confirmed booking.
      </span>
    </form>
  );
}
