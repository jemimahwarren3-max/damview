import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Navigation,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import {
  LOCATION,
  CONTACT_NUMBERS,
  EVENT_CATEGORIES,
  ENTRANCE_FEE,
  LODGE_HOURLY_RATE,
} from "@/lib/constants";
import { getRoomBlocks } from "@/lib/data/rooms";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const MARQUEE_ITEMS = ["OPEN 24 HOURS", "ENTRANCE FROM $2", "BOOK YOUR STAY", "OUTSIDE THE ORDINARY"];

const EXPERIENCE_CARDS = [
  {
    label: "Swimming Pool",
    img: "https://images.pexels.com/photos/137569/pexels-photo-137569.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-5 lg:row-span-2",
    h: "h-80 lg:h-full",
  },
  {
    label: "Dam & Water",
    img: "https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-4",
    h: "h-60",
  },
  {
    label: "Horse Riding",
    img: "https://images.pexels.com/photos/38492716/pexels-photo-38492716.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-3",
    h: "h-60",
  },
  {
    label: "Quad Biking",
    img: "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-4",
    h: "h-60",
  },
  {
    label: "Boat Cruises & Pedal Boats",
    img: "https://images.pexels.com/photos/36593940/pexels-photo-36593940.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-4",
    h: "h-60",
  },
  {
    label: "Zip Line",
    img: "https://images.pexels.com/photos/28263612/pexels-photo-28263612.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-4",
    h: "h-60",
  },
  {
    label: "Soccer Field & Trampolines",
    img: "https://images.pexels.com/photos/29440634/pexels-photo-29440634.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-5",
    h: "h-64",
  },
  {
    label: "Pool Tables",
    img: "https://images.pexels.com/photos/5055427/pexels-photo-5055427.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-3",
    h: "h-64",
  },
  {
    label: "DJ Nights & Good Vibes",
    img: "https://images.pexels.com/photos/14455480/pexels-photo-14455480.jpeg?auto=compress&cs=tinysrgb&w=1100",
    span: "lg:col-span-4",
    h: "h-64",
  },
] as const;

export default async function HomePage() {
  const roomBlocks = await getRoomBlocks();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-street-ink">
        <div className="absolute inset-0">
          <Image
            src="/images/resort/damview-sunset.jpg"
            alt="A real Chitungwiza sunset near Damview Resort"
            fill
            priority
            className="hero-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-street-ink/75 via-street-ink/30 to-street-ink/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-street-ink/60 via-transparent to-transparent" />
          <div className="grain-overlay" />
        </div>

        <Container className="relative z-10 flex h-full flex-col justify-end pb-24 lg:pb-28">
          <div className="max-w-3xl">
            <span className="sticker-tag mb-6 w-fit items-center gap-2 rounded-sm bg-street-lime px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-street-ink">
              Open 24 Hours
            </span>

            <h1 className="font-street text-[3.4rem] leading-[0.92] text-street-cream text-balance sm:text-7xl lg:text-[6.2rem]">
              DAMVIEW.
              <br />
              <span className="scribble-underline text-street-orange">OUTSIDE</span>{" "}
              THE ORDINARY.
            </h1>

            <p className="font-marker mt-4 text-xl text-street-lime sm:text-2xl">
              good times start here
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-street-cream/85 sm:text-lg">
              Good times, open spaces and unforgettable experiences. Your next escape starts
              here, just off Seke Road in Chikwanha, Chitungwiza.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/about"
                className="group inline-flex items-center justify-center gap-2 rounded-sm border-2 border-street-cream bg-transparent px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-street-cream transition-all duration-300 hover:bg-street-cream hover:text-street-ink"
              >
                Explore Damview
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/accommodation"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-street-orange px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-street-ink shadow-[3px_4px_0_rgba(0,0,0,0.8)] transition-all duration-300 hover:bg-street-lime"
              >
                Book Your Stay
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Marquee */}
      <section className="overflow-hidden bg-street-lime py-3">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="font-street mx-5 shrink-0 text-xl text-street-ink sm:text-2xl"
            >
              {item} <span className="mx-5 text-street-ink/40">&bull;</span>
            </span>
          ))}
        </div>
      </section>

      {/* The Damview Experience */}
      <section className="bg-street-cream py-24 lg:py-32">
        <Container>
          <div className="mb-12">
            <span className="font-marker text-xl text-street-orange">everything, all in one place</span>
            <h2 className="font-street mt-2 text-4xl leading-[0.95] text-street-ink sm:text-5xl lg:text-6xl">
              THE DAMVIEW EXPERIENCE.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-2">
            {EXPERIENCE_CARDS.map((card, i) => (
              <div
                key={card.label}
                className={`group relative overflow-hidden rounded-sm ${card.span} ${card.h}`}
              >
                <Image
                  src={card.img}
                  alt={card.label}
                  fill
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-street-ink/80 via-street-ink/10 to-transparent" />
                <span
                  className={`sticker-tag absolute left-4 bottom-4 rounded-sm bg-street-cream px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-street-ink ${
                    i % 2 === 0 ? "rotate-[-2deg]" : "rotate-[2deg]"
                  }`}
                >
                  {card.label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Food and Drinks */}
      <section className="bg-street-ink py-24 lg:py-32">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <span className="font-marker text-xl text-street-lime">fully stocked, always</span>
              <h2 className="font-street mt-2 text-4xl leading-[0.95] text-street-cream text-balance sm:text-5xl">
                GOOD FOOD.
                <br />
                COLD DRINKS.
                <br />
                <span className="text-street-orange">GREAT COMPANY.</span>
              </h2>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Fully Stocked Bars", "Burgers & Chips", "Wine Specials", "Butcher"].map((item) => (
                  <span
                    key={item}
                    className="rounded-sm border border-street-cream/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-street-cream/85"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/restaurant"
                className="mt-8 inline-flex items-center gap-2 rounded-sm bg-street-lime px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-street-ink transition-all hover:bg-white"
              >
                See the Menu <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-72 overflow-hidden rounded-sm">
                  <Image
                    src="https://images.pexels.com/photos/8021129/pexels-photo-8021129.jpeg?auto=compress&cs=tinysrgb&w=900"
                    alt="Friends gathered for a braai at Damview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative mt-8 h-72 overflow-hidden rounded-sm">
                  <Image
                    src="https://images.pexels.com/photos/4078164/pexels-photo-4078164.jpeg?auto=compress&cs=tinysrgb&w=900"
                    alt="Food at the Dam Food Bar"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Water / Adventure / Entertainment */}
      <section className="bg-street-charcoal py-24 lg:py-32">
        <Container>
          <h2 className="font-street mb-12 text-4xl leading-[0.95] text-street-cream sm:text-5xl">
            PICK YOUR THING.
          </h2>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-sm border-t-4 border-street-orange bg-street-ink p-7">
              <h3 className="font-street text-2xl text-street-orange">WATER</h3>
              <ul className="mt-5 space-y-3 text-sm text-street-cream/80">
                <li className="flex justify-between border-b border-street-cream/10 pb-3">
                  Boat cruises <span className="font-semibold text-street-cream">$5pp</span>
                </li>
                <li className="flex justify-between border-b border-street-cream/10 pb-3">
                  Pedal boats <span className="font-semibold text-street-cream">$3pp</span>
                </li>
                <li className="pb-1">Swimming pool</li>
              </ul>
            </div>
            <div className="rounded-sm border-t-4 border-street-lime bg-street-ink p-7">
              <h3 className="font-street text-2xl text-street-lime">ADVENTURE</h3>
              <ul className="mt-5 space-y-3 text-sm text-street-cream/80">
                <li className="border-b border-street-cream/10 pb-3">Horse riding</li>
                <li className="border-b border-street-cream/10 pb-3">Quad bikes</li>
                <li className="border-b border-street-cream/10 pb-3">Zipline</li>
                <li className="border-b border-street-cream/10 pb-3">Soccer field</li>
                <li className="pb-1">Trampolines</li>
              </ul>
            </div>
            <div className="rounded-sm border-t-4 border-street-pink bg-street-ink p-7">
              <h3 className="font-street text-2xl text-street-pink">ENTERTAINMENT</h3>
              <ul className="mt-5 space-y-3 text-sm text-street-cream/80">
                <li className="border-b border-street-cream/10 pb-3">Resident DJ</li>
                <li className="border-b border-street-cream/10 pb-3">Dance floors</li>
                <li className="pb-1">Pool tables</li>
              </ul>
            </div>
          </div>
          <p className="mt-8 text-sm text-street-cream/60">
            Most activities start from $3 per person.
          </p>
        </Container>
      </section>

      {/* Accommodation — deliberately clean, contrasting the graffiti identity */}
      <section className="bg-street-cream py-24 lg:py-32">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-street-ink/50">
                Accommodation
              </span>
              <h2 className="font-serif mt-3 text-4xl font-light leading-[1.1] text-street-ink sm:text-5xl">
                Stay a little longer.
              </h2>
              <p className="mt-6 text-[1.02rem] leading-[1.75] text-street-ink/70">
                32 rooms, from ${Math.min(...roomBlocks.map((b) => b.ratePerStay))} a stay or $
                {LODGE_HOURLY_RATE} an hour. A welcoming place to unwind, whether it&apos;s a
                short break or an overnight visit.
              </p>
              <Link
                href="/accommodation"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-street-ink transition-colors hover:text-street-orange"
              >
                <span className="link-underline">Explore Accommodation</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {roomBlocks.map((block) => (
                  <Link
                    key={block.id}
                    href={`/accommodation/${block.id}`}
                    className="flex items-center justify-between gap-4 rounded-sm border border-street-ink/10 bg-white/60 p-5 transition-colors hover:border-street-orange"
                  >
                    <div>
                      <h3 className="font-serif text-lg text-street-ink">{block.displayName}</h3>
                      <p className="mt-1 text-xs text-street-ink/55">
                        {block.roomNumbers.length} rooms &middot; {block.stayDurationHours}hr stay
                      </p>
                    </div>
                    <span className="font-street text-xl text-street-orange">${block.ratePerStay}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Events */}
      <section className="relative py-24 lg:py-32">
        <Image
          src="https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="A celebration at Damview Resort"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-street-ink/80" />
        <Container className="relative flex flex-col items-center gap-6 text-center">
          <h2 className="font-street text-4xl leading-[0.95] text-street-cream text-balance sm:text-5xl lg:text-6xl">
            MAKE IT A<br />
            <span className="text-street-lime">DAMVIEW MOMENT.</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {EVENT_CATEGORIES.map((category) => (
              <span
                key={category}
                className="rounded-sm border border-street-cream/30 px-4 py-1.5 text-sm text-street-cream"
              >
                {category}
              </span>
            ))}
          </div>
          <WhatsAppButton
            label="Enquire About Your Event"
            message="Hi, I'd like to enquire about hosting an event at Damview Resort."
            className="mt-2 rounded-sm bg-street-orange px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-street-ink hover:bg-street-lime"
          />
        </Container>
      </section>

      {/* Entrance fees poster */}
      <section className="grid grid-cols-1 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-2 bg-street-orange px-8 py-16 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-street-ink/70">Weekdays</span>
          <span className="font-street text-7xl text-street-ink sm:text-8xl">${ENTRANCE_FEE.weekday}</span>
          <span className="text-sm font-semibold uppercase tracking-wide text-street-ink/80">Per Person</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 bg-street-lime px-8 py-16 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-street-ink/70">
            Weekends &amp; Public Holidays
          </span>
          <span className="font-street text-7xl text-street-ink sm:text-8xl">${ENTRANCE_FEE.weekend}</span>
          <span className="text-sm font-semibold uppercase tracking-wide text-street-ink/80">Per Person</span>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="relative overflow-hidden bg-street-ink">
        <Container className="relative py-24 lg:py-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="font-street text-4xl leading-[0.95] text-street-cream sm:text-5xl">
                YOUR NEXT GOOD
                <br />
                DAY STARTS HERE.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-street-cream/75">
                Come through, bring your people and experience Damview.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCATION)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-street-lime px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-street-ink transition-all duration-300 hover:bg-white"
                >
                  <Navigation size={16} />
                  Get Directions
                </a>
                <WhatsAppButton
                  label="Make a Booking"
                  className="rounded-sm border-2 border-street-cream/40 bg-transparent px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-street-cream hover:border-street-lime hover:bg-street-lime hover:text-street-ink"
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full rounded-sm border border-street-cream/15 bg-street-cream/[0.05] p-7 lg:p-9">
                <div className="mb-7 flex items-start gap-4 border-b border-street-cream/15 pb-7">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-street-orange" />
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-street-cream/55">Location</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-street-cream">{LOCATION}</p>
                  </div>
                </div>

                <ul className="space-y-5">
                  <li className="flex items-center gap-4">
                    <Phone size={18} className="shrink-0 text-street-orange" />
                    <a href={`tel:+${CONTACT_NUMBERS.primary}`} className="text-sm text-street-cream transition-colors hover:text-street-lime">
                      077 444 6001
                    </a>
                  </li>
                  <li className="flex items-center gap-4">
                    <MessageCircle size={18} className="shrink-0 text-street-orange" />
                    <a
                      href={buildWhatsAppUrl(CONTACT_NUMBERS.secondary, "Hi, I'd like to enquire about Damview Resort.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-street-cream transition-colors hover:text-street-lime"
                    >
                      WhatsApp 077 444 6004
                    </a>
                  </li>
                  <li className="flex items-center gap-4">
                    <Clock size={18} className="shrink-0 text-street-orange" />
                    <span className="text-sm text-street-cream">Open 24 hours, every day</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
