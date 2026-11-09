import type { GuestReview } from "@/types";

/**
 * Sample-only placeholders showing how guest reviews will render once the
 * review submission + moderation backend exists (Stage 10+). None of these
 * are real guest reviews.
 */
export const SAMPLE_REVIEWS: GuestReview[] = [
  {
    id: "sample-1",
    guestName: "Guest name (sample)",
    rating: 5,
    quote: "[Sample review text goes here]",
    image: "https://images.pexels.com/photos/8910365/pexels-photo-8910365.jpeg?auto=compress&cs=tinysrgb&w=600",
    isSample: true,
  },
  {
    id: "sample-2",
    guestName: "Guest name (sample)",
    rating: 5,
    quote: "[Sample review text goes here]",
    image: "https://images.pexels.com/photos/9287491/pexels-photo-9287491.jpeg?auto=compress&cs=tinysrgb&w=600",
    isSample: true,
  },
  {
    id: "sample-3",
    guestName: "Guest name (sample)",
    rating: 5,
    quote: "[Sample review text goes here]",
    image: "https://images.pexels.com/photos/6210611/pexels-photo-6210611.jpeg?auto=compress&cs=tinysrgb&w=600",
    isSample: true,
  },
];
