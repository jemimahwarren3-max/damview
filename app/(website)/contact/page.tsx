import type { Metadata } from "next";
import { MapPin, Clock3 } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { CONTACT_NUMBERS, LOCATION, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Contact & Location — ${SITE_NAME}`,
  description: "Find and contact Dam View Resort in Chikwanha, Chitungwiza.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact & Location"
        title="Come find us."
        subtitle={LOCATION}
        image="https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      <section className="py-20">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading eyebrow="Get In Touch" title="Call, WhatsApp or drop by." />
            <p className="flex items-center gap-2 text-dv-black/80">
              <MapPin size={18} /> {LOCATION}
            </p>
            <p className="flex items-center gap-2 text-dv-black/80">
              <Clock3 size={18} /> Open 24 hours, every day
            </p>
            <div className="flex flex-wrap gap-3">
              <WhatsAppButton label="077 444 6001" phone={CONTACT_NUMBERS.primary} />
              <WhatsAppButton label="077 444 6004" phone={CONTACT_NUMBERS.secondary} />
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span title="Social links coming soon">Facebook</span>
              <span title="Social links coming soon">Instagram</span>
              <span className="text-xs">(social links coming soon)</span>
            </div>

            <div className="mt-2 overflow-hidden rounded-2xl border border-border">
              <iframe
                title="Dam View Resort location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(LOCATION)}&z=15&output=embed`}
                className="h-[300px] w-full"
                loading="lazy"
              />
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="General Enquiry" title="Send us a message." />
            <div className="mt-8">
              <SimpleEnquiryForm intro="Hi, I have a general enquiry for Dam View Resort." submitLabel="Send on WhatsApp" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
