/**
 * Static snapshots for admin pages ("use client" components, which can't
 * easily await the server-only Supabase calls lib/data/*.ts now makes).
 * Mirrors exactly what's seeded in Supabase — kept here until real staff
 * login exists (Stage 10) and admin pages can safely query the
 * authenticated-only tables themselves.
 */
import type { RoomBlock, GymPackage, MenuCategory, MenuItem, Activity, GalleryItem } from "@/types";

export const ROOM_BLOCKS: RoomBlock[] = [
  { id: "a", name: "A Block", displayName: "Garden Rooms", roomNumbers: ["A1", "A2", "A3", "A4", "A5", "A6"], ratePerStay: 25, stayDurationHours: 12 },
  { id: "b", name: "B Block", displayName: "Poolside Rooms", roomNumbers: ["B1", "B2", "B3", "B4", "B5", "B6"], ratePerStay: 30, stayDurationHours: 12 },
  { id: "f", name: "F Block", displayName: "Premier Rooms", roomNumbers: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"], ratePerStay: 35, stayDurationHours: 12 },
  { id: "r", name: "R Block", displayName: "Riverside Rooms", roomNumbers: ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10"], ratePerStay: 25, stayDurationHours: 12 },
];

export const GYM_PACKAGES: GymPackage[] = [
  { id: "day-pass", name: "Day Pass", price: 10, billingPeriod: "session", features: ["Full gym access for one visit", "Open 24/7"] },
  { id: "monthly", name: "Monthly Membership", price: null, billingPeriod: "month", features: ["Unlimited visits", "Full equipment access", "Open 24/7"] },
];

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "breakfast", name: "Breakfast" },
  { id: "mains", name: "Mains & Bar Favourites" },
  { id: "beers-ciders", name: "Beers & Ciders" },
  { id: "spirits-whisky", name: "Spirits & Whisky" },
  { id: "wine", name: "Wine" },
  { id: "soft-drinks", name: "Soft Drinks & Juices" },
];

export const MENU_ITEMS: MenuItem[] = [
  { id: "eggs-beans-bread", categoryId: "breakfast", name: "Eggs, Beans & Bread", price: 3.0, available: true },
  { id: "rib-burger", categoryId: "mains", name: "Rib Burger & Chips", price: 3.5, available: true },
  { id: "quarter-chicken", categoryId: "mains", name: "1/4 Chicken & Chips", price: 3.5, available: true },
  { id: "sadza-chicken", categoryId: "mains", name: "Sadza & Chicken", price: 1.5, available: true },
  // Drinks pricing sourced from real stock sheet (reference/documents/current stock Nov 2 2026.xlsx)
  { id: "zambezi-quart", categoryId: "beers-ciders", name: "Zambezi Lager (Quart)", price: 2.0, available: true },
  { id: "castle-quart", categoryId: "beers-ciders", name: "Castle Lager (Quart)", price: 1.75, available: true },
  { id: "black-label-quart", categoryId: "beers-ciders", name: "Black Label (Quart)", price: 1.75, available: true },
  { id: "castle-lite", categoryId: "beers-ciders", name: "Castle Lite", price: 1.5, available: true },
  { id: "windhoek", categoryId: "beers-ciders", name: "Windhoek", price: 2.0, available: true },
  { id: "corona", categoryId: "beers-ciders", name: "Corona", price: 2.0, available: true },
  { id: "heineken", categoryId: "beers-ciders", name: "Heineken", price: 2.0, available: true },
  { id: "stella", categoryId: "beers-ciders", name: "Stella Artois", price: 2.0, available: true },
  { id: "hunters-dry", categoryId: "beers-ciders", name: "Hunters Dry", price: 2.0, available: true },
  { id: "hunters-gold", categoryId: "beers-ciders", name: "Hunters Gold", price: 2.0, available: true },
  { id: "savanna-dry", categoryId: "beers-ciders", name: "Savanna Dry", price: 2.0, available: true },
  { id: "brutal-fruit", categoryId: "beers-ciders", name: "Brutal Fruit", price: 2.0, available: true },
  { id: "gordons-gin", categoryId: "spirits-whisky", name: "Gordons Gin", price: 10.0, available: true },
  { id: "amarula", categoryId: "spirits-whisky", name: "Amarula", price: 15.0, available: true },
  { id: "jameson", categoryId: "spirits-whisky", name: "Jameson", price: 25.0, available: true },
  { id: "jack-daniels", categoryId: "spirits-whisky", name: "Jack Daniels", price: 30.0, available: true },
  { id: "southern-comfort", categoryId: "spirits-whisky", name: "Southern Comfort", price: 15.0, available: true },
  { id: "hennessy", categoryId: "spirits-whisky", name: "Hennessy", price: 40.0, available: true },
  { id: "jw-black", categoryId: "spirits-whisky", name: "Johnnie Walker Black", price: 35.0, available: true },
  { id: "jw-green", categoryId: "spirits-whisky", name: "Johnnie Walker Green", price: 65.0, available: true },
  { id: "double-black", categoryId: "spirits-whisky", name: "Double Black", price: 45.0, available: true },
  { id: "rooiberg", categoryId: "wine", name: "Rooiberg", price: 10.0, available: true },
  { id: "bon-courage", categoryId: "wine", name: "Bon Courage", price: 10.0, available: true },
  { id: "simonsig", categoryId: "wine", name: "Simonsig", price: 15.0, available: true },
  { id: "laurensford", categoryId: "wine", name: "Laurensford", price: 15.0, available: true },
  { id: "delheim", categoryId: "wine", name: "Delheim", price: 20.0, available: true },
  { id: "belaire-rose", categoryId: "wine", name: "Belaire Rose (Sparkling)", price: 50.0, available: true },
  { id: "minute-maid", categoryId: "soft-drinks", name: "Minute Maid", price: 1.5, available: true },
  { id: "liqui-fruit", categoryId: "soft-drinks", name: "Liqui Fruit", price: 2.5, available: true },
  { id: "red-bull", categoryId: "soft-drinks", name: "Red Bull", price: 2.0, available: true },
  { id: "energade", categoryId: "soft-drinks", name: "Energade", price: 1.5, available: true },
  { id: "schweppes", categoryId: "soft-drinks", name: "Schweppes", price: 0.5, available: true },
  { id: "bottled-water", categoryId: "soft-drinks", name: "Bottled Water", price: 0.5, available: true },
  { id: "can-soft-drink", categoryId: "soft-drinks", name: "Can Soft Drink", price: 1.0, available: true },
  { id: "tropika", categoryId: "soft-drinks", name: "Tropika Juice", price: 2.0, available: true },
];

export const DAMSIDE_ACTIVITIES: Activity[] = [
  {
    id: "boat-cruise",
    category: "damside",
    name: "Boat Cruise",
    description: "A scenic cruise along the water — a relaxed way to see Damview from the dam itself.",
    pricing: { amount: 5, unit: "per_person" },
    image: "https://images.pexels.com/photos/36593940/pexels-photo-36593940.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "pedal-boats",
    category: "damside",
    name: "Pedal Boats",
    description: "Paddle yourself out onto the water — a favourite for families and groups.",
    pricing: { amount: 3, unit: "per_person" },
    image: "https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

export const RECREATIONAL_ACTIVITIES: Activity[] = [
  {
    id: "quad-biking",
    category: "recreational",
    name: "Quad Biking",
    description: "Off-road quad trails around the resort grounds.",
    pricing: { amount: 3, unit: "per_person" },
    image: "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "horse-riding",
    category: "recreational",
    name: "Horse Riding",
    description: "Guided horse rides, suited to first-timers and experienced riders alike.",
    pricing: { amount: 3, unit: "per_person" },
    image: "https://images.pexels.com/photos/38492716/pexels-photo-38492716.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "zip-line",
    category: "recreational",
    name: "Zip Line",
    description: "A zip line ride across the resort grounds.",
    pricing: { amount: 3, unit: "per_person" },
    image: "https://images.pexels.com/photos/28263612/pexels-photo-28263612.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "trampolines",
    category: "recreational",
    name: "Trampolines",
    description: "A bounce house area for the kids, and the kids at heart.",
    pricing: { amount: 3, unit: "per_person" },
    image: "https://images.pexels.com/photos/4964542/pexels-photo-4964542.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "pool-tables",
    category: "recreational",
    name: "Pool Tables",
    description: "Pool tables and recreational games at the bar.",
    pricing: { amount: 3, unit: "per_person" },
    image: "https://images.pexels.com/photos/5055427/pexels-photo-5055427.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "soccer-field",
    category: "recreational",
    name: "Soccer Field",
    description: "An open field for a proper game, bring your own team or join one already playing.",
    pricing: { amount: 3, unit: "per_person" },
    image: "https://images.pexels.com/photos/29440634/pexels-photo-29440634.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "pool-1", category: "pool", type: "image", url: "https://images.pexels.com/photos/137569/pexels-photo-137569.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "The pool deck" },
  { id: "waterfront-1", category: "waterfront", type: "image", url: "https://images.pexels.com/photos/36567120/pexels-photo-36567120.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "On the water" },
  { id: "waterfront-2", category: "waterfront", type: "image", url: "https://images.pexels.com/photos/36593940/pexels-photo-36593940.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Boat cruise" },
  { id: "accommodation-1", category: "accommodation", type: "image", url: "/images/accommodation/real/room-1.jpg", caption: "Inside a Damview room" },
  { id: "accommodation-2", category: "accommodation", type: "image", url: "/images/accommodation/real/room-2.jpg", caption: "Inside a Damview room" },
  { id: "accommodation-3", category: "accommodation", type: "image", url: "/images/accommodation/real/room-3.jpg", caption: "Inside a Damview room" },
  { id: "accommodation-4", category: "accommodation", type: "image", url: "/images/accommodation/real/room-4.jpg", caption: "Inside a Damview room" },
  { id: "restaurant-1", category: "restaurant", type: "image", url: "https://images.pexels.com/photos/8021129/pexels-photo-8021129.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Dam Food Bar" },
  { id: "restaurant-2", category: "restaurant", type: "image", url: "https://images.pexels.com/photos/4078164/pexels-photo-4078164.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "On the braai" },
  { id: "gym-1", category: "gym", type: "image", url: "https://images.pexels.com/photos/7031705/pexels-photo-7031705.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "The gym" },
  { id: "activities-1", category: "activities", type: "image", url: "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Quad biking" },
  { id: "activities-2", category: "activities", type: "image", url: "https://images.pexels.com/photos/28263612/pexels-photo-28263612.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Zip line" },
  { id: "activities-3", category: "activities", type: "image", url: "https://images.pexels.com/photos/38492716/pexels-photo-38492716.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Horse riding" },
  { id: "events-1", category: "events", type: "image", url: "https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Weddings & functions" },
  { id: "general-1", category: "general", type: "image", url: "https://images.pexels.com/photos/14455480/pexels-photo-14455480.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Good vibes" },
];
