import { Waves } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ExperienceCard } from "@/components/shared/ExperienceCard";
import { SITE_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <section className="bg-dv-cream py-20">
        <Container>
          <span className="font-promo text-sm tracking-widest text-dv-gold uppercase">
            Chikwanha · Chitungwiza
          </span>
          <h1 className="mt-3 font-serif text-4xl text-dv-forest sm:text-6xl">
            {SITE_NAME}
          </h1>
          <p className="mt-4 max-w-xl text-dv-black/80">
            Good food. Good vibes. Homepage content coming in Stage 1.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="01 / Preview"
            title="A shared component, in place"
            subtitle="This card proves the design system works end to end. Real sections land in Stage 1."
          />
          <div className="mt-8 max-w-sm">
            <ExperienceCard
              image="/images/resort/pool-damside.jpg"
              title="Damside Days"
              description="Slow mornings, clear water and a front-row seat to the sunset."
              icon={Waves}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
