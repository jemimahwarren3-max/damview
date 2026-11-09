import type { LodgeEnquiry, ActivityEnquiry, EventEnquiry } from "@/types";

/**
 * Sample data only — there is no backend yet (Stage 10). This stands in for
 * what real enquiry records will look like once bookings/enquiries are
 * actually stored. None of this is real guest data.
 */
export const SAMPLE_LODGE_ENQUIRIES: LodgeEnquiry[] = [
  {
    id: "le-1",
    name: "Tendai Moyo",
    phone: "0771234567",
    blockId: "f",
    checkIn: "2026-11-14",
    guests: 2,
    status: "new",
    createdAt: "2026-11-09T08:12:00Z",
  },
  {
    id: "le-2",
    name: "Rudo & Tinashe",
    phone: "0779876543",
    blockId: "b",
    checkIn: "2026-11-15",
    guests: 4,
    status: "contacted",
    createdAt: "2026-11-09T07:40:00Z",
  },
  {
    id: "le-3",
    name: "Kudakwashe P.",
    phone: "0775551234",
    blockId: "a",
    checkIn: "2026-11-16",
    guests: 1,
    status: "confirmed",
    createdAt: "2026-11-08T18:05:00Z",
  },
];

export const SAMPLE_ACTIVITY_ENQUIRIES: ActivityEnquiry[] = [
  {
    id: "ae-1",
    name: "Nyasha Chikono",
    phone: "0774440000",
    activityId: "quad-biking",
    partySize: 3,
    status: "new",
    createdAt: "2026-11-09T09:02:00Z",
  },
  {
    id: "ae-2",
    name: "Farai Dube",
    phone: "0771112222",
    activityId: "horse-riding",
    partySize: 2,
    status: "contacted",
    createdAt: "2026-11-08T15:20:00Z",
  },
];

export const SAMPLE_EVENT_ENQUIRIES: EventEnquiry[] = [
  {
    id: "ee-1",
    name: "Chiedza Events Co.",
    phone: "0772223333",
    eventType: "wedding",
    proposedDate: "2026-12-06",
    expectedGuests: 120,
    facilitiesRequired: ["Venue", "Sound system"],
    cateringRequired: true,
    accommodationRequired: true,
    status: "new",
    createdAt: "2026-11-07T11:00:00Z",
  },
];
