import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { AccommodationEnquiryForm } from "@/components/booking/AccommodationEnquiryForm";
import { PaymentNote } from "@/components/shared/PaymentNote";
import { getRoomBlocks, ROOM_IMAGE } from "@/lib/data/rooms";
import { SITE_NAME, LODGE_HOURLY_RATE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Accommodation & Lodges, ${SITE_NAME}`,
  description: "Comfortable accommodation at Damview Resort, Chitungwiza.",
};

const REAL_ROOM_PHOTOS = [
  "/images/accommodation/real/room-1.jpg",
  "/images/accommodation/real/room-2.jpg",
  "/images/accommodation/real/room-3.jpg",
  "/images/accommodation/real/room-4.jpg",
];

export default async function AccommodationPage() {
  const roomBlocks = await getRoomBlocks();

  return (
    <>
      <PageHero
        eyebrow="Accommodation & Lodges"
        title="Find Your Stay."
        subtitle="For a proper break from the everyday."
        image={ROOM_IMAGE}
      />

      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Our Lodges"
            title="Choose your block."
            subtitle={`Day rates are per 12-hour stay. An hourly rate of $${LODGE_HOURLY_RATE} is also available.`}
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {roomBlocks.map((block) => (
              <Link
                key={block.id}
                href={`/accommodation/${block.id}`}
                className="flex items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-dv-pool"
              >
                <div>
                  <h3 className="font-serif text-xl text-dv-forest">{block.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {block.displayName} &middot; {block.stayDurationHours}-hour stay
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-dv-pool">
                    View details <ArrowRight size={12} />
                  </span>
                </div>
                <PriceDisplay amount={block.ratePerStay} unit={`${block.stayDurationHours}hr stay`} />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="See For Yourself" title="Inside our rooms." subtitle="Real photos from our rooms, not stock images." />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {REAL_ROOM_PHOTOS.map((src) => (
              <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image src={src} alt="Inside a Damview lodge room" fill className="object-cover" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-dv-cream py-20">
        <Container className="flex flex-wrap gap-12">
          <div className="relative h-[360px] flex-1 min-w-[280px] overflow-hidden rounded-2xl">
            <Image src={ROOM_IMAGE} alt="A Damview lodge room" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-[280px]">
            <SectionHeading
              eyebrow="Make an Enquiry"
              title="Tell us what you need, we'll confirm availability."
              subtitle="No account needed. Our team will reply directly to confirm your stay."
            />
            <div className="mt-8">
              <AccommodationEnquiryForm blocks={roomBlocks} />
              <PaymentNote />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
