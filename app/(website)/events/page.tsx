import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { EventEnquiryForm } from "@/components/booking/EventEnquiryForm";
import { PaymentNote } from "@/components/shared/PaymentNote";
import { EVENT_CATEGORIES, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Events & Celebrations, ${SITE_NAME}`,
  description: "Birthdays, family gatherings, private parties and more at Damview Resort.",
};

const SHOWCASE = [
  {
    image: "https://images.pexels.com/photos/14988950/pexels-photo-14988950.jpeg?auto=compress&cs=tinysrgb&w=900",
    caption: "Birthdays & Celebrations",
  },
  {
    image: "https://images.pexels.com/photos/30049861/pexels-photo-30049861.jpeg?auto=compress&cs=tinysrgb&w=900",
    caption: "Family Gatherings",
  },
  {
    image: "https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=900",
    caption: "Private Functions",
  },
];

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events & Celebrations"
        title="Damview isn't just a place to visit. It's a place to celebrate."
        subtitle="Birthdays, graduations, family gatherings, private parties, corporate get-togethers and weddings, set against our pool, gazebos and open grounds."
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
        <Container className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-2">
            {EVENT_CATEGORIES.map((category) => (
              <span
                key={category}
                className="rounded-full border border-dv-gold/50 px-4 py-1.5 text-sm font-medium text-dv-forest"
              >
                {category}
              </span>
            ))}
          </div>
          <p className="max-w-lg text-center text-sm text-dv-black/70">
            Gazebos and outdoor seating, a resident DJ and dance floor, and scenic spots for your
            photos, all part of hosting with us.
          </p>
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
            <PaymentNote />
          </div>
        </Container>
      </section>
    </>
  );
}
