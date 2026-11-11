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
  CalendarCheck,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { FacebookIcon } from "@/components/shared/FacebookIcon";
import {
  SITE_NAME,
  TAGLINE,
  LOCATION,
  CONTACT_NUMBERS,
  EVENT_CATEGORIES,
  ENTRANCE_FEE,
  LODGE_HOURLY_RATE,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { getRoomBlocks } from "@/lib/data/rooms";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const EXPERIENCES = [
  {
    no: "01",
    title: "Relax",
    copy: "Swimming, peaceful outdoor spaces, comfortable lodges and time away from everyday routines.",
    img: "https://images.pexels.com/photos/6821435/pexels-photo-6821435.jpeg?auto=compress&cs=tinysrgb&w=1100",
    href: "/accommodation",
    span: "lg:col-span-7 lg:row-span-2",
    h: "h-[26rem] lg:h-full",
  },
  {
    no: "02",
    title: "Explore",
    copy: "Boat cruises, pedal boats, quad bikes and outdoor activities on and off the water.",
    img: "https://images.pexels.com/photos/36593940/pexels-photo-36593940.jpeg?auto=compress&cs=tinysrgb&w=1100",
    href: "/activities",
    span: "lg:col-span-5",
    h: "h-72 lg:h-80",
  },
  {
    no: "03",
    title: "Celebrate",
    copy: "Good food, drinks, entertainment and memorable occasions with friends and family.",
    img: "https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=1100",
    href: "/events",
    span: "lg:col-span-5",
    h: "h-72 lg:h-80",
  },
] as const;

const DINING_SHOTS = [
  "https://images.pexels.com/photos/37238864/pexels-photo-37238864.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/4078164/pexels-photo-4078164.jpeg?auto=compress&cs=tinysrgb&w=900",
];

const ROOM_SHOTS = [
  "/images/accommodation/real/room-3.jpg",
  "/images/accommodation/real/room-1.jpg",
  "/images/accommodation/real/room-4.jpg",
];

const ACTIVITY_SHOTS = [
  { img: "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=1100", label: "Quad bikes" },
  { img: "https://images.pexels.com/photos/38492716/pexels-photo-38492716.jpeg?auto=compress&cs=tinysrgb&w=1100", label: "Horse riding" },
  { img: "https://images.pexels.com/photos/28263612/pexels-photo-28263612.jpeg?auto=compress&cs=tinysrgb&w=1100", label: "Zip line" },
];

// Only real Damview photography we have right now - more to follow as it's taken.
const REAL_GALLERY = [
  { caption: "Our rooms", image: "/images/accommodation/real/room-1.jpg" },
  { caption: "Our rooms", image: "/images/accommodation/real/room-2.jpg" },
  { caption: "Our rooms", image: "/images/accommodation/real/room-3.jpg" },
  { caption: "Our rooms", image: "/images/accommodation/real/room-4.jpg" },
];

export default async function HomePage() {
  const roomBlocks = await getRoomBlocks();

  return (
    <>
      {/* Hero */}
      <section id="home" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-green-900">
        <div className="absolute inset-0">
          <Image
            src="/images/resort/damview-sunset-2.jpg"
            alt="Sunset over the water at Damview, framed by the real trees on-site"
            fill
            priority
            className="hero-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/60 via-green-900/15 to-green-900/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </div>

        <Container className="relative z-10 flex h-full flex-col justify-end pb-20 lg:pb-28">
          <div className="max-w-3xl">
            <div className="reveal mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cream-50/30 bg-black/15 px-4 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-cream-50 backdrop-blur-sm">
                <MapPin size={13} className="text-sunset-500" />
                Chikwanha, Chitungwiza
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-sunset-500 px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-green-900">
                <Clock size={13} />
                Open 24 Hours
              </span>
            </div>

            <h1 className="reveal reveal-delay-1 font-serif text-[3rem] font-light leading-[1.02] text-cream-50 text-balance sm:text-7xl lg:text-[5.2rem]">
              {SITE_NAME}
            </h1>

            <p className="reveal reveal-delay-2 mt-6 max-w-xl text-base leading-relaxed text-cream-100/90 sm:text-lg">
              {TAGLINE} Good food, outdoor adventure, relaxation and unforgettable moments,
              just off Seke Road, on the water.
            </p>

            <div className="reveal reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/accommodation"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-sm font-semibold text-green-900 transition-all duration-300 hover:bg-white hover:shadow-xl"
              >
                Make a Booking
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-50/45 bg-green-900/20 px-7 py-3.5 text-sm font-semibold text-cream-50 backdrop-blur-sm transition-all duration-300 hover:border-cream-50/80 hover:bg-green-900/40"
              >
                Explore Damview
              </Link>
            </div>
          </div>
        </Container>

        <div className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <span className="text-[0.62rem] uppercase tracking-[0.3em] text-cream-50/70">Scroll</span>
          <span className="flex h-10 w-[22px] justify-center rounded-full border border-cream-50/40 pt-1.5">
            <span className="h-1.5 w-1 animate-bounce rounded-full bg-cream-50/80" />
          </span>
        </div>
      </section>

      {/* Introduction */}
      <section id="about" className="bg-cream-50 py-24 lg:py-36">
        <Container>
          <div className="reveal mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-sunset-500" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-green-700">
              Welcome to Damview
            </span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="reveal font-serif text-3xl font-light leading-[1.12] text-green-900 text-balance sm:text-4xl lg:text-[2.9rem]">
                Your place to unwind, connect and enjoy.
              </h2>
              <p className="reveal reveal-delay-1 mt-7 text-[1.02rem] leading-[1.75] text-charcoal/75">
                Whether you&apos;re visiting for a relaxing afternoon, spending time with family,
                enjoying an outing with friends or planning a special occasion, Damview brings
                together the experiences that make time well spent.
              </p>
              <div className="reveal reveal-delay-2 mt-8 flex flex-wrap gap-x-10 gap-y-4">
                {[
                  ["24/7", "Open every day"],
                  ["6+", "Outdoor activities"],
                  ["4", "Accommodation blocks"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="font-serif text-3xl font-medium text-green-800">{n}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-charcoal/55">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="reveal reveal-delay-1 relative h-80 overflow-hidden rounded-sm lg:h-[34rem]">
                <Image
                  src="/images/resort/pool-damside.jpg"
                  alt="The real pool and pavilion at Damview Resort"
                  fill
                  className="object-cover transition-transform duration-[1.2s] hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 via-transparent to-transparent" />
                <p className="absolute bottom-6 left-6 right-6 font-serif text-xl font-light text-cream-50 sm:text-2xl">
                  &quot;Good times, great views, right here in Chitungwiza.&quot;
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Experience bento grid */}
      <section className="bg-green-900 py-24 lg:py-36">
        <Container>
          <div className="mb-14">
            <div className="reveal mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-sunset-500" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cream-100/70">
                The Damview Experience
              </span>
            </div>
            <h2 className="reveal reveal-delay-1 max-w-2xl font-serif text-3xl font-light leading-[1.12] text-cream-50 text-balance sm:text-4xl lg:text-[2.9rem]">
              There&apos;s more to enjoy at Damview.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-2">
            {EXPERIENCES.map((exp) => (
              <Link
                key={exp.no}
                href={exp.href}
                className={`reveal group relative overflow-hidden rounded-sm bg-green-800 ${exp.span} ${exp.h}`}
              >
                <Image src={exp.img} alt={exp.title} fill className="object-cover transition-transform duration-[1.3s] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/30 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-7 lg:p-8">
                  <span className="mb-2 font-serif text-sm font-light tracking-widest text-cream-100/70">{exp.no}</span>
                  <h3 className="font-serif text-2xl font-medium text-cream-50 lg:text-3xl">{exp.title}</h3>
                  <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-cream-100/80">{exp.copy}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sunset-500 opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100">
                    Discover <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Accommodation */}
      <section id="accommodation" className="bg-cream-100 py-24 lg:py-36">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="reveal mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-sunset-500" />
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-green-700">
                  Accommodation
                </span>
              </div>
              <h2 className="reveal reveal-delay-1 font-serif text-3xl font-light leading-[1.12] text-green-900 text-balance sm:text-4xl lg:text-[2.9rem]">
                Find Your Stay.
              </h2>
              <p className="reveal reveal-delay-2 mt-6 text-[1.02rem] leading-[1.75] text-charcoal/75">
                From ${Math.min(...roomBlocks.map((b) => b.ratePerStay))} a stay or ${LODGE_HOURLY_RATE} an hour,
                across our A, B, F and R blocks. A welcoming place to unwind, whether it&apos;s a short
                break or an overnight visit.
              </p>
              <Link
                href="/accommodation"
                className="reveal reveal-delay-3 mt-8 inline-flex items-center gap-2 text-sm font-semibold text-green-800 transition-colors hover:text-green-600"
              >
                <span className="link-underline">Explore Accommodation</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4">
                <div className="reveal reveal-delay-1 col-span-2 overflow-hidden rounded-sm">
                  <Image src={ROOM_SHOTS[0]} alt="A Damview lodge room" width={1280} height={500} className="h-64 w-full object-cover transition-transform duration-[1.2s] hover:scale-105 sm:h-72" />
                </div>
                <div className="reveal reveal-delay-2 overflow-hidden rounded-sm">
                  <Image src={ROOM_SHOTS[1]} alt="A Damview lodge room, alternate view" width={640} height={400} className="h-52 w-full object-cover transition-transform duration-[1.2s] hover:scale-105" />
                </div>
                <div className="reveal reveal-delay-3 overflow-hidden rounded-sm">
                  <Image src={ROOM_SHOTS[2]} alt="A Damview lodge room, rustic interior" width={640} height={400} className="h-52 w-full object-cover transition-transform duration-[1.2s] hover:scale-105" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Dining */}
      <section id="dining" className="bg-cream-50 py-24 lg:py-36">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div className="grid grid-cols-2 gap-4">
                {DINING_SHOTS.map((src, i) => (
                  <div key={src} className={`reveal reveal-delay-${i + 1} overflow-hidden rounded-sm`}>
                    <Image src={src} alt="Food and drinks" width={700} height={560} className="h-64 w-full object-cover transition-transform duration-[1.2s] hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5">
              <div className="reveal mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-sunset-500" />
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-green-700">
                  Bar &amp; Restaurant
                </span>
              </div>
              <h2 className="reveal reveal-delay-1 font-serif text-3xl font-light leading-[1.12] text-green-900 text-balance sm:text-4xl lg:text-[2.9rem]">
                Dam Food Bar.
              </h2>
              <p className="reveal reveal-delay-2 mt-6 text-[1.02rem] leading-[1.75] text-charcoal/75">
                Fully stocked bars, wine specials and a braai that doesn&apos;t stop: Rib Burger,
                1/4 Chicken &amp; Chips, Sadza &amp; Chicken, and more.
              </p>
              <Link
                href="/restaurant"
                className="reveal reveal-delay-3 mt-8 inline-flex items-center gap-2 text-sm font-semibold text-green-800 transition-colors hover:text-green-600"
              >
                <span className="link-underline">See Menu</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Activities */}
      <section id="activities" className="bg-green-900 py-24 lg:py-36">
        <Container>
          <div className="mb-14 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="reveal mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-sunset-500" />
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cream-100/70">
                  Recreational Activities
                </span>
              </div>
              <h2 className="reveal reveal-delay-1 max-w-2xl font-serif text-3xl font-light leading-[1.12] text-cream-50 text-balance sm:text-4xl lg:text-[2.9rem]">
                Find your fun.
              </h2>
            </div>
            <Link
              href="/activities"
              className="reveal reveal-delay-2 inline-flex items-center gap-2 text-sm font-semibold text-sunset-500 hover:text-sunset-600"
            >
              <span className="link-underline">See all activities</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ACTIVITY_SHOTS.map((activity, i) => (
              <div key={activity.label} className={`reveal reveal-delay-${i + 1} group relative h-72 overflow-hidden rounded-sm`}>
                <Image src={activity.img} alt={activity.label} fill className="object-cover transition-transform duration-[1.3s] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/10 to-transparent" />
                <span className="absolute bottom-5 left-5 font-serif text-xl text-cream-50">{activity.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Events */}
      <section id="events" className="relative py-24 lg:py-36">
        <Image
          src="https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="A celebration"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-green-900/80" />
        <Container className="relative flex flex-col items-center gap-5 text-center">
          <div className="reveal mb-1 flex items-center gap-3">
            <span className="h-px w-10 bg-sunset-500" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cream-100/70">
              Events &amp; Celebrations
            </span>
            <span className="h-px w-10 bg-sunset-500" />
          </div>
          <h2 className="reveal reveal-delay-1 font-serif text-3xl font-light text-cream-50 text-balance sm:text-4xl">
            Damview isn&apos;t just a place to visit. It&apos;s a place to celebrate.
          </h2>
          <p className="reveal reveal-delay-2 max-w-md text-sm leading-relaxed text-cream-100/80">
            Our pool, gazebos, bars and open grounds set the scene for your celebration, grounded
            in what Damview actually offers.
          </p>
          <div className="reveal reveal-delay-2 flex flex-wrap justify-center gap-2">
            {EVENT_CATEGORIES.map((category) => (
              <span key={category} className="rounded-full border border-cream-50/35 px-4 py-1.5 text-sm text-cream-50">
                {category}
              </span>
            ))}
          </div>
          <Link
            href="/events"
            className="reveal reveal-delay-3 mt-3 inline-flex items-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-sm font-semibold text-green-900 transition-all duration-300 hover:bg-white hover:shadow-xl"
          >
            Plan Your Event <ArrowUpRight size={16} />
          </Link>
        </Container>
      </section>

      {/* Gallery */}
      <section className="bg-cream-50 py-24 lg:py-36">
        <Container>
          <div className="mb-14 text-center">
            <div className="reveal mx-auto mb-5 flex w-fit items-center gap-3">
              <span className="h-px w-10 bg-sunset-500" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-green-700">Gallery</span>
              <span className="h-px w-10 bg-sunset-500" />
            </div>
            <h2 className="reveal reveal-delay-1 font-serif text-3xl font-light leading-[1.12] text-green-900 text-balance sm:text-4xl lg:text-[2.9rem]">
              A glimpse of Damview.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {REAL_GALLERY.map((item, i) => (
              <figure key={item.image} className={`reveal reveal-delay-${(i % 3) + 1} group relative aspect-square overflow-hidden rounded-sm`}>
                <Image src={item.image} alt={item.caption} fill className="object-cover transition-transform duration-[1.3s] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-green-900/0 transition-colors duration-500 group-hover:bg-green-900/15" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-green-900/60 px-2 py-1.5 text-center text-xs font-medium text-cream-50">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-600">
              <span className="link-underline">See the full gallery &amp; reviews</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </Container>
      </section>

      {/* Location & final CTA */}
      <section id="contact" className="relative overflow-hidden bg-green-900">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/1502311/pexels-photo-1502311.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Warm countryside atmosphere"
            fill
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 via-green-900/70 to-green-900/90" />
        </div>

        <Container className="relative py-24 lg:py-36">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="reveal mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-sunset-500" />
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cream-100/70">
                  Visit Damview
                </span>
              </div>
              <h2 className="reveal reveal-delay-1 font-serif text-3xl font-light leading-[1.1] text-cream-50 text-balance sm:text-4xl lg:text-[3.4rem]">
                Your next good day<br />starts here.
              </h2>
              <p className="reveal reveal-delay-2 mt-6 max-w-md text-lg leading-relaxed text-cream-100/80">
                Come through, bring your people and experience Damview.
              </p>

              <div className="reveal reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCATION)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-sm font-semibold text-green-900 transition-all duration-300 hover:bg-white hover:shadow-xl"
                >
                  <Navigation size={16} />
                  Get Directions
                </a>
                <WhatsAppButton
                  label="Make a Booking"
                  className="rounded-full border border-cream-50/40 bg-green-900/30 px-7 py-3.5 text-sm font-semibold text-cream-50 backdrop-blur-sm hover:border-cream-50/80 hover:bg-green-800/50"
                />
              </div>
            </div>

            <div className="reveal reveal-delay-2 flex items-center">
              <div className="w-full rounded-sm border border-cream-50/15 bg-cream-50/[0.06] p-7 backdrop-blur-md lg:p-9">
                <div className="mb-7 flex items-start gap-4 border-b border-cream-50/15 pb-7">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-sunset-500" />
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-cream-100/60">Location</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-cream-50">{LOCATION}</p>
                  </div>
                </div>

                <ul className="space-y-5">
                  <li className="flex items-center gap-4">
                    <Phone size={18} className="shrink-0 text-sunset-500" />
                    <a href={`tel:+${CONTACT_NUMBERS.primary}`} className="text-sm text-cream-50 transition-colors hover:text-sunset-500">
                      077 444 6001
                    </a>
                  </li>
                  <li className="flex items-center gap-4">
                    <MessageCircle size={18} className="shrink-0 text-sunset-500" />
                    <a
                      href={buildWhatsAppUrl(CONTACT_NUMBERS.secondary, "Hi, I'd like to enquire about Damview Resort.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cream-50 transition-colors hover:text-sunset-500"
                    >
                      WhatsApp 077 444 6004
                    </a>
                  </li>
                  <li className="flex items-center gap-4">
                    <Clock size={18} className="shrink-0 text-sunset-500" />
                    <span className="text-sm text-cream-50">Open 24 hours, every day</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CalendarCheck size={18} className="shrink-0 text-sunset-500" />
                    <span className="text-sm text-cream-50">
                      Entrance ${ENTRANCE_FEE.weekday} weekdays, ${ENTRANCE_FEE.weekend} weekends &amp; holidays
                    </span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="shrink-0 text-sunset-500"><FacebookIcon size={18} /></span>
                    <a
                      href={SOCIAL_LINKS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cream-50 transition-colors hover:text-sunset-500"
                    >
                      Follow us on Facebook
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="reveal mt-12 overflow-hidden rounded-sm border border-cream-50/15">
            <iframe
              title="Damview Resort on Google Maps"
              src={`https://www.google.com/maps?q=${encodeURIComponent(LOCATION)}&output=embed`}
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
