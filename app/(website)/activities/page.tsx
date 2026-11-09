import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
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

      {RECREATIONAL_ACTIVITIES.map((activity, index) => (
        <section
          key={activity.id}
          className={index % 2 === 0 ? "bg-background" : "bg-dv-cream"}
        >
          <Container className="flex flex-col items-center gap-10 py-16 lg:flex-row lg:gap-16">
            <div
              className={
                index % 2 === 0
                  ? "order-1 relative aspect-[4/3] w-full flex-1 overflow-hidden rounded-sm"
                  : "order-1 relative aspect-[4/3] w-full flex-1 overflow-hidden rounded-sm lg:order-2"
              }
            >
              <Image src={activity.image ?? ""} alt={activity.name} fill className="object-cover" />
            </div>
            <div className={index % 2 === 0 ? "order-2 flex-1" : "order-2 flex-1 lg:order-1"}>
              <span className="font-promo text-sm tracking-widest text-dv-gold">
                0{index + 1}
              </span>
              <h2 className="mt-2 font-serif text-3xl text-dv-forest sm:text-4xl">{activity.name}</h2>
              <p className="mt-3 max-w-md text-dv-black/75">{activity.description}</p>
              <p className="mt-3 text-sm font-medium text-dv-pool">
                {activity.pricing ? `$${activity.pricing.amount} ${activity.pricing.unit.replace("_", " ")}` : "Pricing to be confirmed — enquire below"}
              </p>
            </div>
          </Container>
        </section>
      ))}

      <section className="bg-dv-forest py-20">
        <Container className="max-w-xl">
          <SectionHeading
            eyebrow="Enquire"
            title="Ask about an activity."
            className="[&_h2]:text-dv-ivory [&_span]:text-dv-sunshine"
          />
          <div className="mt-8">
            <SimpleEnquiryForm intro="Hi, I'd like to enquire about activities at Dam View Resort." />
          </div>
        </Container>
      </section>
    </>
  );
}
