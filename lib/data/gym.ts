import type { GymPackage } from "@/types";

/** Pricing not yet confirmed by the client — shown as "TBC" until provided. */
export const GYM_PACKAGES: GymPackage[] = [
  {
    id: "day-pass",
    name: "Day Pass",
    price: null,
    billingPeriod: "session",
    features: ["Full gym access for one visit", "Open 24/7"],
  },
  {
    id: "monthly",
    name: "Monthly Membership",
    price: null,
    billingPeriod: "month",
    features: ["Unlimited visits", "Full equipment access", "Open 24/7"],
  },
];

export const GYM_IMAGE =
  "https://images.pexels.com/photos/7031705/pexels-photo-7031705.jpeg?auto=compress&cs=tinysrgb&w=1200";
