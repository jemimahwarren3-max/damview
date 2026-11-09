import type { Metadata } from "next";
import { MapPin, Clock3, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
import { CONTACT_NUMBERS, LOCATION, SITE_NAME } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

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
        image="https://images.pexels.com/photos/137569/pexels-photo-137569.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      {/* Split panel: contact details (dark) + general enquiry (light) */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <section className="bg-dv-forest py-16">
          <Container className="max-w-md lg:ml-auto lg:mr-0">
            <span className="font-promo text-sm tracking-widest text-dv-sunshine">Get In Touch</span>
            <h2 className="mt-2 font-serif text-2xl text-dv-ivory">Call, WhatsApp or drop by.</h2>

            <div className="mt-8 flex flex-col gap-3">
              {[
                { number: CONTACT_NUMBERS.primary, display: "077 444 6001" },
                { number: CONTACT_NUMBERS.secondary, display: "077 444 6004" },
              ].map(({ number, display }) => (
                <a
                  key={number}
                  href={buildWhatsAppUrl(number, "Hi, I'd like to enquire about Dam View Resort.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-dv-ivory/15 bg-dv-ivory/5 px-5 py-4 text-dv-ivory hover:bg-dv-ivory/10"
                >
                  <span className="font-serif text-lg">{display}</span>
                  <MessageCircle size={20} className="text-dv-sunshine" />
                </a>
              ))}
            </div>

            <p className="mt-6 flex items-center gap-2 text-dv-cream/80">
              <MapPin size={16} /> {LOCATION}
            </p>
            <p className="mt-2 flex items-center gap-2 text-dv-cream/80">
              <Clock3 size={16} /> Open 24 hours, every day
            </p>
            <p className="mt-6 text-sm text-dv-cream/50">
              Facebook / Instagram — social links coming soon
            </p>
          </Container>
        </section>

        <section className="bg-dv-ivory py-16">
          <Container className="max-w-md lg:ml-0 lg:mr-auto">
            <SectionHeading eyebrow="General Enquiry" title="Send us a message." />
            <div className="mt-8">
              <SimpleEnquiryForm intro="Hi, I have a general enquiry for Dam View Resort." submitLabel="Send on WhatsApp" />
            </div>
          </Container>
        </section>
      </div>

      <div className="h-[380px] w-full">
        <iframe
          title="Dam View Resort location"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(LOCATION)}&z=15&output=embed`}
          className="h-full w-full"
          loading="lazy"
        />
      </div>
    </>
  );
}
