import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { EventEnquiryForm } from "@/components/booking/EventEnquiryForm";
import { EVENT_CATEGORIES, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Events & Functions — ${SITE_NAME}`,
  description: "Weddings, birthdays, private parties and corporate functions at Dam View Resort.",
};

const SHOWCASE = [
  {
    image: "https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=900",
    caption: "Weddings",
  },
  {
    image: "https://images.pexels.com/photos/14988950/pexels-photo-14988950.jpeg?auto=compress&cs=tinysrgb&w=900",
    caption: "Celebrations",
  },
  {
    image: "https://images.pexels.com/photos/30049861/pexels-photo-30049861.jpeg?auto=compress&cs=tinysrgb&w=900",
    caption: "Private functions",
  },
];

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events & Functions"
        title="Bring your people, we'll bring the setting."
        subtitle="Weddings, birthdays, private parties, family gatherings, corporate functions and conferences."
        image="https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      {/* Elegant asymmetrical showcase */}
      <section className="bg-dv-ivory py-20">
        <Container>
          <span className="font-script text-3xl text-dv-gold">for every occasion</span>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {SHOWCASE.map((item, index) => (
              <div
                key={item.caption}
                className={`relative overflow-hidden rounded-sm ${index === 1 ? "aspect-[3/4] sm:mt-10" : "aspect-[4/5]"}`}
              >
                <Image src={item.image} alt={item.caption} fill className="object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-dv-forest/80 px-3 py-2 text-center font-serif text-dv-ivory">
                  {item.caption}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container className="flex flex-wrap justify-center gap-2">
          {EVENT_CATEGORIES.map((category) => (
            <span
              key={category}
              className="rounded-full border border-dv-gold/50 px-4 py-1.5 text-sm font-medium text-dv-forest"
            >
              {category}
            </span>
          ))}
        </Container>
      </section>

      <section className="bg-dv-forest py-20">
        <Container className="max-w-2xl">
          <SectionHeading
            eyebrow="Request a Quotation"
            title="Tell us about your event."
            subtitle="Share a few details and our team will put together a custom quotation."
            className="[&_h2]:text-dv-ivory [&_p]:text-dv-cream/80 [&_span]:text-dv-sunshine"
          />
          <div className="mt-8 rounded-2xl bg-dv-ivory p-6 sm:p-8">
            <EventEnquiryForm />
          </div>
        </Container>
      </section>
    </>
  );
}
