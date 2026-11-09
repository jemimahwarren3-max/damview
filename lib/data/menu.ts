import type { MenuCategory, MenuItem } from "@/types";

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "breakfast", name: "Breakfast" },
  { id: "mains", name: "Mains & Bar Favourites" },
];

/** Confirmed from the real Dam View menu flyer — not a full menu yet. */
export const MENU_ITEMS: MenuItem[] = [
  {
    id: "eggs-beans-bread",
    categoryId: "breakfast",
    name: "Eggs, Beans & Bread",
    price: 3.0,
    available: true,
  },
  {
    id: "rib-burger",
    categoryId: "mains",
    name: "Rib Burger & Chips",
    price: 3.5,
    available: true,
  },
  {
    id: "quarter-chicken",
    categoryId: "mains",
    name: "1/4 Chicken & Chips",
    price: 3.5,
    available: true,
  },
  {
    id: "sadza-chicken",
    categoryId: "mains",
    name: "Sadza & Chicken",
    price: 1.5,
    available: true,
  },
];

export const RESTAURANT_IMAGE =
  "https://images.pexels.com/photos/8021129/pexels-photo-8021129.jpeg?auto=compress&cs=tinysrgb&w=1200";
