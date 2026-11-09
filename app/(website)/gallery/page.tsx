import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { GalleryGrid } from "@/components/website/GalleryGrid";
import { ReviewsSection } from "@/components/website/ReviewsSection";
import { GALLERY_ITEMS } from "@/lib/data/gallery";
import { SAMPLE_REVIEWS } from "@/lib/data/reviews";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Gallery — ${SITE_NAME}`,
  description: "Photos from across Dam View Resort — accommodation, pool, restaurant, gym, waterfront, activities and events.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Every weekend looks a little like this."
        image="https://images.pexels.com/photos/137569/pexels-photo-137569.jpeg?auto=compress&cs=tinysrgb&w=1600"
      />

      <section className="py-20">
        <Container>
          <GalleryGrid items={GALLERY_ITEMS} />
          <p className="mt-10 text-sm text-muted-foreground">
            Shown here are sourced reference photos and real Dam View flyer crops, until our own
            photography is uploaded through the admin dashboard.
          </p>
        </Container>
      </section>

      <section className="bg-dv-cream py-20">
        <Container>
          <ReviewsSection reviews={SAMPLE_REVIEWS} />
        </Container>
      </section>
    </>
  );
}
