import Image from "next/image";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import type { GuestReview } from "@/types";

export function ReviewsSection({ reviews }: { reviews: GuestReview[] }) {
  return (
    <div>
      <SectionHeading
        eyebrow="From Our Guests"
        title="Share your Damview experience."
        subtitle="A sample of how guest reviews and photos will appear once review submissions go live. None of the reviews below are real yet."
      />

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            {review.image && (
              <div className="relative h-44 w-full">
                <Image src={review.image} alt={review.guestName} fill className="object-cover" />
              </div>
            )}
            <div className="flex flex-col gap-2 p-5">
              <div className="flex gap-0.5 text-dv-gold" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-sm italic text-muted-foreground">&quot;{review.quote}&quot;</p>
              <span className="text-xs font-semibold text-muted-foreground">— {review.guestName}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <WhatsAppButton
          label="Add your experience"
          message="Hi, I'd like to share a photo and review of my Dam View visit."
        />
      </div>
    </div>
  );
}
