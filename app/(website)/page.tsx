import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ExperienceCard } from "@/components/shared/ExperienceCard";
import { StickerBadge } from "@/components/shared/StickerBadge";
import { ChevronDivider } from "@/components/shared/ChevronDivider";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import {
  SITE_NAME,
  TAGLINE,
  LOCATION,
  CONTACT_NUMBERS,
  HOME_FACILITIES,
  EVENT_CATEGORIES,
  GALLERY_PREVIEW,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[640px] items-end">
        <Image
          src="https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Sunset over the water at Dam View Resort"
          fill
          priority
          className="object-cover object-[center_38%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(23,61,43,0.35) 0%, rgba(20,30,22,0.35) 45%, rgba(15,24,18,0.92) 100%)",
          }}
        />
        <Container className="relative flex flex-col gap-5 pt-40 pb-16">
          <span className="font-promo text-sm tracking-widest text-dv-sunshine">
            Chikwanha · Chitungwiza · on the Hunyani
          </span>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] text-dv-ivory sm:text-7xl">
            {SITE_NAME}
          </h1>
          <p className="font-promo text-xl tracking-wide text-dv-sunshine sm:text-2xl">
            {TAGLINE}
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 rounded-full bg-dv-gold px-7 py-4 text-sm font-bold text-dv-forest hover:bg-dv-sunshine"
            >
              Explore Damview <ArrowUpRight size={16} />
            </Link>
            <WhatsAppButton variant="inline" label="Plan your visit" className="bg-transparent border border-dv-ivory/50 text-dv-ivory hover:bg-dv-ivory/10" />
          </div>
        </Container>
      </section>

      {/* Facts strip */}
      <section className="bg-dv-cream py-10">
        <Container className="flex flex-wrap justify-center gap-4">
          <StickerBadge tilt="left">Open 24 / 7</StickerBadge>
          <StickerBadge tone="pool" tilt="right">Entrance $3 pp</StickerBadge>
          <StickerBadge tilt="left">Family friendly</StickerBadge>
          <StickerBadge tone="forest" tilt="right">
            <a href={`tel:+${CONTACT_NUMBERS.primary}`}>077 444 6001 / 6004</a>
          </StickerBadge>
        </Container>
      </section>

      {/* Intro / story */}
      <section className="py-20">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="The Dam View Social Escape"
            title="Chitungwiza's water, the way locals have always used it."
            subtitle="Long before anyone called it a resort, this stretch of dam country in Chikwanha was where Chitungwiza came to fish, braai and cool off on a hot Sunday. Dam View keeps that same spirit — just with a pool, cold drinks and somewhere comfortable to sit, right along Seke Road."
          />
        </Container>
      </section>

      <ChevronDivider />

      {/* Facilities preview */}
      <section className="bg-dv-forest py-20">
        <Container>
          <SectionHeading
            eyebrow="Everything in one place"
            title="One entrance fee, a whole day of things to do."
            className="[&_h2]:text-dv-ivory [&_p]:text-dv-cream/80"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_FACILITIES.map((facility) => (
              <ExperienceCard
                key={facility.href}
                image={facility.image}
                title={facility.title}
                description={facility.description}
                href={facility.href}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Events & promotions */}
      <section className="relative py-24">
        <Image
          src="https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="A celebration at Dam View Resort"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-dv-black/70" />
        <Container className="relative max-w-2xl text-center mx-auto flex flex-col items-center gap-5">
          <span className="font-promo text-sm tracking-widest text-dv-sunshine">
            Events &amp; Functions
          </span>
          <h2 className="font-serif text-3xl text-dv-ivory sm:text-4xl">
            Bring your people, we&apos;ll bring the setting.
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {EVENT_CATEGORIES.map((category) => (
              <span
                key={category}
                className="rounded-full border border-dv-ivory/40 px-4 py-1.5 text-sm text-dv-ivory"
              >
                {category}
              </span>
            ))}
          </div>
          <WhatsAppButton
            variant="inline"
            label="Enquire about your event"
            message="Hi, I'd like to enquire about hosting an event at Dam View Resort."
            className="mt-2"
          />
        </Container>
      </section>

      {/* Gallery preview */}
      <section className="py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="A taste of it" title="Every weekend looks a little like this." />
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1 text-sm font-semibold text-dv-pool hover:underline"
            >
              See the full gallery <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GALLERY_PREVIEW.map((item) => (
              <div key={item.caption} className="group relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={item.image}
                  alt={item.caption}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-dv-black/60 px-2 py-1.5 text-center text-xs font-medium text-dv-ivory">
                  {item.caption}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Location & final CTA */}
      <section className="bg-dv-forest py-20">
        <Container className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-serif text-3xl text-dv-ivory sm:text-4xl">
            Come have a good time.
          </h2>
          <p className="flex items-center gap-2 text-dv-cream/80">
            <MapPin size={16} /> {LOCATION}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <WhatsAppButton
              label="077 444 6001"
              phone={CONTACT_NUMBERS.primary}
              className="bg-dv-gold text-dv-forest hover:bg-dv-sunshine"
            />
            <WhatsAppButton
              label="077 444 6004"
              phone={CONTACT_NUMBERS.secondary}
              className="border border-dv-ivory/50 bg-transparent text-dv-ivory hover:bg-dv-ivory/10"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
