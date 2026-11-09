import type { Activity } from "@/types";

export const DAMSIDE_ACTIVITIES: Activity[] = [
  {
    id: "boat-cruise",
    category: "damside",
    name: "Boat Cruise",
    description: "A scenic cruise along the water — a relaxed way to see Dam View from the dam itself.",
    pricing: { amount: 5, unit: "per_person" },
    image:
      "https://images.pexels.com/photos/36593940/pexels-photo-36593940.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "pedal-boats",
    category: "damside",
    name: "Pedal Boats",
    description: "Paddle yourself out onto the water — a favourite for families and groups.",
    pricing: { amount: 3, unit: "per_person" },
    image:
      "https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

/** Pricing not yet confirmed by the client — shown as "enquire for pricing". */
export const RECREATIONAL_ACTIVITIES: Activity[] = [
  {
    id: "quad-biking",
    category: "recreational",
    name: "Quad Biking",
    description: "Off-road quad trails around the resort grounds.",
    image:
      "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "horse-riding",
    category: "recreational",
    name: "Horse Riding",
    description: "Guided horse rides, suited to first-timers and experienced riders alike.",
    image:
      "https://images.pexels.com/photos/38492716/pexels-photo-38492716.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "zip-line",
    category: "recreational",
    name: "Zip Line",
    description: "A zip line ride across the resort grounds.",
    image:
      "https://images.pexels.com/photos/28263612/pexels-photo-28263612.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "trampolines",
    category: "recreational",
    name: "Trampolines",
    description: "A bounce house area for the kids — and the kids at heart.",
    image:
      "https://images.pexels.com/photos/4964542/pexels-photo-4964542.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "pool-tables",
    category: "recreational",
    name: "Pool Tables",
    description: "Pool tables and recreational games at the bar.",
    image:
      "https://images.pexels.com/photos/5055427/pexels-photo-5055427.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];
