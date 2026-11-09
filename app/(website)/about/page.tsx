import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ChevronDivider } from "@/components/shared/ChevronDivider";
import { LOCATION, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About — ${SITE_NAME}`,
  description:
    "The story behind Dam View Resort, a dam-side social escape in Chikwanha, Chitungwiza.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Damview"
        title="The Damview Social Escape"
        subtitle="A dam-side destination in Chikwanha, built around good food, good water and good company."
        image="https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      <section className="py-20">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Our Story"
            title="Chitungwiza's water, the way locals have always used it."
            subtitle="Long before anyone called it a resort, this stretch of dam country in Chikwanha was where Chitungwiza came to fish, braai and cool off on a hot Sunday. Dam View grew out of that same spirit — a proper pool, cold drinks and somewhere comfortable to sit, right along Seke Road, next to Zuva Service Station."
          />
        </Container>
      </section>

      <ChevronDivider />

      <section className="bg-dv-cream py-20">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Location"
            title="Right where Chitungwiza already comes to unwind."
            subtitle={`${LOCATION}. Open 24 hours, every day. Close enough for an afternoon, worth the trip for a whole weekend.`}
          />
        </Container>
      </section>

      <section className="py-20">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Why Damview"
            title="One entrance fee, a whole day of things to do."
            subtitle="Lodges, a gym that never closes, a bar and restaurant, the waterfront, quad bikes, horse riding and more — all on one site, family friendly, and built for making a day stretch into a weekend."
          />
        </Container>
      </section>
    </>
  );
}
