import type { Metadata } from "next";
import { Fraunces, Inter, Bebas_Neue, Caveat } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-promo",
  subsets: ["latin"],
  weight: "400",
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Damview Resort, Chitungwiza: lodges, swimming pool, restaurant, gym and outdoor activities on the water in Chikwanha.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_ZW",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${bebasNeue.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
