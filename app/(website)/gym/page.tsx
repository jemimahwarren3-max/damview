import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
import { getGymPackages, GYM_IMAGE } from "@/lib/data/gym";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Damview Gym, ${SITE_NAME}`,
  description: "A fully equipped gym at Damview Resort, open 24/7, from $1 a day or $30 a month.",
};

export default async function GymPage() {
  const gymPackages = await getGymPackages();

  return (
    <>
      <PageHero
        eyebrow="Damview Gym"
        title="Train any time. We never close."
        subtitle="A full gym on-site, open 24 hours a day, from $1 a day or $30 a month."
        image={GYM_IMAGE}
      />

      <section className="bg-dv-black py-20">
        <Container>
          <SectionHeading
            eyebrow="Memberships"
            title="From $1 a day."
            subtitle="Pay per visit or save with a monthly membership - full equipment access either way, open 24/7."
            className="[&_h2]:text-dv-ivory [&_p]:text-dv-cream/75"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {gymPackages.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border border-dv-ivory/15 bg-dv-forest/40 p-6">
                <h3 className="font-serif text-xl text-dv-sunshine">{pkg.name}</h3>
                <p className="mt-1 font-promo text-sm tracking-wide text-dv-gold">
                  {pkg.price === null
                    ? "Price to be confirmed"
                    : `$${pkg.price} ${pkg.billingPeriod === "session" ? "per visit" : `/ ${pkg.billingPeriod}`}`}
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-sm text-dv-cream/80">
                  {pkg.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </div>
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
