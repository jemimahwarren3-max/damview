import { Container } from "@/components/shared/Container";
import { WEBSITE_NAV, SITE_NAME, CONTACT_NUMBERS, LOCATION } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-dv-forest text-dv-ivory">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="font-serif text-xl">{SITE_NAME}</span>
          <p className="mt-2 max-w-xs text-sm text-dv-ivory/70">{LOCATION}</p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-dv-ivory/80">
          {WEBSITE_NAV.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-dv-gold">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="text-sm text-dv-ivory/80">
          <a href={`tel:+${CONTACT_NUMBERS.primary}`} className="block hover:text-dv-gold">
            077 444 6001
          </a>
          <a href={`tel:+${CONTACT_NUMBERS.secondary}`} className="block hover:text-dv-gold">
            077 444 6004
          </a>
        </div>
      </Container>

      <div className="border-t border-dv-ivory/10 py-4 text-center text-xs text-dv-ivory/60">
        © 2026 {SITE_NAME}
      </div>
    </footer>
  );
}
