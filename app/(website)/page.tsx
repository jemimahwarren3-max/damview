import { SITE_NAME, SITE_URL, TAGLINE, CONTACT_NUMBERS, SOCIAL_LINKS } from "@/lib/constants";
import { getRoomBlocks } from "@/lib/data/rooms";
import HomepageClient from "@/components/home/HomepageClient";

export default async function HomePage() {
  const roomBlocks = await getRoomBlocks();
  const rates = roomBlocks.map((b) => b.ratePerStay).filter((n) => n > 0);
  const priceRange = rates.length ? `$${Math.min(...rates)}-$${Math.max(...rates)}` : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      {
        "@type": "LodgingBusiness",
        name: SITE_NAME,
        description: TAGLINE,
        url: SITE_URL,
        telephone: `+${CONTACT_NUMBERS.primary}`,
        image: `${SITE_URL}/images/resort/damview-sunset.jpg`,
        ...(priceRange ? { priceRange } : {}),
        address: {
          "@type": "PostalAddress",
          streetAddress: "Chikwanha, along Seke Road, next to Zuva Service Station",
          addressLocality: "Chitungwiza",
          addressCountry: "ZW",
        },
        sameAs: [SOCIAL_LINKS.facebook],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomepageClient />
    </>
  );
}
