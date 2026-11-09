import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { MENU_CATEGORIES, MENU_ITEMS, RESTAURANT_IMAGE } from "@/lib/data/menu";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Bar & Restaurant — ${SITE_NAME}`,
  description: "The Dam Food Bar menu at Dam View Resort, Chitungwiza.",
};

export default function RestaurantPage() {
  return (
    <>
      <PageHero
        eyebrow="Bar & Restaurant"
        title="Dam Food Bar"
        subtitle="Country-style plates, cold drinks and a braai that doesn't stop."
        image={RESTAURANT_IMAGE}
      />

      <section className="py-20">
        <Container className="max-w-2xl">
          <SectionHeading
            eyebrow="The Menu"
            title="A few favourites to start with."
            subtitle="This is a sample of our menu — the full breakfast, lunch and supper list is coming soon."
          />
          <div className="mt-10 flex flex-col gap-10">
            {MENU_CATEGORIES.map((category) => (
              <div key={category.id}>
                <h3 className="font-serif text-lg text-dv-forest">{category.name}</h3>
                <div className="mt-4 flex flex-col divide-y divide-border">
                  {MENU_ITEMS.filter((item) => item.categoryId === category.id).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <span className="font-medium">{item.name}</span>
                      <PriceDisplay amount={item.price} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-dv-cream py-16">
        <Container className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-serif text-2xl text-dv-forest">Want to see today&apos;s specials?</h2>
          <WhatsAppButton
            label="Ask on WhatsApp"
            message="Hi, I'd like to know today's specials at Dam Food Bar."
          />
        </Container>
      </section>
    </>
  );
}
