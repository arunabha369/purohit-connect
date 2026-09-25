import { describe, expect, it } from "vitest";
import { buildIcs } from "./calendar";

describe("buildIcs", () => {
  it("creates a valid event with escaped text", () => {
    const ics = buildIcs({
      uid: "BK-ABC123",
      title: "Satyanarayan Puja",
      description: "With Pandit Ramesh Shastri; bring flowers, fruits",
      location: "Flat 302, Sector 62, Noida",
      date: "2026-10-01",
      timeSlot: "5:00 PM - 7:00 PM",
      now: new Date(Date.UTC(2026, 8, 25)),
    });
    const lines = ics.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("UID:BK-ABC123@purohitconnect.in");
    expect(lines).toContain("DESCRIPTION:With Pandit Ramesh Shastri\\; bring flowers\\, fruits");
    const start = lines.find((l) => l.startsWith("DTSTART:"))!;
    const end = lines.find((l) => l.startsWith("DTEND:"))!;
    expect(start).toMatch(/^DTSTART:\d{8}T\d{6}Z$/);
    // Two-hour slot regardless of the machine's time zone.
    const toDate = (v: string) =>
      new Date(`${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(9, 11)}:${v.slice(11, 13)}:00Z`);
    expect(toDate(end.slice(6)).getTime() - toDate(start.slice(8)).getTime()).toBe(2 * 60 * 60 * 1000);
  });
});
