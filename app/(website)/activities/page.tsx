import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Clock, Users } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { getAllActivities } from "@/lib/data/activities";
import { SITE_NAME } from "@/lib/constants";

// Damview Sports Academy is a separate kids' football programme, run on-site
// but booked/contacted through its own numbers - from the real academy flyer.
const SPORTS_ACADEMY = {
  schedule: "Every Saturday, 8am - 12pm",
  ages: "U6, U8, U11, U14, U17",
  registration: 10,
  subscription: 15,
  contactNumbers: ["263775943501", "263774446000"],
  location: "242 Guzha Seke Road, Chitungwiza",
};

export const metadata: Metadata = {
  title: `Activities, ${SITE_NAME}`,
  description: "Quad biking, horse riding, zip lines, trampolines, pool tables, boat cruises, pedal boats and more at Damview Resort.",
};

export default async function ActivitiesPage() {
  const activities = await getAllActivities();

  return (
    <>
      <PageHero
        eyebrow="Recreational Activities"
        title="Find your fun."
        subtitle="From quad bikes to boat cruises, something for every age, every visit."
        image="https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      {activities.map((activity, index) => (
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
                {activity.pricing ? `$${activity.pricing.amount} ${activity.pricing.unit.replace("_", " ")}` : "Pricing to be confirmed, enquire below"}
              </p>
              <Link
                href={`/activities/${activity.id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-dv-forest hover:underline"
              >
                View details <ArrowRight size={14} />
              </Link>
            </div>
          </Container>
        </section>
      ))}

      <section className="bg-dv-black py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <span className="flex items-center gap-2 font-promo text-sm tracking-widest text-dv-gold">
            <Trophy size={16} /> Damview Sports Academy
          </span>
          <h2 className="font-serif text-3xl text-dv-ivory sm:text-4xl">Building talent. Building futures. Building champions.</h2>
          <p className="max-w-xl text-dv-cream/75">
            A kids&apos; football academy on-site, open to boys and girls of all skill levels.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl border border-dv-ivory/15 bg-dv-forest/40 px-5 py-4 text-sm text-dv-cream/90">
              <Clock size={16} className="text-dv-gold" /> {SPORTS_ACADEMY.schedule}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-dv-ivory/15 bg-dv-forest/40 px-5 py-4 text-sm text-dv-cream/90">
              <Users size={16} className="text-dv-gold" /> Ages {SPORTS_ACADEMY.ages}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-dv-ivory/15 bg-dv-forest/40 px-5 py-4 text-sm text-dv-cream/90">
              Registration ${SPORTS_ACADEMY.registration} &middot; ${SPORTS_ACADEMY.subscription}/month
            </div>
          </div>
          <WhatsAppButton
            phone={SPORTS_ACADEMY.contactNumbers[0]}
            label="Enquire about the Academy"
            message="Hi, I'd like to enquire about the Damview Sports Academy for my child."
            className="mt-2 bg-dv-gold text-dv-black hover:bg-dv-sunshine"
          />
        </Container>
      </section>

      <section className="bg-dv-forest py-20">
        <Container className="max-w-xl">
          <SectionHeading
            eyebrow="Enquire"
            title="Ask about an activity."
            className="[&_h2]:text-dv-ivory [&_span]:text-dv-sunshine"
          />
          <div className="mt-8">
            <SimpleEnquiryForm intro="Hi, I'd like to enquire about activities at Damview Resort." />
          </div>
        </Container>
      </section>
    </>
  );
}
