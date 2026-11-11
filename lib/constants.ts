export const SITE_NAME = "Damview Resort";

export const TAGLINE = "Good times. Great views. Unforgettable moments.";

export const CONTACT_NUMBERS = {
  primary: "263774446001",
  secondary: "263774446004",
} as const;

export const LOCATION =
  "Damview, Chikwanha, along Seke Road, next to Zuva Service Station, Chitungwiza";

export const ENTRANCE_FEE = {
  weekday: 2,
  weekend: 3,
} as const;

export const LODGE_HOURLY_RATE = 5;
export const LODGE_HOURLY_MIN_HOURS = 2;
export const LODGE_HOURLY_MAX_HOURS = 11; // beyond this, the full day rate is the better deal

export const ECOCASH = {
  line: "032679",
  dialCode: "*151*3*1*032679#",
} as const;

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/damviewchitown/",
} as const;

export const WEBSITE_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Accommodation", href: "/accommodation" },
  { label: "Gym", href: "/gym" },
  { label: "Restaurant", href: "/restaurant" },
  { label: "Damside", href: "/damside" },
  { label: "Activities", href: "/activities" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

export const HOME_FACILITIES = [
  {
    title: "Accommodation & Lodges",
    description: "A range of room styles, from $25 per 12-hour stay or $5 per hour.",
    href: "/accommodation",
    image: "https://images.pexels.com/photos/33613748/pexels-photo-33613748.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Damview Gym",
    description: "Open 24/7 with full equipment for a proper workout, any time of day.",
    href: "/gym",
    image: "https://images.pexels.com/photos/7031705/pexels-photo-7031705.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Bar & Restaurant",
    description: "Fully stocked bars, wine specials, burgers and chips, and a braai that doesn't stop.",
    href: "/restaurant",
    image: "https://images.pexels.com/photos/8021129/pexels-photo-8021129.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Damside Experience",
    description: "Boat cruises from $5pp, pedal boats from $3pp, and a waterfront made for slow afternoons.",
    href: "/damside",
    image: "https://images.pexels.com/photos/36593940/pexels-photo-36593940.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Recreational Activities",
    description: "Quad bikes, horse riding, zip lines, trampolines and pool tables, from $3 per person.",
    href: "/activities",
    image: "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
] as const;

export const EVENT_CATEGORIES = [
  "Birthdays",
  "Graduations",
  "Family gatherings",
  "Private parties",
  "Corporate & group events",
  "Weddings",
] as const;

export const GALLERY_PREVIEW = [
  {
    caption: "The pool deck",
    image: "https://images.pexels.com/photos/137569/pexels-photo-137569.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
  {
    caption: "On the water",
    image: "https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
  {
    caption: "Quad bike trails",
    image: "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
  {
    caption: "Weddings & functions",
    image: "https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
] as const;
