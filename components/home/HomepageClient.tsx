"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { LOCATION, CONTACT_NUMBERS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const ROOMS = [
  {
    id: "a",
    name: "Garden Rooms",
    block: "A Block",
    price: 25,
    img: "/images/accommodation/real/room-1.jpg",
    alt: "Garden Room interior",
  },
  {
    id: "b",
    name: "Poolside Rooms",
    block: "B Block",
    price: 30,
    img: "/images/accommodation/real/room-4.jpg",
    alt: "Poolside Room interior",
  },
  {
    id: "f",
    name: "Premier Rooms",
    block: "F Block",
    price: 35,
    img: "/images/accommodation/real/room-3.jpg",
    alt: "Premier Room interior",
  },
  {
    id: "r",
    name: "Riverside Rooms",
    block: "R Block",
    price: 25,
    img: "/images/accommodation/real/room-2.jpg",
    alt: "Riverside Room interior",
  },
];

export default function HomepageClient() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    Promise.all([
      import("gsap").then((m) => m.gsap ?? m.default),
      import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger ?? m.default),
      import("lenis").then((m) => m.default),
    ]).then(([gsap, ScrollTrigger, Lenis]) => {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);

      if (reduced) return;

      // Slow hero parallax
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          y: "18%",
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current.parentElement,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Fade-up reveals
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      return () => {
        lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });
  }, []);

  return (
    <>
      {/* ══ HERO — Casa Mare style ══════════════════════════════════════════ */}
      <section className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#0a1b12]">
        {/* Full-bleed photo */}
        <div
          ref={heroRef}
          className="absolute inset-0 scale-110"
          style={{ willChange: "transform" }}
        >
          <Image
            src="/images/resort/damview-water-4.jpg"
            alt="Still golden water at Damview Resort, Chitungwiza"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Very light vignette — let the photo breathe */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,27,18,0.28) 0%, rgba(10,27,18,0.08) 45%, rgba(10,27,18,0.55) 100%)",
          }}
        />

        {/* Centered name — Casa Mare style */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="mb-5 text-[0.6rem] font-semibold uppercase tracking-[0.38em] text-white/70">
            Chitungwiza, Zimbabwe
          </p>

          <h1
            className="font-serif font-light leading-[0.95] text-white"
            style={{ fontSize: "clamp(4rem, 14vw, 11rem)" }}
          >
            Damview
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <span className="h-px w-10 bg-white/40" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/60">
              Resort &amp; Dam
            </span>
            <span className="h-px w-10 bg-white/40" />
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 px-6">
          <Link
            href="/accommodation"
            className="rounded-full bg-white/90 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#0a1b12] backdrop-blur-sm transition-all hover:bg-white"
          >
            Book a Stay
          </Link>
          <Link
            href="/damside"
            className="rounded-full border border-white/50 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/10"
          >
            Explore
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 right-10 hidden flex-col items-center gap-2 lg:flex">
          <span className="h-10 w-px bg-white/30" aria-hidden="true" />
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/50">Scroll</span>
        </div>
      </section>

      {/* ══ INTRO ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#f4ebdd] py-24 lg:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p data-reveal className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                Where Chitungwiza meets the water
              </p>
              <h2
                data-reveal
                className="font-serif text-[2.4rem] font-light leading-[1.1] text-[#173d2b] text-balance lg:text-[3rem]"
              >
                More than a resort.
                <br />
                A living dam.
              </h2>
              <p data-reveal className="mt-7 text-base leading-[1.85] text-[#292b23]/70">
                Damview is built around water — a full dam with boat rides, a pool that
                overlooks it, four styles of lodge, a restaurant, a gym, football, pool
                tables, and an open bar. Everything on one site, right off Seke Road.
              </p>

              <div data-reveal className="mt-10 flex gap-10">
                {[["$2", "Entry from"], ["4", "Lodge blocks"], ["24/7", "Always open"]].map(
                  ([n, l]) => (
                    <div key={l} className="border-t-2 border-[#173d2b]/15 pt-4">
                      <div className="font-serif text-2xl font-medium text-[#173d2b]">{n}</div>
                      <div className="mt-1 text-[0.68rem] uppercase tracking-wide text-[#292b23]/50">
                        {l}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Pool shot — clean, photography first */}
            <div data-reveal className="relative h-[28rem] overflow-hidden rounded-sm lg:h-[36rem]">
              <Image
                src="/images/resort/pool-damside.jpg"
                alt="Damview pool pavilion with cocktail and thatched bar"
                fill
                className="object-cover object-center transition-transform duration-[1.5s] hover:scale-105"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute bottom-5 left-5 rounded-sm bg-[#173d2b]/85 px-4 py-2.5 backdrop-blur-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#c8923a]">
                  Pool &amp; Pavilion Bar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ DAM — full-bleed editorial strip ════════════════════════════════ */}
      <section className="relative h-[70vh] min-h-[400px] overflow-hidden bg-[#0a1b12]">
        <Image
          src="/images/resort/damview-sunset-2.jpg"
          alt="Sunset framed by riverside branches at Damview dam"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,27,18,0.78) 0%, rgba(10,27,18,0.2) 60%, rgba(10,27,18,0.0) 100%)",
          }}
        />
        <div className="relative flex h-full items-center px-8 lg:px-20">
          <div className="max-w-md">
            <p data-reveal className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#c8923a]">
              The Damside
            </p>
            <h2
              data-reveal
              className="font-serif text-3xl font-light leading-[1.1] text-white text-balance lg:text-[2.6rem]"
            >
              Boat rides, pedal boats
              <br />
              and golden-hour swims.
            </h2>
            <p data-reveal className="mt-5 text-base leading-[1.75] text-white/70">
              Cruises from $5 per person. Pedal boats, the pool, the bar — the
              dam is the centrepiece and everything works around it.
            </p>
            <Link
              data-reveal
              href="/damside"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-sm font-medium text-white transition-all hover:border-white hover:bg-white/10"
            >
              See the Damside <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ ROOMS ════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f9f7f1] py-24 lg:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p data-reveal className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                Accommodation
              </p>
              <h2
                data-reveal
                className="font-serif text-3xl font-light text-[#173d2b] lg:text-[2.6rem]"
              >
                Four ways to stay.
              </h2>
            </div>
            <Link
              data-reveal
              href="/accommodation"
              className="hidden items-center gap-2 text-sm font-semibold text-[#527c48] transition-colors hover:text-[#173d2b] lg:flex"
            >
              View all rooms <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ROOMS.map((room) => (
              <Link
                key={room.id}
                href={`/accommodation/${room.id}`}
                data-reveal
                className="group relative overflow-hidden rounded-sm bg-[#173d2b]"
                style={{ aspectRatio: "4/3" }}
              >
                <Image
                  src={room.img}
                  alt={room.alt}
                  fill
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(23,61,43,0.88) 0%, rgba(23,61,43,0.0) 55%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#c8923a]">
                    {room.block}
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-light text-white">{room.name}</h3>
                  <p className="mt-2 text-sm text-white/60">
                    From ${room.price}
                    <span className="ml-1 text-xs">/ 12-hr stay</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 lg:hidden">
            <Link
              href="/accommodation"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#527c48]"
            >
              View all rooms <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ EXPERIENCES ══════════════════════════════════════════════════════ */}
      <section className="bg-[#173d2b] py-24 lg:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-14">
            <p data-reveal className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
              Experiences
            </p>
            <h2 data-reveal className="font-serif text-3xl font-light text-[#faf6ee] lg:text-[2.6rem]">
              There&apos;s always something to do.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "On the Water",
                sub: "Boat cruises · Pedal boats",
                img: "/images/activities/real/boats.jpg",
                href: "/damside",
              },
              {
                title: "Pool & Play",
                sub: "Swimming · Football · Pool tables",
                img: "/images/resort/damview-water-1.jpg",
                href: "/activities",
              },
              {
                title: "Gym & Fitness",
                sub: "Open 24/7 · Full equipment",
                img: "/images/gym/real/gym-1.jpg",
                href: "/gym",
              },
            ].map((exp) => (
              <Link
                key={exp.title}
                href={exp.href}
                data-reveal
                className="group relative h-72 overflow-hidden rounded-sm bg-[#0f2419] lg:h-96"
              >
                <Image
                  src={exp.img}
                  alt={exp.title}
                  fill
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(10,27,18,0.90) 0%, rgba(10,27,18,0.0) 55%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#c8923a]">
                    {exp.sub}
                  </p>
                  <h3 className="font-serif text-xl font-light text-white">{exp.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#c8923a] opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100">
                    Explore <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DINING ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#f4ebdd] py-24 lg:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            {/* Stacked images */}
            <div data-reveal className="relative h-[32rem]">
              <div className="absolute right-0 top-0 h-[85%] w-[80%] overflow-hidden rounded-sm">
                <Image
                  src="/images/restaurant/real/exterior.jpg"
                  alt="Dam Food Bar exterior"
                  fill
                  className="object-cover"
                  sizes="40vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 h-[55%] w-[65%] overflow-hidden rounded-sm border-4 border-[#f4ebdd]">
                <Image
                  src="/images/restaurant/real/interior.jpg"
                  alt="Dam Food Bar interior"
                  fill
                  className="object-cover"
                  sizes="30vw"
                />
              </div>
            </div>

            <div>
              <p data-reveal className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                Dam Food Bar
              </p>
              <h2 data-reveal className="font-serif text-3xl font-light leading-[1.1] text-[#173d2b] lg:text-[2.6rem]">
                Eat well.
                <br />
                Drink well.
                <br />
                Stay a while.
              </h2>
              <p data-reveal className="mt-7 text-base leading-[1.85] text-[#292b23]/70">
                Full bar, wine specials, burgers, braai, Sadza and a menu that keeps up
                with a long day on the water. No rush — the dam isn&apos;t going anywhere.
              </p>
              <Link
                data-reveal
                href="/restaurant"
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#173d2b] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#527c48]"
              >
                View menu <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WATER STRIP ══════════════════════════════════════════════════════ */}
      <section className="relative h-[55vh] min-h-[340px] overflow-hidden bg-[#0a1b12]">
        <Image
          src="/images/resort/damview-water-3.jpg"
          alt="Calm sunset over the Damview dam"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0a1b12]/35" />
        <div className="relative flex h-full items-center justify-center px-6 text-center">
          <h2
            data-reveal
            className="font-serif text-3xl font-light text-white text-balance lg:text-[2.8rem]"
          >
            The water is always there.
            <br />
            <em className="not-italic text-[#c8923a]">
              The question is when you&apos;ll come.
            </em>
          </h2>
        </div>
      </section>

      {/* ══ EVENTS banner ════════════════════════════════════════════════════ */}
      <section className="bg-[#f9f7f1] py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div data-reveal>
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                Functions &amp; Events
              </p>
              <h2 className="font-serif text-2xl font-light text-[#173d2b] lg:text-3xl">
                Weddings, birthdays, graduations &amp; braais.
              </h2>
            </div>
            <Link
              data-reveal
              href="/events"
              className="inline-flex w-fit items-center gap-2.5 rounded-full bg-[#173d2b] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#527c48] whitespace-nowrap"
            >
              Plan an event <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ BOOK A STAY ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0a1b12] py-32 lg:py-44">
        <Image
          src="/images/resort/damview-water-2.jpg"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover object-center opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0a1b12]/50" />

        <div className="relative mx-auto max-w-xl px-6 text-center">
          <div data-reveal className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-[#c8923a]" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#c8923a]">
              Book a stay
            </span>
            <span className="h-px w-10 bg-[#c8923a]" />
          </div>

          <h2 data-reveal className="font-serif text-3xl font-light text-white text-balance lg:text-[2.8rem]">
            Come when you&apos;re ready.
          </h2>

          <p data-reveal className="mt-6 text-base leading-[1.8] text-white/65">
            Rooms from $25 per 12-hour stay. Walk-ins welcome subject to availability — or
            message us on WhatsApp.
          </p>

          <div data-reveal className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/accommodation"
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#0a1b12] transition-all hover:bg-[#f4ebdd]"
            >
              Check availability <ArrowRight size={15} />
            </Link>
            <a
              href={buildWhatsAppUrl(
                CONTACT_NUMBERS.primary,
                "Hi, I'd like to book a stay at Damview Resort."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/35 px-8 py-4 text-sm font-semibold text-white transition-all hover:border-white/70 hover:bg-white/10"
            >
              <MessageCircle size={14} />
              WhatsApp us
            </a>
          </div>

          <p data-reveal className="mt-10 flex items-center justify-center gap-1.5 text-xs text-white/40">
            <MapPin size={11} />
            {LOCATION}
          </p>

          <div data-reveal className="mt-6 flex items-center justify-center gap-6">
            <a
              href={`tel:+${CONTACT_NUMBERS.primary}`}
              className="flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white/80"
            >
              <Phone size={12} />
              077 444 6001
            </a>
            <span className="h-3 w-px bg-white/20" />
            <a
              href={`tel:+${CONTACT_NUMBERS.secondary}`}
              className="flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-white/80"
            >
              <Phone size={12} />
              077 444 6004
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
