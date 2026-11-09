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
];

export const MENU_ITEMS: MenuItem[] = [
  { id: "eggs-beans-bread", categoryId: "breakfast", name: "Eggs, Beans & Bread", price: 3.0, available: true },
  { id: "rib-burger", categoryId: "mains", name: "Rib Burger & Chips", price: 3.5, available: true },
  { id: "quarter-chicken", categoryId: "mains", name: "1/4 Chicken & Chips", price: 3.5, available: true },
  { id: "sadza-chicken", categoryId: "mains", name: "Sadza & Chicken", price: 1.5, available: true },
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
  { id: "accommodation-1", category: "accommodation", type: "image", url: "https://images.pexels.com/photos/33613748/pexels-photo-33613748.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Inside a lodge room" },
  { id: "restaurant-1", category: "restaurant", type: "image", url: "https://images.pexels.com/photos/8021129/pexels-photo-8021129.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Dam Food Bar" },
  { id: "restaurant-2", category: "restaurant", type: "image", url: "https://images.pexels.com/photos/4078164/pexels-photo-4078164.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "On the braai" },
  { id: "gym-1", category: "gym", type: "image", url: "https://images.pexels.com/photos/7031705/pexels-photo-7031705.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "The gym" },
  { id: "activities-1", category: "activities", type: "image", url: "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Quad biking" },
  { id: "activities-2", category: "activities", type: "image", url: "https://images.pexels.com/photos/28263612/pexels-photo-28263612.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Zip line" },
  { id: "activities-3", category: "activities", type: "image", url: "https://images.pexels.com/photos/38492716/pexels-photo-38492716.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Horse riding" },
  { id: "events-1", category: "events", type: "image", url: "https://images.pexels.com/photos/35516036/pexels-photo-35516036.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Weddings & functions" },
  { id: "general-1", category: "general", type: "image", url: "https://images.pexels.com/photos/14455480/pexels-photo-14455480.jpeg?auto=compress&cs=tinysrgb&w=900", caption: "Good vibes" },
];
