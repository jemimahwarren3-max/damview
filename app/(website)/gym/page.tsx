import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
import { getGymPackages, GYM_IMAGE } from "@/lib/data/gym";
import { SITE_NAME } from "@/lib/constants";

const WORKOUT_CLASSES = [
  "Zumba",
  "Aerobics",
  "Board Stepping",
  "Kata Box",
  "Spin Class",
  "Functional Training",
  "Yoga",
  "Aqua Aerobics",
  "Cardio",
  "Auto Boxing",
  "HIIT Marathon",
];

export const metadata: Metadata = {
  title: `Damview's Fitness Club, ${SITE_NAME}`,
  description: "Damview's Fitness Club - Standard membership from $30/month, plus Premium add-ons. A $10 one-time joining fee applies for new members.",
};

export default async function GymPage() {
  const gymPackages = await getGymPackages();

  return (
    <>
      <PageHero
        eyebrow="Damview's Fitness Club"
        title="More than a gym. It's a lifestyle."
        subtitle="Standard membership from $30/month, with Premium add-ons available. A $10 one-time joining fee applies for new members."
        image={GYM_IMAGE}
      />

      <section className="bg-dv-black py-20">
        <Container>
          <SectionHeading
            eyebrow="Choose Your Membership"
            title="Pick the tier that fits your lifestyle."
            subtitle="Premium and Premium Plus are monthly add-ons on top of Standard, not separate memberships."
            className="[&_h2]:text-dv-ivory [&_p]:text-dv-cream/75"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {gymPackages.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border border-dv-ivory/15 bg-dv-forest/40 p-6">
                <h3 className="font-serif text-xl text-dv-sunshine">{pkg.name}</h3>
                <p className="mt-1 font-promo text-sm tracking-wide text-dv-gold">
                  {pkg.price === null ? "Price to be confirmed" : `$${pkg.price} / ${pkg.billingPeriod}`}
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-sm text-dv-cream/80">
                  {pkg.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-dv-cream/60">
            Plus a one-time $10 joining fee for all new members.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="See For Yourself" title="Inside our gym." subtitle="Real photos from the floor, not stock images." />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {["/images/gym/real/gym-1.jpg", "/images/gym/real/gym-2.jpg", "/images/gym/real/gym-3.jpg"].map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={src} alt="Inside Damview's Fitness Club" fill className="object-cover" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Workout Services" title="Classes included with membership." />
          <div className="mt-8 flex flex-wrap gap-2">
            {WORKOUT_CLASSES.map((cls) => (
              <span key={cls} className="rounded-full border border-dv-pool/30 bg-dv-pool/10 px-4 py-1.5 text-sm text-dv-black">
                {cls}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-dv-cream py-20">
        <Container className="max-w-xl">
          <SectionHeading eyebrow="Membership Enquiry" title="Ask about a membership." />
          <div className="mt-8">
            <SimpleEnquiryForm
              intro="Hi, I'd like to enquire about a gym membership at Damview Resort."
              submitLabel="Book Now on WhatsApp"
              insertTarget={{ table: "gym_enquiries" }}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
