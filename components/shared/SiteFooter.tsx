import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { WEBSITE_NAV, SITE_NAME, CONTACT_NUMBERS, LOCATION } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="bg-cream-100 pt-20 pb-10">
      <Container>
        <div className="grid grid-cols-1 gap-12 pb-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Image src="/images/brand/logo.png" alt={`${SITE_NAME} logo`} width={160} height={53} className="h-9 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-charcoal/70">
              A place to unwind, connect and enjoy. Swimming, dining, outdoor activities and warm
              Zimbabwean hospitality in Chitungwiza.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[CONTACT_NUMBERS.primary, CONTACT_NUMBERS.secondary].map((number) => (
                <a
                  key={number}
                  href={buildWhatsAppUrl(number, "Hi, I'd like to enquire about Damview Resort.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/70 transition-colors hover:border-green-700 hover:bg-green-800 hover:text-cream-50"
                >
                  <MessageCircle size={17} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-green-800">Explore</h3>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-6">
              {WEBSITE_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-charcoal/70 transition-colors hover:text-green-800">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/guest-centre" className="text-sm text-charcoal/70 transition-colors hover:text-green-800">
                  Guest Centre
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-green-800">Contact</h3>
            <ul className="space-y-4 text-sm text-charcoal/75">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-sunset-600" />
                <span>{LOCATION}</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="shrink-0 text-sunset-600" />
                <a href={`tel:+${CONTACT_NUMBERS.primary}`} className="transition-colors hover:text-green-800">
                  077 444 6001 / 6004
                </a>
              </li>
            </ul>
            <Link
              href="/accommodation"
              className="mt-6 inline-flex rounded-full bg-green-800 px-6 py-3 text-sm font-semibold text-cream-50 transition-colors hover:bg-green-700"
            >
              Make a Booking
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-charcoal/12 pt-7 text-xs text-charcoal/55 sm:flex-row">
          <p>&copy; 2026 {SITE_NAME}. All rights reserved.</p>
          <p>Chitungwiza, Zimbabwe</p>
        </div>
      </Container>
    </footer>
  );
}
