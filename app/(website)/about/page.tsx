import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Waves, Dumbbell, UtensilsCrossed, Tent, PartyPopper, Bike } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { LOCATION, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About — ${SITE_NAME}`,
  description:
    "The story behind Dam View Resort, a dam-side social escape in Chikwanha, Chitungwiza.",
};

const ON_SITE = [
  { icon: Waves, label: "Swimming pool & waterfront" },
  { icon: Dumbbell, label: "Gym, open 24/7" },
  { icon: UtensilsCrossed, label: "Dam Food Bar" },
  { icon: Bike, label: "Quad bikes, horse riding, zip lines" },
  { icon: Tent, label: "Lodges & camping" },
  { icon: PartyPopper, label: "Weddings & functions" },
];

const REASONS = [
  {
    number: "01",
    title: "One fee, a full day",
    body: "A single entrance fee opens up the pool, the gym, the games and the grounds — no extra tickets to juggle.",
  },
  {
    number: "02",
    title: "Built for everyone",
    body: "Trampolines and pool tables for the kids, quad bikes and horse riding for the adventurous, a gazebo for the ones who just want to sit.",
  },
  {
    number: "03",
    title: "Close, but it doesn't feel it",
    body: "Minutes from Seke Road, but once you're by the water, it's easy to forget you're still in Chitungwiza.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Damview"
        title="The Damview Social Escape"
        subtitle="A dam-side destination in Chikwanha, built around good food, good water and good company."
        image="https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      {/* Story — overlapping split layout */}
      <section className="py-20 sm:py-28">
        <Container className="relative">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm sm:aspect-[16/9]">
            <Image
              src="https://images.pexels.com/photos/137569/pexels-photo-137569.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="The pool and pavilion at Dam View Resort"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10 mx-auto -mt-16 max-w-xl rounded-sm bg-dv-ivory p-8 shadow-xl sm:-mt-24 sm:p-10">
            <span className="font-promo text-sm tracking-widest text-dv-gold">Our Story</span>
            <h2 className="mt-2 font-serif text-2xl text-dv-forest sm:text-3xl">
              Chitungwiza&apos;s water, the way locals have always used it.
            </h2>
            <p className="mt-4 text-dv-black/75">
              Long before anyone called it a resort, this stretch of dam country in Chikwanha was
              where Chitungwiza came to fish, braai and cool off on a hot Sunday. Dam View grew out
              of that same spirit — a proper pool, cold drinks and somewhere comfortable to sit,
              right along Seke Road, next to Zuva Service Station.
            </p>
          </div>
        </Container>
      </section>

      {/* On-site overview */}
      <section className="bg-dv-black py-16">
        <Container>
          <span className="font-promo text-sm tracking-widest text-dv-sunshine">On Site</span>
          <h2 className="mt-2 max-w-md font-serif text-3xl text-dv-ivory">
            Everything you need, nowhere you need to be.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {ON_SITE.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 border-b border-dv-ivory/10 pb-4">
                <Icon className="text-dv-gold" size={22} />
                <span className="text-dv-cream/90">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Damview */}
      <section className="py-20 sm:py-28">
        <Container>
          <span className="font-promo text-sm tracking-widest text-dv-gold">Why Damview</span>
          <h2 className="mt-2 max-w-lg font-serif text-3xl text-dv-forest sm:text-4xl">
            Reasons people keep coming back.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {REASONS.map((reason) => (
              <div key={reason.number}>
                <span className="font-serif text-4xl text-dv-gold">{reason.number}</span>
                <h3 className="mt-3 font-serif text-xl text-dv-forest">{reason.title}</h3>
                <p className="mt-2 text-dv-black/70">{reason.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Location + CTA */}
      <section className="relative py-24">
        <Image
          src="https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Dam View Resort grounds"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-dv-forest/85" />
        <Container className="relative flex flex-col items-center gap-4 text-center">
          <h2 className="font-serif text-3xl text-dv-ivory sm:text-4xl">
            Right where Chitungwiza already comes to unwind.
          </h2>
          <p className="max-w-lg text-dv-cream/85">{LOCATION}. Open 24 hours, every day.</p>
          <Link
            href="/accommodation"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-dv-gold px-7 py-3.5 text-sm font-bold text-dv-forest hover:bg-dv-sunshine"
          >
            Plan Your Visit <ArrowUpRight size={16} />
          </Link>
        </Container>
      </section>
    </>
  );
}
