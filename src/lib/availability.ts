import { addDays, startOfDay } from "date-fns";
import { hashString, toISODate } from "./format";
import { timeSlots } from "./mock-data";

/**
 * Mock availability. Deterministic per purohit/date/slot so the profile
 * and checkout always agree, without needing a backend.
 */
export function isSlotAvailable(purohitId: string, dateISO: string, slot: string, now = new Date()) {
  if (hashString(`${purohitId}|${dateISO}|${slot}`) % 4 === 0) return false;
  // Same-day slots need at least 3 hours' notice.
  if (dateISO === toISODate(now)) {
    const match = slot.match(/^(\d{1,2}):(\d{2}) (AM|PM)/);
    if (match) {
      let hour = parseInt(match[1], 10) % 12;
      if (match[3] === "PM") hour += 12;
      return hour - now.getHours() >= 3;
    }
  }
  return true;
}

export function availableSlotCount(purohitId: string, dateISO: string, now = new Date()) {
  return timeSlots.filter((s) => isSlotAvailable(purohitId, dateISO, s.label, now)).length;
}

export function upcomingDays(count: number, from = new Date()) {
  const start = startOfDay(from);
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}
