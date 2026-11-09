import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ExperienceCard } from "@/components/shared/ExperienceCard";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
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
        image="https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

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

      <section className="bg-dv-cream py-20">
        <Container className="max-w-xl">
          <SectionHeading eyebrow="Enquire" title="Plan your time on the water." />
          <div className="mt-8">
            <SimpleEnquiryForm intro="Hi, I'd like to enquire about the Damside experience at Dam View Resort." />
          </div>
        </Container>
      </section>
    </>
  );
}
