import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { StickerBadge } from "@/components/shared/StickerBadge";
import { getMenu, RESTAURANT_IMAGE } from "@/lib/data/menu";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Bar & Restaurant, ${SITE_NAME}`,
  description: "The Dam Food Bar menu at Damview Resort, Chitungwiza.",
};

export default async function RestaurantPage() {
  const { categories, items } = await getMenu();

  return (
    <>
      <PageHero
        eyebrow="Bar & Restaurant"
        title="Dam Food Bar"
        subtitle="Fully stocked bars, wine specials and a braai that doesn't stop."
        image={RESTAURANT_IMAGE}
      />

      {/* Split screen: sticky food imagery + menu */}
      <section className="bg-[#FBF3EA]">
        <Container className="flex flex-col gap-0 lg:flex-row">
          <div className="flex flex-col gap-4 py-16 lg:sticky lg:top-16 lg:h-fit lg:w-[40%] lg:py-20 lg:pr-10">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
              <Image
                src="https://images.pexels.com/photos/37238864/pexels-photo-37238864.jpeg?auto=compress&cs=tinysrgb&w=900"
                alt="Steaks sizzling on the grill"
                fill
                className="object-cover"
              />
            </div>
            <StickerBadge tone="forest" tilt="right" className="w-fit">
              Good Food · Better Vibes
            </StickerBadge>
          </div>

          <div className="flex-1 py-16 lg:py-20 lg:pl-10">
            <span className="font-promo text-sm tracking-widest text-dv-terracotta">The Menu</span>
            <h2 className="mt-2 font-serif text-3xl text-dv-forest sm:text-4xl">
              A few favourites to start with.
            </h2>
            <p className="mt-3 max-w-md text-dv-black/70">
              This is a sample of our menu. The full breakfast, lunch and supper list is coming soon.
            </p>

            <div className="mt-10 flex flex-col gap-10">
              {categories.map((category) => (
                <div key={category.id}>
                  <h3 className="font-serif text-lg text-dv-forest">{category.name}</h3>
                  <div className="mt-4 flex flex-col divide-y divide-dv-terracotta/15">
                    {items.filter((item) => item.categoryId === category.id).map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <span className="font-medium">{item.name}</span>
                        <PriceDisplay amount={item.price} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3">
            <div>
              <h3 className="font-serif text-lg text-dv-forest">Bar</h3>
              <p className="mt-1 text-sm text-dv-black/70">Fully stocked, with regular wine specials.</p>
            </div>
            <div>
              <h3 className="font-serif text-lg text-dv-forest">Butchery</h3>
              <p className="mt-1 text-sm text-dv-black/70">Fresh cuts, ready for the braai.</p>
            </div>
            <div>
              <h3 className="font-serif text-lg text-dv-forest">Braai Stand &amp; Charcoal</h3>
              <p className="mt-1 text-sm text-dv-black/70">Everything provided, from $10.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-dv-terracotta py-16">
        <Container className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-serif text-2xl text-dv-ivory">Want to see today&apos;s specials?</h2>
          <WhatsAppButton
            label="Ask on WhatsApp"
            message="Hi, I'd like to know today's specials at Dam Food Bar."
            className="bg-dv-ivory text-dv-terracotta hover:bg-dv-cream"
          />
        </Container>
      </section>
    </>
  );
}
