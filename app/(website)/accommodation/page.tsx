import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { AccommodationEnquiryForm } from "@/components/booking/AccommodationEnquiryForm";
import { ROOM_BLOCKS, ROOM_IMAGE } from "@/lib/data/rooms";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Accommodation & Lodges — ${SITE_NAME}`,
  description: "32 rooms across A, B, F and R blocks at Dam View Resort, Chitungwiza.",
};

export default function AccommodationPage() {
  return (
    <>
      <PageHero
        eyebrow="Accommodation & Lodges"
        title="A, B, F and R blocks."
        subtitle="32 rooms, simple and comfortable, for a proper break from the everyday."
        image={ROOM_IMAGE}
      />

      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Our Lodges" title="Choose your block." />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ROOM_BLOCKS.map((block) => (
              <div key={block.id} className="flex items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6">
                <div>
                  <h3 className="font-serif text-xl text-dv-forest">{block.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Rooms {block.roomNumbers[0]} – {block.roomNumbers[block.roomNumbers.length - 1]} ·{" "}
                    {block.stayDurationHours}-hour stay
                  </p>
                </div>
                <PriceDisplay amount={block.ratePerStay} unit={`${block.stayDurationHours}hr stay`} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-dv-cream py-20">
        <Container className="flex flex-wrap gap-12">
          <div className="relative h-[360px] flex-1 min-w-[280px] overflow-hidden rounded-2xl">
            <Image src={ROOM_IMAGE} alt="A Dam View lodge room" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-[280px]">
            <SectionHeading
              eyebrow="Make an Enquiry"
              title="Tell us what you need, we'll confirm availability."
              subtitle="No account needed. Our team will reply directly to confirm your stay."
            />
            <div className="mt-8">
              <AccommodationEnquiryForm blocks={ROOM_BLOCKS} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
