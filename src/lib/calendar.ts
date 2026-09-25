import { parseISO } from "date-fns";
import { parseSlot } from "./store/availability";

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

/** Builds an iCalendar event for a ceremony. Times are the user's local time, stored as UTC. */
export function buildIcs(event: {
  uid: string;
  title: string;
  description: string;
  location: string;
  date: string;
  timeSlot: string;
  now?: Date;
}) {
  const day = parseISO(event.date);
  const [startMin, endMin] = parseSlot(event.timeSlot) ?? [9 * 60, 11 * 60];
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, startMin);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, endMin);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PurohitConnect//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@purohitconnect.in`,
    `DTSTAMP:${icsDate(event.now ?? new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT12H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(event.title)} tomorrow`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
