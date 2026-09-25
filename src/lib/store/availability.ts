import { addDays, startOfDay } from "date-fns";
import { hashString, toISODate } from "../format";
import { timeSlots } from "../catalog";
import type { Booking, BookingStatus } from "./types";

/** Statuses that occupy the purohit's calendar. */
export const OCCUPYING_STATUSES: BookingStatus[] = ["pending", "accepted", "on-the-way", "in-progress"];

/** Minimum notice for same-day bookings, in hours. */
export const SAME_DAY_NOTICE_HOURS = 3;

/** "9:00 AM - 12:00 PM" → [540, 720] (minutes from midnight). */
export function parseSlot(slot: string): [number, number] | null {
  const m = slot.match(/^(\d{1,2}):(\d{2}) (AM|PM) - (\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!m) return null;
  const toMinutes = (h: string, min: string, ampm: string) => {
    let hour = parseInt(h, 10) % 12;
    if (ampm === "PM") hour += 12;
    return hour * 60 + parseInt(min, 10);
  };
  return [toMinutes(m[1], m[2], m[3]), toMinutes(m[4], m[5], m[6])];
}

export function slotsOverlap(a: string, b: string) {
  const ra = parseSlot(a);
  const rb = parseSlot(b);
  if (!ra || !rb) return a === b;
  return ra[0] < rb[1] && rb[0] < ra[1];
}

export interface AvailabilityContext {
  bookings: Booking[];
  blockedDates: string[];
  now: Date;
  /** Ignore this booking when checking conflicts (used when rescheduling). */
  excludeBookingId?: string;
}

export type SlotState = "open" | "booked" | "blocked" | "past" | "too-soon";

export function slotState(
  purohitId: string,
  dateISO: string,
  slot: string,
  ctx: AvailabilityContext
): SlotState {
  const today = toISODate(ctx.now);
  if (dateISO < today) return "past";
  if (ctx.blockedDates.includes(dateISO)) return "blocked";

  if (dateISO === today) {
    const range = parseSlot(slot);
    const minutesNow = ctx.now.getHours() * 60 + ctx.now.getMinutes();
    if (range && range[0] - minutesNow < SAME_DAY_NOTICE_HOURS * 60) return "too-soon";
  }

  const conflict = ctx.bookings.some(
    (b) =>
      b.purohitId === purohitId &&
      b.id !== ctx.excludeBookingId &&
      b.date === dateISO &&
      OCCUPYING_STATUSES.includes(b.status) &&
      slotsOverlap(b.timeSlot, slot)
  );
  if (conflict) return "booked";

  // Simulates demand from outside this demo: roughly one slot in four is taken.
  if (hashString(`${purohitId}|${dateISO}|${slot}`) % 4 === 0) return "booked";

  return "open";
}

export function isSlotAvailable(purohitId: string, dateISO: string, slot: string, ctx: AvailabilityContext) {
  return slotState(purohitId, dateISO, slot, ctx) === "open";
}

export function availableSlotCount(purohitId: string, dateISO: string, ctx: AvailabilityContext) {
  return timeSlots.filter((s) => isSlotAvailable(purohitId, dateISO, s.label, ctx)).length;
}

export function upcomingDays(count: number, from = new Date()) {
  const start = startOfDay(from);
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}
