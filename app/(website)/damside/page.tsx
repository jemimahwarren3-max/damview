import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ExperienceCard } from "@/components/shared/ExperienceCard";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { DAMSIDE_ACTIVITIES } from "@/lib/data/activities";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Damside Experience — ${SITE_NAME}`,
  description: "Waterfront relaxation, boat cruises and pedal boats at Dam View Resort.",
};

export default function DamsidePage() {
  return (
    <>
      <PageHero
        eyebrow="Damside Experience"
        title="Slow afternoons on the water."
        subtitle="Gazebos, outdoor seating and a scenic waterfront made for sitting a while."
        image="https://images.pexels.com/photos/30800484/pexels-photo-30800484.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      {/* Full-bleed braai banner */}
      <section className="relative flex min-h-[420px] items-center">
        <Image
          src="https://images.pexels.com/photos/8021129/pexels-photo-8021129.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Friends gathered for a braai by the water"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-dv-pool/70" />
        <Container className="relative flex flex-col items-center gap-3 text-center">
          <span className="font-script text-3xl text-dv-sunshine">braai by the dam</span>
          <h2 className="font-serif text-3xl text-dv-ivory sm:text-4xl">
            Friends, family, and a view worth staying for.
          </h2>
          <WhatsAppButton
            label="Come Join Us"
            message="Hi, I'd like to plan a Damside visit at Dam View Resort."
            className="mt-3 bg-dv-gold text-dv-forest hover:bg-dv-sunshine"
          />
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="On the Water" title="Boat cruises and pedal boats." />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {DAMSIDE_ACTIVITIES.map((activity) => (
              <ExperienceCard
                key={activity.id}
                image={activity.image ?? ""}
                title={`${activity.name} — $${activity.pricing?.amount}pp`}
                description={activity.description}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-dv-pool py-20">
        <Container className="max-w-xl">
          <SectionHeading
            eyebrow="Enquire"
            title="Plan your time on the water."
            className="[&_h2]:text-dv-ivory [&_span]:text-dv-sunshine"
          />
          <div className="mt-8">
            <SimpleEnquiryForm intro="Hi, I'd like to enquire about the Damside experience at Dam View Resort." />
          </div>
        </Container>
      </section>
    </>
  );
}
