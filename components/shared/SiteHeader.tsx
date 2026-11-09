"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { WEBSITE_NAV, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "bg-cream-50/95 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md" : "bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between lg:h-20">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-full transition-all",
            !scrolled && "bg-cream-50/95 px-3 py-1.5 shadow-sm"
          )}
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/images/brand/logo.png"
            alt={`${SITE_NAME} logo`}
            width={180}
            height={60}
            className="h-8 w-auto lg:h-9"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {WEBSITE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "link-underline text-[0.82rem] font-medium tracking-wide transition-colors",
                scrolled ? "text-charcoal/80 hover:text-green-800" : "text-cream-50/90 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/accommodation"
            className={cn(
              "hidden rounded-full px-6 py-2.5 text-[0.82rem] font-semibold tracking-wide transition-all duration-300 lg:inline-flex",
              scrolled ? "bg-green-800 text-cream-50 hover:bg-green-700" : "bg-cream-50 text-green-900 hover:bg-white"
            )}
          >
            Make a Booking
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors lg:hidden",
              scrolled ? "text-charcoal" : "text-cream-50",
              menuOpen && "bg-green-800 text-cream-50"
            )}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      <div
        className={cn(
          "overflow-hidden bg-cream-50 transition-[max-height,opacity] duration-500 lg:hidden",
          menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col gap-1 px-6 pb-8 pt-2">
          {WEBSITE_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-charcoal/10 py-3.5 font-serif text-lg text-charcoal"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-4">
            <Link
              href="/accommodation"
              onClick={() => setMenuOpen(false)}
              className="block rounded-full bg-green-800 px-6 py-3.5 text-center text-sm font-semibold text-cream-50"
            >
              Make a Booking
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
