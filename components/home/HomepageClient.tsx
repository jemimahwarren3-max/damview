"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown, MapPin, MessageCircle, Phone, Clock, Navigation, CalendarCheck } from "lucide-react";
import { LOCATION, CONTACT_NUMBERS, ENTRANCE_FEE, SOCIAL_LINKS } from "@/lib/constants";
import { FacebookIcon } from "@/components/shared/FacebookIcon";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Scroll experiences — left text, right image cycling
const SCROLL_SCENES = [
  {
    label: "On the Water",
    heading: "Paddle boats,\nboat cruises,\ngolden hour.",
    sub: "From $5 per person. The whole dam is yours.",
    img: "/images/activities/real/boats.jpg",
    href: "/damside",
    cta: "See the Damside",
  },
  {
    label: "The Pool",
    heading: "Cold drink.\nWarm sun.\nNo rush.",
    sub: "The pool looks right out over the dam.",
    img: "/images/resort/pool-damside.jpg",
    href: "/activities",
    cta: "Explore Activities",
  },
  {
    label: "The View",
    heading: "Still water.\nOpen sky.\nQuite a sight.",
    sub: "Chitungwiza's best-kept secret is right here.",
    img: "/images/resort/damview-water-1.jpg",
    href: "/accommodation",
    cta: "Book a Stay",
  },
  {
    label: "Eat & Drink",
    heading: "Dam Food Bar.\nFull bar.\nAll day.",
    sub: "Burgers, braai, Castle Lite, wine specials.",
    img: "/images/resort/damview-water-3.jpg",
    href: "/restaurant",
    cta: "View Menu",
  },
];

const ROOMS = [
  { id: "a", name: "Garden Rooms", block: "A Block", price: 25, img: "/images/accommodation/real/room-1.jpg", pos: "center 25%" },
  { id: "b", name: "Poolside Rooms", block: "B Block", price: 30, img: "/images/accommodation/real/room-4.jpg", pos: "center 20%" },
  { id: "f", name: "Premier Rooms", block: "F Block", price: 35, img: "/images/accommodation/real/room-3.jpg", pos: "center 30%" },
  { id: "r", name: "Riverside Rooms", block: "R Block", price: 25, img: "/images/accommodation/real/room-2.jpg", pos: "center 25%" },
];

export default function HomepageClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollSectionRef = useRef<HTMLElement>(null);
  const rightImgsRef = useRef<HTMLDivElement[]>([]);
  const leftTextsRef = useRef<HTMLDivElement[]>([]);
  const dotsRef = useRef<HTMLButtonElement[]>([]);

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

      // Hero slow parallax
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          y: "20%",
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
        gsap.fromTo(el, { opacity: 0, y: 32 }, {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        });
      });

      // ── Scroll-driven split section (desktop only) ──────────────────────
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const imgs = rightImgsRef.current;
        const texts = leftTextsRef.current;
        const dots = dotsRef.current;
        const n = SCROLL_SCENES.length;

        // Initial state
        gsap.set(imgs.slice(1), { opacity: 0 });
        gsap.set(texts.slice(1), { opacity: 0, y: 24 });

        const tl = gsap.timeline({ paused: true });
        for (let i = 0; i < n - 1; i++) {
          tl.to(imgs[i], { opacity: 0, duration: 0.6, ease: "power2.inOut" }, i * 1.2)
            .fromTo(imgs[i + 1], { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.inOut" }, i * 1.2)
            .to(texts[i], { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, i * 1.2)
            .fromTo(texts[i + 1], { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, i * 1.2 + 0.3);
        }

        ScrollTrigger.create({
          trigger: scrollSectionRef.current,
          start: "top top",
          end: `+=${(n - 1) * window.innerHeight * 1.4}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          animation: tl,
          onUpdate: (self) => {
            const idx = Math.min(Math.round(self.progress * (n - 1)), n - 1);
            dots.forEach((d, i) => {
              d.style.opacity = i === idx ? "1" : "0.3";
              d.style.width = i === idx ? "2rem" : "0.375rem";
            });
          },
        });

        return () => {};
      });

      return () => {
        lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
        mm.revert();
      };
    });
  }, []);

  return (
    <>
      {/* ══ HERO — BLOOM-style "DAMVIEW" clipped through image ═════════════ */}
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#1a0e05]">
        {/* Background photo */}
        <div
          ref={heroRef}
          className="absolute inset-0 scale-110"
          style={{ willChange: "transform" }}
        >
          <Image
            src="/images/resort/damview-dam-panorama.jpg"
            alt="Golden sunset over the Damview dam, Chitungwiza"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Dark gradient — heavier at top/bottom, open in middle so the water shows */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,8,5,0.60) 0%, rgba(10,8,5,0.08) 40%, rgba(10,8,5,0.08) 60%, rgba(10,8,5,0.72) 100%)",
          }}
        />

        {/* Huge "Damview" — one word, white */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
          <h1
            className="text-white text-center"
            style={{
              fontSize: "clamp(5rem, 18vw, 16rem)",
              fontFamily: "var(--font-serif, Georgia, serif)",
              fontWeight: "300",
              lineHeight: "1",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 40px rgba(0,0,0,0.25)",
            }}
          >
            Damview
          </h1>
        </div>

        {/* Top label */}
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-10">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.38em] text-white/70">
            Chitungwiza · Zimbabwe · Resort &amp; Dam
          </p>
        </div>

        {/* Bottom CTAs + scroll arrow */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-5 pb-10">
          <div className="flex gap-3">
            <Link
              href="/accommodation"
              className="pointer-events-auto rounded-full bg-white/90 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#1a0e05] backdrop-blur-sm transition-all hover:bg-white"
            >
              Book a Stay
            </Link>
            <Link
              href="/damside"
              className="pointer-events-auto rounded-full border border-white/50 px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/10"
            >
              Explore
            </Link>
          </div>
          <div className="pointer-events-auto flex flex-col items-center gap-1 opacity-60">
            <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white">Scroll</span>
            <ArrowDown size={14} className="animate-bounce text-white" />
          </div>
        </div>
      </section>

      {/* ══ SCROLL-DRIVEN SPLIT — left text, right image cycling ════════════ */}
      <section
        ref={scrollSectionRef}
        className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#0f1f14]"
        aria-label="Damview experiences"
      >
        {/* Right: stacked images */}
        <div className="absolute inset-0 md:left-[45%]">
          {SCROLL_SCENES.map((scene, i) => (
            <div
              key={scene.label}
              ref={(el) => { if (el) rightImgsRef.current[i] = el; }}
              className="absolute inset-0"
              style={{ willChange: "opacity" }}
            >
              <Image
                src={scene.img}
                alt={scene.heading.replace(/\n/g, " ")}
                fill
                className="object-cover object-center"
                sizes="(min-width: 768px) 55vw, 100vw"
                priority={i === 0}
              />
              {/* Left edge fade to blend with text panel */}
              <div
                className="absolute inset-0 hidden md:block"
                style={{
                  background:
                    "linear-gradient(to right, rgba(15,31,20,1) 0%, rgba(15,31,20,0.4) 25%, rgba(15,31,20,0) 55%)",
                }}
              />
              {/* Mobile overlay */}
              <div
                className="absolute inset-0 md:hidden"
                style={{ background: "rgba(15,31,20,0.65)" }}
              />
            </div>
          ))}
        </div>

        {/* Left: stacked text panels */}
        <div className="absolute inset-0 flex items-center md:w-[55%]">
          <div className="relative w-full px-8 lg:px-16">
            {SCROLL_SCENES.map((scene, i) => (
              <div
                key={scene.label}
                ref={(el) => { if (el) leftTextsRef.current[i] = el; }}
                className="absolute inset-x-0 px-8 lg:px-16"
                style={{ willChange: "opacity, transform" }}
              >
                <p className="mb-4 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#c8923a]">
                  {scene.label}
                </p>
                <h2
                  className="font-serif font-light text-white"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", lineHeight: 1.08 }}
                >
                  {scene.heading.split("\n").map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < scene.heading.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </h2>
                <p className="mt-5 text-sm leading-[1.75] text-white/60 max-w-xs">
                  {scene.sub}
                </p>
                <Link
                  href={scene.href}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all hover:border-white hover:bg-white/10"
                >
                  {scene.cta} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-10 left-8 z-20 flex items-center gap-2 lg:left-16">
          {SCROLL_SCENES.map((_, i) => (
            <button
              key={i}
              ref={(el) => { if (el) dotsRef.current[i] = el; }}
              aria-label={`Scene ${i + 1}`}
              className="h-1 rounded-full bg-white transition-all duration-500"
              style={{ width: i === 0 ? "2rem" : "0.375rem", opacity: i === 0 ? 1 : 0.3 }}
            />
          ))}
        </div>
      </section>

      {/* ══ INTRO ════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f4ebdd] py-24 lg:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p data-reveal className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                Where Chitungwiza meets the water
              </p>
              <h2 data-reveal className="font-serif text-[2.4rem] font-light leading-[1.1] text-[#173d2b] text-balance lg:text-[3rem]">
                More than a resort.
                <br />A living dam.
              </h2>
              <p data-reveal className="mt-7 text-base leading-[1.85] text-[#292b23]/70">
                Damview is built around water — a full dam with boat rides, a pool that
                overlooks it, four styles of lodge, a restaurant, a gym, football, pool
                tables, and an open bar. Everything on one site, right off Seke Road.
              </p>
              <div data-reveal className="mt-10 flex gap-10">
                {[["$2", "Entry from"], ["4", "Lodge blocks"], ["24/7", "Always open"]].map(([n, l]) => (
                  <div key={l} className="border-t-2 border-[#173d2b]/15 pt-4">
                    <div className="font-serif text-2xl font-medium text-[#173d2b]">{n}</div>
                    <div className="mt-1 text-[0.68rem] uppercase tracking-wide text-[#292b23]/50">{l}</div>
                  </div>
                ))}
              </div>
            </div>
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

      {/* ══ ROOMS ════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f9f7f1] py-24 lg:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p data-reveal className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                Accommodation
              </p>
              <h2 data-reveal className="font-serif text-3xl font-light text-[#173d2b] lg:text-[2.6rem]">
                Four ways to stay.
              </h2>
            </div>
            <Link data-reveal href="/accommodation" className="hidden items-center gap-2 text-sm font-semibold text-[#527c48] hover:text-[#173d2b] lg:flex">
              View all <ArrowRight size={14} />
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
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                  style={{ objectPosition: room.pos }}
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(23,61,43,0.88) 0%, rgba(23,61,43,0.0) 55%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#c8923a]">{room.block}</p>
                  <h3 className="mt-1 font-serif text-xl font-light text-white">{room.name}</h3>
                  <p className="mt-2 text-sm text-white/60">From ${room.price}<span className="ml-1 text-xs">/ 12-hr stay</span></p>
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
            <div data-reveal className="relative h-[32rem]">
              <div className="absolute right-0 top-0 h-[85%] w-[80%] overflow-hidden rounded-sm">
                <Image src="/images/restaurant/real/exterior.jpg" alt="Dam Food Bar exterior" fill className="object-cover" sizes="40vw" />
              </div>
              <div className="absolute bottom-0 left-0 h-[55%] w-[65%] overflow-hidden rounded-sm border-4 border-[#f4ebdd]">
                <Image src="/images/restaurant/real/interior.jpg" alt="Dam Food Bar interior" fill className="object-cover" sizes="30vw" />
              </div>
            </div>
            <div>
              <p data-reveal className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">Dam Food Bar</p>
              <h2 data-reveal className="font-serif text-3xl font-light leading-[1.1] text-[#173d2b] lg:text-[2.6rem]">
                Eat well.<br />Drink well.<br />Stay a while.
              </h2>
              <p data-reveal className="mt-7 text-base leading-[1.85] text-[#292b23]/70">
                Full bar, wine specials, burgers, braai, Sadza and a menu that keeps up with a long day on the water.
              </p>
              <Link data-reveal href="/restaurant" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#173d2b] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#527c48]">
                View menu <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ GALLERY ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#f4ebdd] py-24 lg:py-36">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-14 text-center">
            <div data-reveal className="mx-auto mb-5 flex w-fit items-center gap-3">
              <span className="h-px w-10 bg-[#c8923a]" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#173d2b]">Gallery</span>
              <span className="h-px w-10 bg-[#c8923a]" />
            </div>
            <h2 data-reveal className="font-serif text-3xl font-light text-[#173d2b] lg:text-[2.6rem]">
              A glimpse of Damview.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { caption: "Our rooms", image: "/images/accommodation/real/room-1.jpg" },
              { caption: "The pool", image: "/images/resort/damview-pool.jpg" },
              { caption: "On the water", image: "/images/resort/damview-water-1.jpg" },
              { caption: "Pool tables", image: "/images/activities/real/pool-tables.jpg" },
              { caption: "Our rooms", image: "/images/accommodation/real/room-2.jpg" },
              { caption: "Sunset on the dam", image: "/images/resort/damview-water-2.jpg" },
              { caption: "Our rooms", image: "/images/accommodation/real/room-4.jpg" },
              { caption: "Dam Food Bar", image: "/images/restaurant/real/interior.jpg" },
            ].map((item) => (
              <figure key={item.image} data-reveal className="group relative aspect-square overflow-hidden rounded-sm">
                <Image src={item.image} alt={item.caption} fill className="object-cover transition-transform duration-[1.3s] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-[#173d2b]/0 transition-colors duration-500 group-hover:bg-[#173d2b]/15" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-[#173d2b]/60 px-2 py-1.5 text-center text-xs font-medium text-white">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-[#527c48] hover:text-[#173d2b]">
              See the full gallery &amp; reviews <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ LOCATION & CONTACT ═══════════════════════════════════════════════ */}
      <section id="contact" className="relative overflow-hidden bg-[#173d2b]">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/resort/damview-water-2.jpg" alt="" fill className="object-cover" aria-hidden="true" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-12 lg:py-36">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div data-reveal className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-[#c8923a]" />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#f4ebdd]/70">Visit Damview</span>
              </div>
              <h2 data-reveal className="font-serif text-3xl font-light leading-[1.1] text-white text-balance sm:text-4xl lg:text-[3.2rem]">
                Your next good day<br />starts here.
              </h2>
              <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
                Come through, bring your people and experience Damview.
              </p>
              <div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCATION)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4ebdd] px-7 py-3.5 text-sm font-semibold text-[#173d2b] transition-all hover:bg-white hover:shadow-xl"
                >
                  <Navigation size={16} />
                  Get Directions
                </a>
                <WhatsAppButton
                  label="Make a Booking"
                  className="rounded-full border border-white/40 bg-[#173d2b]/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:border-white/80 hover:bg-[#173d2b]/50"
                />
              </div>
            </div>

            <div data-reveal className="flex items-center">
              <div className="w-full rounded-sm border border-white/15 bg-white/[0.06] p-7 backdrop-blur-md lg:p-9">
                <div className="mb-7 flex items-start gap-4 border-b border-white/15 pb-7">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-[#c8923a]" />
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-white/60">Location</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-white">{LOCATION}</p>
                  </div>
                </div>
                <ul className="space-y-5">
                  <li className="flex items-center gap-4">
                    <Phone size={18} className="shrink-0 text-[#c8923a]" />
                    <a href={`tel:+${CONTACT_NUMBERS.primary}`} className="text-sm text-white transition-colors hover:text-[#c8923a]">077 444 6001</a>
                  </li>
                  <li className="flex items-center gap-4">
                    <MessageCircle size={18} className="shrink-0 text-[#c8923a]" />
                    <a
                      href={buildWhatsAppUrl(CONTACT_NUMBERS.secondary, "Hi, I'd like to enquire about Damview Resort.")}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-white transition-colors hover:text-[#c8923a]"
                    >
                      WhatsApp 077 444 6004
                    </a>
                  </li>
                  <li className="flex items-center gap-4">
                    <Clock size={18} className="shrink-0 text-[#c8923a]" />
                    <span className="text-sm text-white">Open 24 hours, every day</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CalendarCheck size={18} className="shrink-0 text-[#c8923a]" />
                    <span className="text-sm text-white">Entrance ${ENTRANCE_FEE.weekday} weekdays, ${ENTRANCE_FEE.weekend} weekends</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="shrink-0 text-[#c8923a]"><FacebookIcon size={18} /></span>
                    <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-white transition-colors hover:text-[#c8923a]">
                      Follow us on Facebook
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div data-reveal className="mt-12 overflow-hidden rounded-sm border border-white/15">
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
        </div>
      </section>

      {/* ══ EVENTS banner ════════════════════════════════════════════════════ */}
      <section className="bg-[#f9f7f1] py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div data-reveal>
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">Functions &amp; Events</p>
              <h2 className="font-serif text-2xl font-light text-[#173d2b] lg:text-3xl">
                Weddings, birthdays, graduations &amp; braais.
              </h2>
            </div>
            <Link data-reveal href="/events" className="inline-flex w-fit items-center gap-2.5 rounded-full bg-[#173d2b] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#527c48] whitespace-nowrap">
              Plan an event <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
