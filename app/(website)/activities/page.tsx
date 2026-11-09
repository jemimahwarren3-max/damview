import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ExperienceCard } from "@/components/shared/ExperienceCard";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
import { RECREATIONAL_ACTIVITIES } from "@/lib/data/activities";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Recreational Activities — ${SITE_NAME}`,
  description: "Quad biking, horse riding, zip lines, trampolines and pool tables at Dam View Resort.",
};

export default function ActivitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Recreational Activities"
        title="Find your fun."
        subtitle="From quad bikes to pool tables — something for every age, every visit."
        image="https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="On Site"
            title="Pricing for most activities is still being confirmed — enquire below."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RECREATIONAL_ACTIVITIES.map((activity) => (
              <ExperienceCard
                key={activity.id}
                image={activity.image ?? ""}
                title={activity.name}
                description={activity.description}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-dv-cream py-20">
        <Container className="max-w-xl">
          <SectionHeading eyebrow="Enquire" title="Ask about an activity." />
          <div className="mt-8">
            <SimpleEnquiryForm intro="Hi, I'd like to enquire about activities at Dam View Resort." />
          </div>
        </Container>
      </section>
    </>
  );
}
