import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { EventEnquiryForm } from "@/components/booking/EventEnquiryForm";
import { EVENT_CATEGORIES, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Events & Functions — ${SITE_NAME}`,
  description: "Weddings, birthdays, private parties and corporate functions at Dam View Resort.",
};

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events & Functions"
        title="Bring your people, we'll bring the setting."
        subtitle="Weddings, birthdays, private parties, family gatherings, corporate functions and conferences."
        image="https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      <section className="py-12">
        <Container className="flex flex-wrap justify-center gap-2">
          {EVENT_CATEGORIES.map((category) => (
            <span
              key={category}
              className="rounded-full border border-dv-forest/20 px-4 py-1.5 text-sm font-medium text-dv-forest"
            >
              {category}
            </span>
          ))}
        </Container>
      </section>

      <section className="bg-dv-cream py-20">
        <Container className="max-w-2xl">
          <SectionHeading
            eyebrow="Request a Quotation"
            title="Tell us about your event."
            subtitle="Share a few details and our team will put together a custom quotation."
          />
          <div className="mt-8">
            <EventEnquiryForm />
          </div>
        </Container>
      </section>
    </>
  );
}
