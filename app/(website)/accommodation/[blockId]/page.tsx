import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { AccommodationEnquiryForm } from "@/components/booking/AccommodationEnquiryForm";
import { PaymentNote } from "@/components/shared/PaymentNote";
import { getRoomBlocks, getRoomBlockById } from "@/lib/data/rooms";
import { SITE_NAME, LODGE_HOURLY_RATE } from "@/lib/constants";

// Matched by feel to each block's price tier - ask the owner to confirm/reassign if a specific photo is known to belong elsewhere.
const ROOM_IMAGES: Record<string, string> = {
  a: "/images/accommodation/real/room-1.jpg",
  b: "/images/accommodation/real/room-4.jpg",
  f: "/images/accommodation/real/room-3.jpg",
  r: "/images/accommodation/real/room-2.jpg",
};

export async function generateStaticParams() {
  const blocks = await getRoomBlocks();
  return blocks.map((block) => ({ blockId: block.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ blockId: string }> }): Promise<Metadata> {
  const { blockId } = await params;
  const block = await getRoomBlockById(blockId);
  if (!block) return { title: `Accommodation, ${SITE_NAME}` };

  return {
    title: `${block.name}, ${SITE_NAME}`,
    description: `${block.name} (${block.displayName}) at Damview Resort, from $${block.ratePerStay} per ${block.stayDurationHours}-hour stay.`,
  };
}

export default async function RoomDetailPage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;
  const [block, allBlocks] = await Promise.all([getRoomBlockById(blockId), getRoomBlocks()]);
  if (!block) notFound();

  const image = ROOM_IMAGES[block.id] ?? ROOM_IMAGES.f;

  return (
    <>
      <PageHero
        eyebrow="Accommodation & Lodges"
        title={block.name}
        subtitle={`${block.displayName} - from $${block.ratePerStay} per ${block.stayDurationHours}-hour stay, or $${LODGE_HOURLY_RATE} an hour.`}
        image={image}
      />

      <section className="py-20">
        <Container className="max-w-2xl">
          <Link
            href="/accommodation"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-dv-pool hover:underline"
          >
            <ArrowLeft size={15} /> Back to all rooms
          </Link>
          <SectionHeading
            eyebrow={block.displayName}
            title={block.name}
            subtitle="A comfortable, simple place to rest, whether it's a short stay or an overnight visit."
          />
          <div className="mt-6">
            <PriceDisplay amount={block.ratePerStay} unit={`${block.stayDurationHours}hr stay`} />
          </div>
        </Container>
      </section>

      <section className="bg-dv-cream py-20">
        <Container className="max-w-xl">
          <SectionHeading eyebrow="Make an Enquiry" title="Check availability." />
          <div className="mt-8">
            <AccommodationEnquiryForm blocks={allBlocks} defaultBlockId={block.id} />
            <PaymentNote />
          </div>
        </Container>
      </section>
    </>
  );
}
