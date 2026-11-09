export interface GuestReview {
  id: string;
  guestName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  image?: string;
  isSample: boolean;
}
