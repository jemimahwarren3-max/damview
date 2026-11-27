"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { SITE_NAME, LOCATION, CONTACT_NUMBERS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// ─── data ────────────────────────────────────────────────────────────────────

const ROOMS = [
  {
    id: "garden",
    name: "Garden Rooms",
    block: "A Block · 12-hr stay",
    description:
      "Warm and private, with classic décor, ornate cornicing and direct garden access. The quiet end of the property.",
    price: 25,
    img: "/images/accommodation/real/room-1.jpg",
    alt: "Garden Room interior — yellow walls, dark tile, colourful abstract art",
    // stone / pebble blob
    blob: "42% 58% 65% 35% / 45% 40% 60% 55%",
    rotate: "-4deg",
  },
  {
    id: "poolside",
    name: "Poolside Rooms",
    block: "B Block · 12-hr stay",
    description:
      "Steps from the pool, these rooms balance comfort with proximity to the resort's social heart. A tufted headboard and light tile.",
    price: 30,
    img: "/images/accommodation/real/room-4.jpg",
    alt: "Poolside Room — tufted headboard, leopard-print art, light tile",
    // slightly wider, rounder
    blob: "55% 45% 38% 62% / 52% 65% 35% 48%",
    rotate: "3deg",
  },
  {
    id: "premier",
    name: "Premier Rooms",
    block: "F Block · 12-hr stay",
    description:
      "Marble tile floors, grey accent walls and a generous footprint. Our best-appointed rooms on property — a notch above.",
    price: 35,
    img: "/images/accommodation/real/room-3.jpg",
    alt: "Premier Room — marble floors, grey-brown accent wall, en-suite",
    // asymmetric, tall
    blob: "60% 40% 50% 50% / 42% 60% 42% 58%",
    rotate: "-2deg",
  },
  {
    id: "riverside",
    name: "Riverside Rooms",
    block: "R Block · 12-hr stay",
    description:
      "Clean lines, white marble and a glass-partitioned bathroom. Modern and serene — closest to the water.",
    price: 25,
    img: "/images/accommodation/real/room-2.jpg",
    alt: "Riverside Room — white marble floor, geometric art, glass bathroom",
    // different squish
    blob: "45% 55% 60% 40% / 55% 42% 58% 45%",
    rotate: "5deg",
  },
];

const VIEW_IMGS = [
  {
    src: "/images/resort/damview-water-4.jpg",
    alt: "Golden-hour sunlight rippling on the dam at Damview Resort",
  },
  {
    src: "/images/resort/damview-water-1.jpg",
    alt: "Still water at dusk, trees reflected on the dam surface",
  },
  {
    src: "/images/resort/damview-water-3.jpg",
    alt: "Calm sunset over the Damview dam, sandy shore in the foreground",
  },
];

const EXPERIENCES = [
  {
    title: "On the Water",
    sub: "Boat cruises · Pedal boats",
    description:
      "Watch the shore drift past from the bow of a boat, or take the pedal boat at your own pace. Cruises from $5 pp.",
    img: "/images/activities/real/boats.jpg",
    alt: "Boat launch at Damview dam with speed boat and guests",
    href: "/damside",
    // wide, low ripple — references the water surface
    blob: "68% 32% 55% 45% / 38% 55% 45% 62%",
    rotate: "-2deg",
    clipBg: "#1a3d2e",
  },
  {
    title: "Pool & Play",
    sub: "Swimming · Football · Pool tables",
    description:
      "The pool looks out over the dam. Pool tables, a football pitch and open lawn fill whatever gaps the water leaves.",
    img: "/images/resort/pool-damside.jpg",
    alt: "Resort pool at Damview with tropical cocktail and thatched pavilion",
    href: "/activities",
    // rounder, pebble
    blob: "52% 48% 44% 56% / 56% 44% 60% 44%",
    rotate: "3deg",
    clipBg: "#16291d",
  },
  {
    title: "Gym & Fitness",
    sub: "Open 24/7 · Full equipment",
    description:
      "A fully-equipped gym in a resort setting, with modern machines, clean showers and a view that makes the effort feel lighter.",
    img: "/images/gym/real/gym-1.jpg",
    alt: "Damview Fitness Club interior — gym equipment",
    href: "/gym",
    // narrow, tall, leaf-ish
    blob: "42% 58% 60% 40% / 55% 42% 58% 48%",
    rotate: "-4deg",
    clipBg: "#2a1f10",
  },
];

// ─── component ────────────────────────────────────────────────────────────────

export default function HomepageClient() {
  const heroImgRef = useRef<HTMLDivElement>(null);
  const viewSectionRef = useRef<HTMLElement>(null);
  const viewImgsRef = useRef<HTMLDivElement[]>([]);
  const viewTextRef = useRef<HTMLDivElement>(null);
  const roomsSectionRef = useRef<HTMLElement>(null);
  const roomSlidesRef = useRef<HTMLDivElement[]>([]);
  const roomTextsRef = useRef<HTMLDivElement[]>([]);
  const lenisRef = useRef<import("lenis").default | null>(null);

  const addViewImg = useCallback(
    (el: HTMLDivElement | null, i: number) => {
      if (el) viewImgsRef.current[i] = el;
    },
    []
  );
  const addRoomSlide = useCallback(
    (el: HTMLDivElement | null, i: number) => {
      if (el) roomSlidesRef.current[i] = el;
    },
    []
  );
  const addRoomText = useCallback(
    (el: HTMLDivElement | null, i: number) => {
      if (el) roomTextsRef.current[i] = el;
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Dynamic imports — GSAP and Lenis are large, only load client-side
    Promise.all([
      import("gsap").then((m) => m.gsap ?? m.default),
      import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger ?? m.default),
      import("lenis").then((m) => m.default),
    ]).then(([gsap, ScrollTrigger, Lenis]) => {
      gsap.registerPlugin(ScrollTrigger);

      // ── Lenis smooth scroll ──────────────────────────────────────────────
      const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      lenisRef.current = lenis;

      const lenisRaf = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);

      if (prefersReduced) return;

      const mm = gsap.matchMedia();

      // ── Hero image slow parallax ─────────────────────────────────────────
      if (heroImgRef.current) {
        gsap.to(heroImgRef.current, {
          y: "12%",
          ease: "none",
          scrollTrigger: {
            trigger: heroImgRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // ── "The View" — desktop pinned crossfade dolly ──────────────────────
      mm.add("(min-width: 768px)", () => {
        const viewImgs = viewImgsRef.current;
        const totalSteps = VIEW_IMGS.length - 1;

        // Set initial state: first visible, rest hidden + scaled up
        gsap.set(viewImgs.slice(1), { opacity: 0, scale: 1.15 });
        gsap.set(viewImgs[0], { scale: 1 });

        // Dolly the whole section image (subtle zoom on first image as we enter)
        if (viewImgs[0]) {
          gsap.to(viewImgs[0].querySelector("img"), {
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: viewSectionRef.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });
        }

        const viewTl = gsap.timeline({ paused: true });
        for (let i = 0; i < totalSteps; i++) {
          viewTl
            .to(
              viewImgs[i],
              { opacity: 0, scale: 1.1, ease: "power2.inOut", duration: 1 },
              i
            )
            .fromTo(
              viewImgs[i + 1],
              { opacity: 0, scale: 1.15 },
              { opacity: 1, scale: 1, ease: "power2.inOut", duration: 1 },
              i
            );
        }

        ScrollTrigger.create({
          trigger: viewSectionRef.current,
          start: "top top",
          end: `+=${totalSteps * window.innerHeight * 1.3}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          animation: viewTl,
        });

        // Text fade in on enter
        if (viewTextRef.current) {
          gsap.fromTo(
            viewTextRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: viewSectionRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        return () => {};
      });

      // ── Rooms crossfade showcase — desktop pin ───────────────────────────
      mm.add("(min-width: 768px)", () => {
        const slides = roomSlidesRef.current;
        const texts = roomTextsRef.current;
        if (!slides.length || !texts.length) return;

        const totalRooms = ROOMS.length;

        // Initial states
        gsap.set(slides.slice(1), { opacity: 0, scale: 1.12 });
        gsap.set(slides[0], { scale: 1 });
        gsap.set(texts.slice(1), { opacity: 0, y: 24 });

        const roomTl = gsap.timeline({ paused: true });
        for (let i = 0; i < totalRooms - 1; i++) {
          roomTl
            .to(
              slides[i],
              { opacity: 0, scale: 1.1, ease: "power2.inOut", duration: 1 },
              i * 1.2
            )
            .fromTo(
              slides[i + 1],
              { opacity: 0, scale: 1.12 },
              { opacity: 1, scale: 1, ease: "power2.inOut", duration: 1 },
              i * 1.2
            )
            .to(
              texts[i],
              { opacity: 0, y: -20, ease: "power2.in", duration: 0.5 },
              i * 1.2
            )
            .fromTo(
              texts[i + 1],
              { opacity: 0, y: 28 },
              { opacity: 1, y: 0, ease: "power2.out", duration: 0.6 },
              i * 1.2 + 0.4
            );
        }

        ScrollTrigger.create({
          trigger: roomsSectionRef.current,
          start: "top top",
          end: `+=${(totalRooms - 1) * window.innerHeight * 1.5}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          animation: roomTl,
        });

        return () => {};
      });

      // ── Reveal animations (scroll-triggered, all screen sizes) ───────────
      gsap.utils
        .toArray<HTMLElement>("[data-reveal]")
        .forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            }
          );
        });

      return () => {
        lenis.destroy();
        gsap.ticker.remove(lenisRaf);
        ScrollTrigger.getAll().forEach((t) => t.kill());
        mm.revert();
      };
    });
  }, []);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          1. HERO — split screen
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative flex h-[100svh] min-h-[640px] flex-col lg:flex-row overflow-hidden bg-[#0f2419]">
        {/* Left — text panel */}
        <div className="relative z-10 flex flex-1 flex-col justify-end px-8 pb-16 pt-28 lg:w-[44%] lg:flex-none lg:justify-center lg:px-14 lg:py-0">
          {/* subtle textured dark overlay on mobile (full bleed bg) */}
          <div className="absolute inset-0 lg:hidden">
            <div
              ref={heroImgRef}
              className="absolute inset-0 scale-110"
              style={{ willChange: "transform" }}
            >
              <Image
                src="/images/resort/damview-sunset-2.jpg"
                alt="Sunset over the Damview dam, framed by riverside branches"
                fill
                priority
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2419]/95 via-[#0f2419]/60 to-[#0f2419]/30" />
          </div>

          <div className="relative">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="h-px w-8 bg-[#c8923a]" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                Chitungwiza, Zimbabwe
              </span>
            </div>

            <h1 className="font-serif text-[2.6rem] font-light leading-[1.05] text-[#faf6ee] text-balance sm:text-6xl lg:text-[4.2rem]">
              More than
              <br />
              <em className="not-italic text-[#e5a05b]">a getaway.</em>
            </h1>

            <p className="mt-6 max-w-sm text-base leading-[1.75] text-[#f4ebdd]/75 lg:text-[1.05rem]">
              Swimming, sundowners, boat rides, live sport, fine dining and
              four styles of lodge — all on the edge of a living dam, right
              here in Chitungwiza.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/accommodation"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#faf6ee] px-7 py-3.5 text-sm font-semibold text-[#0f2419] transition-all duration-300 hover:bg-white hover:shadow-xl"
              >
                Book a Stay
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/damside"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#faf6ee]/30 px-7 py-3.5 text-sm font-semibold text-[#faf6ee] transition-all duration-300 hover:border-[#faf6ee]/70 hover:bg-white/10"
              >
                Explore the Dam
              </Link>
            </div>

            <div className="mt-14 hidden items-center gap-2 lg:flex">
              <MapPin size={12} className="text-[#c8923a]" />
              <span className="text-[0.68rem] text-[#f4ebdd]/50">
                {LOCATION}
              </span>
            </div>
          </div>
        </div>

        {/* Right — organic-framed image (desktop only) */}
        <div className="hidden lg:flex lg:w-[56%] lg:items-center lg:justify-center lg:pr-14 lg:py-10">
          <div
            className="relative w-full max-w-[520px] overflow-hidden"
            style={{
              borderRadius: "68% 32% 44% 56% / 42% 55% 45% 58%",
              aspectRatio: "3/4",
              transform: "rotate(-2deg)",
            }}
          >
            <div
              ref={heroImgRef}
              className="absolute inset-0 scale-110"
              style={{ willChange: "transform" }}
            >
              <Image
                src="/images/resort/damview-sunset-2.jpg"
                alt="Sunset over the Damview dam, branches framing the water at golden hour"
                fill
                priority
                className="object-cover object-center scale-[1.25]"
                sizes="(min-width: 1024px) 520px, 0px"
              />
            </div>
            {/* Warm tinted edge vignette */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 55%, #0f2419 100%)",
              }}
            />
          </div>

          {/* Accent: floating price tag */}
          <div
            className="absolute right-16 bottom-20 rounded-2xl border border-[#c8923a]/30 bg-[#0f2419]/80 px-5 py-4 backdrop-blur-sm"
            aria-hidden="true"
          >
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#c8923a]">
              Stays from
            </p>
            <p className="mt-0.5 font-serif text-2xl font-light text-[#faf6ee]">
              $25
              <span className="ml-1 text-sm text-[#f4ebdd]/60">/ 12 hrs</span>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. THE VIEW — scroll-pinned crossfade dolly
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={viewSectionRef}
        className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#0a1a10]"
        aria-label="The view over the dam"
      >
        {/* Image layers — absolutely stacked */}
        {VIEW_IMGS.map((img, i) => (
          <div
            key={img.src}
            ref={(el) => addViewImg(el, i)}
            className="absolute inset-0"
            aria-hidden={i > 0}
            style={{ willChange: "opacity, transform" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,26,16,0.15) 0%, rgba(10,26,16,0.0) 40%, rgba(10,26,16,0.7) 100%)",
          }}
        />

        {/* Text overlay */}
        <div
          ref={viewTextRef}
          className="absolute bottom-16 left-0 right-0 z-20 flex flex-col items-center px-6 text-center"
        >
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#c8923a]">
            The water is always there
          </p>
          <h2 className="font-serif text-3xl font-light leading-[1.1] text-[#faf6ee] text-balance sm:text-5xl lg:text-[3.5rem]">
            The question is when
            <br />
            you&apos;ll come to it.
          </h2>
          <Link
            href="/damside"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#faf6ee]/40 px-7 py-3 text-sm font-medium text-[#faf6ee] transition-all hover:border-[#faf6ee]/80 hover:bg-white/10"
          >
            See the Damside
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. INTRO — stats + pool shot
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f4ebdd] py-24 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Left text */}
            <div className="flex flex-col justify-center">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[#c8923a]" />
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#173d2b]">
                  Welcome to Damview
                </span>
              </div>

              <h2
                data-reveal
                className="font-serif text-3xl font-light leading-[1.12] text-[#173d2b] text-balance sm:text-4xl lg:text-[2.8rem]"
              >
                Where Chitungwiza
                <br />
                meets the water.
              </h2>

              <p
                data-reveal
                className="mt-7 max-w-lg text-[1.02rem] leading-[1.8] text-[#292b23]/70"
              >
                Damview is built around a dam — not behind it, not beside it.
                On it. Every room, every activity and every meal is shaped by
                the landscape just outside the door.
              </p>

              <div data-reveal className="mt-10 grid grid-cols-3 gap-6">
                {[
                  ["4", "Lodge blocks"],
                  ["24/7", "Open every day"],
                  ["$2", "Entry from"],
                ].map(([n, l]) => (
                  <div key={l} className="border-t border-[#173d2b]/15 pt-5">
                    <div className="font-serif text-3xl font-medium text-[#173d2b]">
                      {n}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-[#292b23]/50">
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — pool shot with diagonal-cut frame */}
            <div data-reveal className="relative">
              {/* Background accent panel revealed by the cut */}
              <div
                className="absolute -inset-3 bg-[#173d2b]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%)",
                  borderRadius: "12px",
                }}
                aria-hidden="true"
              />
              <div
                className="relative h-80 overflow-hidden lg:h-[36rem]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)",
                  borderRadius: "10px",
                }}
              >
                <Image
                  src="/images/resort/pool-damside.jpg"
                  alt="The Damview pool looking out over the dam — Castle Lite, cocktail, thatched pavilion"
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>

              {/* Floating label */}
              <div
                className="absolute -bottom-4 -left-4 rounded-xl border border-[#c8923a]/30 bg-[#f4ebdd] px-4 py-3 shadow-lg"
                data-reveal
              >
                <p className="text-xs font-semibold text-[#173d2b]">
                  Pool + Pavilion Bar
                </p>
                <p className="mt-0.5 text-[0.7rem] text-[#292b23]/60">
                  Open to all guests
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. ROOMS — scroll-pinned crossfade showcase (desktop)
                     stacked list (mobile)
      ═══════════════════════════════════════════════════════════════════ */}
      {/* Mobile: simple stacked list */}
      <section className="bg-[#0f2419] py-20 lg:hidden">
        <div className="px-6">
          <div className="mb-10 flex items-center gap-3">
            <span className="h-px w-8 bg-[#c8923a]" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
              Accommodation
            </span>
          </div>
          <h2 className="mb-12 font-serif text-3xl font-light text-[#faf6ee]">
            Four ways to stay.
          </h2>
          {ROOMS.map((room) => (
            <div key={room.id} className="mb-12">
              <div
                className="relative mb-6 overflow-hidden"
                style={{
                  borderRadius: room.blob,
                  transform: `rotate(${room.rotate})`,
                  aspectRatio: "4/3",
                }}
              >
                <Image
                  src={room.img}
                  alt={room.alt}
                  fill
                  className="object-cover scale-[1.15]"
                  style={{ transform: `rotate(-${room.rotate}) scale(1.2)` }}
                  sizes="100vw"
                />
              </div>
              <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[#c8923a]">
                {room.block}
              </p>
              <h3 className="mb-3 font-serif text-2xl font-light text-[#faf6ee]">
                {room.name}
              </h3>
              <p className="text-sm leading-relaxed text-[#f4ebdd]/65">
                {room.description}
              </p>
              <p className="mt-4 font-serif text-xl text-[#e5a05b]">
                ${room.price}
                <span className="ml-1 text-sm text-[#f4ebdd]/50">/ stay</span>
              </p>
            </div>
          ))}
          <Link
            href="/accommodation"
            className="inline-flex items-center gap-2 rounded-full border border-[#faf6ee]/30 px-7 py-3.5 text-sm font-medium text-[#faf6ee] transition-all hover:bg-white/10"
          >
            View all rooms <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Desktop: pinned crossfade */}
      <section
        ref={roomsSectionRef}
        className="relative hidden h-[100svh] min-h-[700px] bg-[#0f2419] lg:block"
        aria-label="Room showcase"
      >
        {/* Section label */}
        <div className="absolute left-14 top-14 z-30 flex items-center gap-3">
          <span className="h-px w-8 bg-[#c8923a]" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
            Accommodation
          </span>
        </div>

        {/* Image slides — full section, stacked */}
        {ROOMS.map((room, i) => (
          <div
            key={room.id}
            ref={(el) => addRoomSlide(el, i)}
            className="absolute right-0 top-0 h-full"
            style={{
              width: "55%",
              willChange: "opacity, transform",
              zIndex: 1,
            }}
          >
            {/* Organic blob clip applied to a wrapper, not the image directly,
                so the clip + image fill works correctly */}
            <div
              className="absolute inset-8 overflow-hidden"
              style={{
                borderRadius: room.blob,
                transform: `rotate(${room.rotate})`,
              }}
            >
              <Image
                src={room.img}
                alt={room.alt}
                fill
                className="object-cover"
                style={{ transform: `rotate(-${room.rotate}) scale(1.25)` }}
                sizes="55vw"
              />
            </div>
          </div>
        ))}

        {/* Text panels — stacked */}
        {ROOMS.map((room, i) => (
          <div
            key={`text-${room.id}`}
            ref={(el) => addRoomText(el, i)}
            className="absolute left-0 top-0 flex h-full w-[45%] flex-col justify-center px-14"
            style={{
              willChange: "opacity, transform",
              zIndex: 20,
            }}
          >
            <p className="mb-2 text-[0.63rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
              {room.block}
            </p>
            <h2 className="font-serif text-[2.8rem] font-light leading-[1.08] text-[#faf6ee] text-balance">
              {room.name}
            </h2>
            <p className="mt-5 max-w-sm text-[1.0rem] leading-[1.8] text-[#f4ebdd]/65">
              {room.description}
            </p>
            <div className="mt-8 flex items-baseline gap-1">
              <span className="font-serif text-3xl font-light text-[#e5a05b]">
                ${room.price}
              </span>
              <span className="text-sm text-[#f4ebdd]/50">/ 12-hr stay</span>
            </div>
            <Link
              href="/accommodation"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#faf6ee]/30 px-7 py-3 text-sm font-medium text-[#faf6ee] transition-all hover:border-[#faf6ee]/70 hover:bg-white/10"
            >
              Book this room <ArrowRight size={14} />
            </Link>
          </div>
        ))}

        {/* Room counter dots */}
        <div className="absolute bottom-10 left-14 z-30 flex gap-2" aria-hidden="true">
          {ROOMS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full bg-[#faf6ee] transition-all ${i === 0 ? "w-6 opacity-80" : "w-1.5 opacity-25"}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. EXPERIENCES — organic shaped cards
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f4ebdd] py-24 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-[#c8923a]" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#173d2b]">
              Experiences
            </span>
          </div>
          <h2
            data-reveal
            className="mb-16 font-serif text-3xl font-light leading-[1.1] text-[#173d2b] text-balance sm:text-4xl lg:text-[2.8rem]"
          >
            There&apos;s always something
            <br />
            to do on the water.
          </h2>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
            {EXPERIENCES.map((exp, i) => (
              <Link
                key={exp.title}
                href={exp.href}
                data-reveal
                className="group block"
              >
                {/* Organic blob image frame */}
                <div className="relative mb-7 overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  {/* Accent panel behind the blob that shows through on cuts */}
                  <div
                    className="absolute inset-0 opacity-100"
                    style={{ background: exp.clipBg, borderRadius: "inherit" }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{
                      borderRadius: exp.blob,
                      transform: `rotate(${exp.rotate})`,
                    }}
                  >
                    <Image
                      src={exp.img}
                      alt={exp.alt}
                      fill
                      className="object-cover"
                      style={{
                        transform: `rotate(-${exp.rotate}) scale(1.25)`,
                        transition: "transform 0.7s ease",
                      }}
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                </div>

                <p className="mb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-[#c8923a]">
                  {exp.sub}
                </p>
                <h3 className="mb-3 font-serif text-xl font-light text-[#173d2b] group-hover:text-[#527c48] transition-colors">
                  {exp.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#292b23]/65">
                  {exp.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#527c48] transition-all group-hover:gap-3">
                  Explore <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. DINING — brief section
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#173d2b] py-24 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            {/* Text */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c8923a]" />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                  Dam Food Bar
                </span>
              </div>
              <h2
                data-reveal
                className="font-serif text-3xl font-light leading-[1.1] text-[#faf6ee] text-balance sm:text-4xl"
              >
                Eat well.
                <br />
                Drink well.
                <br />
                Stay a while.
              </h2>
              <p
                data-reveal
                className="mt-7 max-w-sm text-[1.02rem] leading-[1.8] text-[#f4ebdd]/70"
              >
                Fully stocked bar, wine specials, burgers, braai and a menu
                that keeps pace with a full day on the water. No rush. The
                dam isn&apos;t going anywhere.
              </p>
              <Link
                href="/restaurant"
                data-reveal
                className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#faf6ee]/30 px-7 py-3.5 text-sm font-medium text-[#faf6ee] transition-all hover:border-[#faf6ee]/70 hover:bg-white/10"
              >
                View menu & dining <ArrowRight size={14} />
              </Link>
            </div>

            {/* Images — two organic frames, offset */}
            <div data-reveal className="relative h-[28rem] lg:h-[36rem]">
              {/* Back image — diagonal cut, shifted right + up */}
              <div
                className="absolute right-0 top-0 h-[70%] w-[65%] overflow-hidden"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 78%, 78% 100%, 0 100%)",
                  borderRadius: "10px",
                }}
              >
                <Image
                  src="/images/restaurant/real/exterior.jpg"
                  alt="Damview Restaurant exterior — outdoor pavilion seating"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, 65vw"
                />
              </div>

              {/* Accent panel behind second image */}
              <div
                className="absolute bottom-0 left-0 h-[65%] w-[60%] rounded-xl"
                style={{ background: "#0f2419" }}
                aria-hidden="true"
              />

              {/* Front image — stone blob, overlapping */}
              <div
                className="absolute bottom-0 left-0 h-[65%] w-[60%] overflow-hidden"
                style={{
                  borderRadius: "55% 45% 42% 58% / 50% 55% 45% 50%",
                  transform: "rotate(2deg)",
                }}
              >
                <Image
                  src="/images/restaurant/real/interior.jpg"
                  alt="Dam Food Bar interior — bar seating and dining area"
                  fill
                  className="object-cover scale-[1.2]"
                  style={{ transform: "rotate(-2deg) scale(1.25)" }}
                  sizes="(min-width: 1024px) 30vw, 60vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. EVENTS — brief mention
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f4ebdd] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
                Functions & Events
              </p>
              <h2 className="font-serif text-2xl font-light text-[#173d2b] lg:text-3xl">
                Weddings, birthdays, graduations, braais.
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex w-fit items-center gap-2.5 rounded-full bg-[#173d2b] px-8 py-3.5 text-sm font-semibold text-[#faf6ee] transition-all hover:bg-[#527c48] whitespace-nowrap"
            >
              Plan an event <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. BOOK A STAY — single clear CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-32 lg:py-48"
        style={{ background: "#0a1a10" }}
      >
        {/* Background — dam water image, heavily overlaid */}
        <div className="absolute inset-0">
          <Image
            src="/images/resort/damview-water-2.jpg"
            alt=""
            fill
            className="object-cover object-center"
            aria-hidden="true"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(10,26,16,0.88) 0%, rgba(10,26,16,0.80) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#c8923a]" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#c8923a]">
              Book a stay
            </span>
            <span className="h-px w-8 bg-[#c8923a]" />
          </div>

          <h2
            data-reveal
            className="font-serif text-3xl font-light text-[#faf6ee] text-balance sm:text-5xl"
          >
            Come when
            <br />
            you&apos;re ready.
          </h2>

          <p
            data-reveal
            className="mx-auto mt-7 max-w-md text-base leading-[1.8] text-[#f4ebdd]/70"
          >
            Rooms from $25 per 12-hour stay or $5 per hour. Walk-ins welcome
            subject to availability — or message us on WhatsApp to hold your
            room.
          </p>

          <div
            data-reveal
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/accommodation"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#faf6ee] px-8 py-4 text-sm font-semibold text-[#0f2419] transition-all duration-300 hover:bg-white hover:shadow-xl"
            >
              Check availability
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <a
              href={buildWhatsAppUrl(
                CONTACT_NUMBERS.primary,
                "Hi, I'd like to book a stay at Damview Resort."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-[#faf6ee]/35 px-8 py-4 text-sm font-semibold text-[#faf6ee] transition-all hover:border-[#faf6ee]/75 hover:bg-white/10"
            >
              <MessageCircle size={15} />
              WhatsApp us
            </a>
          </div>

          <p
            data-reveal
            className="mt-10 flex items-center justify-center gap-2 text-xs text-[#f4ebdd]/45"
          >
            <MapPin size={11} />
            {LOCATION}
          </p>
        </div>
      </section>
    </>
  );
}
