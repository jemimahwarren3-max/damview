import type { RoomBlock } from "@/types";

export const ROOM_BLOCKS: RoomBlock[] = [
  {
    id: "a",
    name: "A Block",
    roomNumbers: ["A1", "A2", "A3", "A4", "A5", "A6"],
    ratePerStay: 25,
    stayDurationHours: 12,
  },
  {
    id: "b",
    name: "B Block",
    roomNumbers: ["B1", "B2", "B3", "B4", "B5", "B6"],
    ratePerStay: 30,
    stayDurationHours: 12,
  },
  {
    id: "f",
    name: "F Block",
    roomNumbers: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"],
    ratePerStay: 35,
    stayDurationHours: 12,
  },
  {
    id: "r",
    name: "R Block",
    roomNumbers: ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10"],
    ratePerStay: 25,
    stayDurationHours: 12,
  },
];

export const ROOM_IMAGE =
  "https://images.pexels.com/photos/33613748/pexels-photo-33613748.jpeg?auto=compress&cs=tinysrgb&w=1200";
