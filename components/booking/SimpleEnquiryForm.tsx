"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/shared/FormField";
import { CONTACT_NUMBERS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getSupabaseClient } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().min(1, "Please enter your name"),
  phone: z.string().min(1, "Please enter a phone number"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type InsertTarget =
  | { table: "activity_enquiries"; activityId: string }
  | { table: "gym_enquiries"; packageId?: string };

interface SimpleEnquiryFormProps {
  intro: string;
  submitLabel?: string;
  insertTarget?: InsertTarget;
}

export function SimpleEnquiryForm({ intro, submitLabel = "Send enquiry on WhatsApp", insertTarget }: SimpleEnquiryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const lines = [
      intro,
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.message ? `Note: ${values.message}` : null,
    ].filter(Boolean);

    try {
      const supabase = getSupabaseClient();
      if (supabase && insertTarget) {
        if (insertTarget.table === "activity_enquiries") {
          await supabase.from("activity_enquiries").insert({
            name: values.name,
            phone: values.phone,
            message: values.message || null,
            activity_id: insertTarget.activityId,
          });
        } else {
          await supabase.from("gym_enquiries").insert({
            name: values.name,
            phone: values.phone,
            message: values.message || null,
            package_id: insertTarget.packageId ?? null,
          });
        }
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
      </div>
      <FormField label="Anything else we should know?" name="message">
        <textarea id="message" {...register("message")} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2.5" />
      </FormField>
      <button
        type="submit"
        className="w-fit rounded-full bg-dv-forest px-7 py-3 text-sm font-bold text-dv-ivory hover:bg-dv-leaf"
      >
        {submitLabel}
      </button>
    </form>
  );
}
