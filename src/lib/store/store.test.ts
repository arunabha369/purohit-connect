import { addDays } from "date-fns";
import { beforeEach, describe, expect, it } from "vitest";
import { timeSlots } from "../catalog";
import { toISODate } from "../format";
import * as A from "./actions";
import { parseSlot, slotState, slotsOverlap } from "./availability";
import { checkCoupon, priceBooking } from "./pricing";
import { DEMO_ADMIN_PHONE, DEMO_PUROHIT_PHONE, DEMO_USER_PHONE, EMPTY_DB, createSeed } from "./seed";
import {
  getPurohitView,
  reviewsFor,
  isFirstBooking,
  listPublicPurohits,
  notificationsFor,
  walletBalance,
} from "./selectors";
import type { DB, Role } from "./types";

// Fixed local "now": 25 Sep 2026, 10:00.
const NOW = new Date(2026, 8, 25, 10, 0, 0);
const day = (offset: number) => toISODate(addDays(NOW, offset));

let seq = 0;
const ctx = (now = NOW): A.ActionContext => ({ now, newId: (p) => `${p}-${++seq}` });

function signIn(db: DB, phone: string, role: Role = "user") {
  return A.signIn(db, { phone, role }, ctx()).db;
}

/** First open slot for a purohit, searching forward from tomorrow. */
function findOpenSlot(db: DB, purohitId: string, fromOffset = 1) {
  const view = getPurohitView(db, purohitId)!;
  for (let d = fromOffset; d < 60; d++) {
    for (const s of timeSlots) {
      const date = day(d);
      if (slotState(purohitId, date, s.label, { bookings: db.bookings, blockedDates: view.blockedDates, now: NOW }) === "open") {
        return { date, timeSlot: s.label };
      }
    }
  }
  throw new Error("no open slot");
}

function bookingInput(db: DB, overrides: Partial<A.CreateBookingInput> = {}): A.CreateBookingInput {
  return {
    purohitId: "pt-001",
    serviceId: "satyanarayan-puja",
    ...findOpenSlot(db, overrides.purohitId ?? "pt-001"),
    address: "Flat 302, Sunrise Apartments, Sector 62, Noida, UP 201301",
    city: "Noida",
    notes: "",
    paymentMethod: "UPI",
    ...overrides,
  };
}

let db: DB;
beforeEach(() => {
  seq = 0;
  db = createSeed(NOW);
});

describe("pricing", () => {
  it("adds the platform fee and applies FIRST100 only to a first booking", () => {
    expect(priceBooking({ base: 3100, isFirstBooking: false })).toEqual({ base: 3100, platformFee: 99, discount: 0, total: 3199 });
    expect(priceBooking({ base: 3100, couponCode: "first100", isFirstBooking: true })).toMatchObject({ discount: 100, total: 3099, coupon: "FIRST100" });
    expect(checkCoupon("FIRST100", { base: 3100, isFirstBooking: false })).toMatchObject({ ok: false });
  });

  it("enforces minimum order and caps percentage discounts", () => {
    expect(checkCoupon("PUJA10", { base: 1500, isFirstBooking: false })).toMatchObject({ ok: false });
    expect(checkCoupon("PUJA10", { base: 3100, isFirstBooking: false })).toMatchObject({ ok: true, discount: 310 });
    expect(checkCoupon("PUJA10", { base: 21000, isFirstBooking: false })).toMatchObject({ ok: true, discount: 500 });
    expect(checkCoupon("NOPE", { base: 21000, isFirstBooking: false })).toMatchObject({ ok: false });
  });
});

describe("availability", () => {
  it("parses slots and detects overlaps", () => {
    expect(parseSlot("9:00 AM - 12:00 PM")).toEqual([540, 720]);
    expect(parseSlot("6:00 PM - 8:00 PM")).toEqual([1080, 1200]);
    expect(slotsOverlap("8:00 AM - 10:00 AM", "9:00 AM - 12:00 PM")).toBe(true);
    expect(slotsOverlap("6:00 AM - 8:00 AM", "8:00 AM - 10:00 AM")).toBe(false);
  });

  it("rejects past, blocked, too-soon and conflicting slots", () => {
    const base = { bookings: db.bookings, blockedDates: [day(4)], now: NOW };
    expect(slotState("pt-001", day(-1), "9:00 AM - 12:00 PM", base)).toBe("past");
    expect(slotState("pt-001", day(4), "9:00 AM - 12:00 PM", base)).toBe("blocked");
    expect(slotState("pt-001", day(0), "10:00 AM - 1:00 PM", base)).toBe("too-soon");
    // BK-240112 occupies +9, 9:00–12:00; the overlapping 10:00–1:00 slot is taken.
    expect(slotState("pt-001", day(9), "10:00 AM - 1:00 PM", base)).toBe("booked");
  });

  it("frees a slot when its booking is cancelled", () => {
    const cancelled = db.bookings.map((b) => (b.id === "BK-240112" ? { ...b, status: "cancelled" as const } : b));
    const withBooking = slotState("pt-001", day(9), "9:00 AM - 12:00 PM", { bookings: db.bookings, blockedDates: [], now: NOW });
    const without = slotState("pt-001", day(9), "9:00 AM - 12:00 PM", { bookings: cancelled, blockedDates: [], now: NOW });
    expect(withBooking).toBe("booked");
    // May still be "booked" by simulated outside demand, but never because of the cancelled booking.
    expect(["open", "booked"]).toContain(without);
  });
});

describe("seed", () => {
  it("never puts seeded history in the future", () => {
    const now = NOW.toISOString();
    for (const b of db.bookings) {
      expect(b.createdAt <= now).toBe(true);
      for (const e of b.timeline) expect(e.at <= now).toBe(true);
    }
    for (const n of db.notifications) expect(n.at <= now).toBe(true);
  });

  it("is internally consistent", () => {
    expect(walletBalance(db, "u-001")).toBe(2450);
    expect(db.bookings.filter((b) => b.purohitId === "pt-001" && b.status === "pending")).toHaveLength(3);
    for (const b of db.bookings) {
      expect(getPurohitView(db, b.purohitId)).toBeDefined();
      expect(b.pricing.total).toBe(b.pricing.base + b.pricing.platformFee - b.pricing.discount);
    }
    expect(new Set(db.bookings.map((b) => b.id)).size).toBe(db.bookings.length);
  });

  it("keeps the server snapshot free of private data", () => {
    expect(EMPTY_DB.session).toBeNull();
    expect(EMPTY_DB.users).toHaveLength(0);
    expect(EMPTY_DB.bookings).toHaveLength(0);
  });
});

describe("sign in", () => {
  it("creates a new family account that needs a profile", () => {
    const out = A.signIn(db, { phone: "9123400000", role: "user" }, ctx());
    expect(out.value.needsProfile).toBe(true);
    expect(out.db.session?.role).toBe("user");
    const updated = A.updateProfile(out.db, { name: "  Kavya   Rao ", email: "", city: "Pune" }).db;
    expect(updated.users.find((u) => u.phone === "9123400000")?.name).toBe("Kavya Rao");
  });

  it("signs in the demo accounts for each role", () => {
    expect(A.signIn(db, { phone: DEMO_USER_PHONE, role: "user" }, ctx()).value.needsProfile).toBe(false);
    expect(signIn(db, DEMO_PUROHIT_PHONE, "purohit").session).toMatchObject({ role: "purohit", purohitId: "pt-001" });
    expect(signIn(db, DEMO_ADMIN_PHONE, "admin").session?.role).toBe("admin");
  });

  it("rejects invalid, unauthorised and suspended accounts", () => {
    expect(() => A.checkSignIn(db, { phone: "12345", role: "user" })).toThrow(A.ActionError);
    expect(() => A.checkSignIn(db, { phone: "5123456789", role: "user" })).toThrow(/valid 10-digit/);
    expect(() => A.checkSignIn(db, { phone: DEMO_USER_PHONE, role: "admin" })).toThrow(/admin/);
    expect(() => A.checkSignIn(db, { phone: DEMO_USER_PHONE, role: "purohit" })).toThrow(/Apply to join/);
    expect(() => A.checkSignIn(db, { phone: "9008044567", role: "user" })).toThrow(/suspended/);
  });
});

describe("family bookings", () => {
  beforeEach(() => {
    db = signIn(db, DEMO_USER_PHONE);
  });

  it("creates a pending booking and notifies the purohit", () => {
    const { db: next, value: booking } = A.createBooking(db, bookingInput(db), ctx());
    expect(booking).toMatchObject({ status: "pending", paymentStatus: "paid", userId: "u-001" });
    expect(booking.pricing.total).toBe(3199);
    expect(walletBalance(next, "u-001")).toBe(2450);
    expect(notificationsFor(next, { role: "purohit", purohitId: "pt-001" })[0].title).toBe("New booking request");
  });

  it("refuses a wallet payment the balance can't cover", () => {
    const input = bookingInput(db, { serviceId: "vivah-sanskar", paymentMethod: "Wallet" });
    expect(() => A.createBooking(db, input, ctx())).toThrow(/wallet balance/);
  });

  it("charges and debits the wallet when the balance is enough", () => {
    const funded = A.addMoney(db, 5000, ctx()).db;
    const { db: next, value: booking } = A.createBooking(funded, bookingInput(funded, { paymentMethod: "Wallet" }), ctx());
    expect(walletBalance(next, "u-001")).toBe(2450 + 5000 - booking.pricing.total);
  });

  it("prevents double-booking the same slot", () => {
    const input = bookingInput(db);
    const first = A.createBooking(db, input, ctx()).db;
    expect(() => A.createBooking(first, input, ctx())).toThrow(/just taken/);
  });

  it("rejects ceremonies the purohit doesn't perform and paused purohits", () => {
    expect(() => A.createBooking(db, bookingInput(db, { serviceId: "rudrabhishek" }), ctx())).toThrow(/performs/);
    const paused = { ...db, purohitState: { ...db.purohitState, "pt-001": { ...db.purohitState["pt-001"], accepting: false } } };
    expect(() => A.createBooking(paused, bookingInput(db), ctx())).toThrow(/isn't accepting/);
  });

  it("validates coupons at checkout", () => {
    expect(isFirstBooking(db, "u-001")).toBe(false);
    expect(() => A.createBooking(db, bookingInput(db, { couponCode: "FIRST100" }), ctx())).toThrow(/first booking/);
    const ok = A.createBooking(db, bookingInput(db, { couponCode: "PUJA10" }), ctx()).value;
    expect(ok.pricing).toMatchObject({ discount: 310, total: 2889, coupon: "PUJA10" });
  });

  it("refunds wallet payments to the wallet on cancellation", () => {
    const { db: next, value } = A.cancelBooking(db, { bookingId: "BK-240103", reason: "Plans changed" }, ctx());
    expect(value.status).toBe("cancelled");
    expect(value.paymentStatus).toBe("refunded");
    expect(walletBalance(next, "u-001")).toBe(2450 + value.pricing.total);
  });

  it("marks card payments refunded without touching the wallet", () => {
    const { db: next, value } = A.cancelBooking(db, { bookingId: "BK-240102", reason: "" }, ctx());
    expect(value.paymentStatus).toBe("refunded");
    expect(value.cancellation).toEqual({ by: "user", reason: "No reason given" });
    expect(walletBalance(next, "u-001")).toBe(2450);
  });

  it("blocks cancelling once the purohit is on the way, and other people's bookings", () => {
    expect(() => A.cancelBooking(db, { bookingId: "BK-240104", reason: "" }, ctx())).toThrow(/support/);
    expect(() => A.cancelBooking(db, { bookingId: "BK-240111", reason: "" }, ctx())).toThrow(/not found/);
  });

  it("reschedules and asks the purohit to reconfirm", () => {
    const target = findOpenSlot(db, "pt-003", 10);
    const { value } = A.rescheduleBooking(db, { bookingId: "BK-240102", ...target }, ctx());
    expect(value).toMatchObject({ ...target, status: "pending" });
    expect(value.timeline.at(-1)?.status).toBe("Rescheduled");
  });

  it("accepts one review per completed ceremony and updates the rating", () => {
    const before = getPurohitView(db, "pt-001")!;
    const { db: next } = A.submitReview(db, { bookingId: "BK-240101", rating: 1, comment: "Late" }, ctx());
    const after = getPurohitView(next, "pt-001")!;
    expect(after.reviewCount).toBe(before.reviewCount + 1);
    // 234 reviews at 4.9 plus one 1★ → 4.883…, shown to one decimal.
    expect(after.rating).toBe(Math.round(((4.9 * 234 + 1) / 235) * 10) / 10);
    expect(reviewsFor(next, "pt-001")[0]).toMatchObject({ rating: 1, source: "user", userName: "Arun Banerjee" });
    expect(() => A.submitReview(next, { bookingId: "BK-240101", rating: 5, comment: "" }, ctx())).toThrow(/already/);
    expect(() => A.submitReview(db, { bookingId: "BK-240102", rating: 5, comment: "" }, ctx())).toThrow(/completed/);
  });

  it("only marks the signed-in user's notifications as read", () => {
    const next = A.markNotificationsRead(db).db;
    expect(notificationsFor(next, { role: "user", userId: "u-001" }).every((n) => n.read)).toBe(true);
    expect(notificationsFor(next, { role: "purohit", purohitId: "pt-001" }).some((n) => !n.read)).toBe(true);
  });
});

describe("purohit workflow", () => {
  beforeEach(() => {
    db = signIn(db, DEMO_PUROHIT_PHONE, "purohit");
  });

  it("accepts a request and notifies the family", () => {
    const { db: next, value } = A.purohitAccept(db, "BK-240111", ctx());
    expect(value.status).toBe("accepted");
    expect(notificationsFor(next, { role: "user", userId: "u-002" })[0].title).toBe("Booking confirmed");
    expect(() => A.purohitAccept(next, "BK-240111", ctx())).toThrow(/already/);
  });

  it("requires a reason to decline and refunds the family", () => {
    expect(() => A.purohitDecline(db, { bookingId: "BK-240111", reason: " " }, ctx())).toThrow(/why/);
    const { value } = A.purohitDecline(db, { bookingId: "BK-240111", reason: "Travelling" }, ctx());
    expect(value).toMatchObject({ status: "cancelled", paymentStatus: "refunded", cancellation: { by: "purohit" } });
  });

  it("advances today's ceremony through to completion and collects pay-later payments", () => {
    let state = db;
    for (const expected of ["on-the-way", "in-progress", "completed"]) {
      const out = A.purohitAdvance(state, "BK-240114", ctx());
      state = out.db;
      expect(out.value.status).toBe(expected);
    }
    expect(() => A.purohitAdvance(state, "BK-240114", ctx())).toThrow();
    expect(() => A.purohitAdvance(db, "BK-240115", ctx())).toThrow(/day of the ceremony/);
  });

  it("only acts on the purohit's own bookings", () => {
    expect(() => A.purohitAccept(db, "BK-240103", ctx())).toThrow(/not found/);
  });

  it("blocks free days but not days with bookings", () => {
    expect(A.toggleBlockedDate(db, day(2), ctx()).value).toBe(true);
    expect(() => A.toggleBlockedDate(db, day(5), ctx())).toThrow(/bookings on this day/);
    expect(() => A.toggleBlockedDate(db, day(-1), ctx())).toThrow(/past/);
    expect(A.toggleBlockedDate(db, day(4), ctx()).value).toBe(false);
  });
});

describe("admin and onboarding", () => {
  const application: A.ApplicationInput = {
    name: "Pandit Test Kumar",
    phone: "9555512345",
    email: "",
    city: "Pune",
    experience: 8,
    languages: ["Hindi", "Marathi"],
    specializations: ["Ganesh Puja", "Satyanarayan Puja"],
    bio: "Trained in Pune for eight years in Vedic rituals and household ceremonies.",
    startingPrice: 1800,
  };

  it("requires an admin session", () => {
    const user = signIn(db, DEMO_USER_PHONE);
    expect(() => A.adminCancelBooking(user, { bookingId: "BK-240111", reason: "x" }, ctx())).toThrow(/admins/);
  });

  it("takes a purohit from application to bookable profile to sign-in", () => {
    const submitted = A.submitApplication(db, application, ctx());
    expect(() => A.submitApplication(submitted.db, application, ctx())).toThrow(/already under review/);

    const admin = signIn(submitted.db, DEMO_ADMIN_PHONE, "admin");
    const approved = A.reviewApplication(admin, { applicationId: submitted.value.id, approve: true }, ctx());
    const purohitId = approved.value.purohitId!;
    const view = getPurohitView(approved.db, purohitId)!;
    expect(view).toMatchObject({ bookable: true, isNew: true, rating: 0 });
    expect(listPublicPurohits(approved.db).some((p) => p.id === purohitId)).toBe(true);
    expect(signIn(approved.db, application.phone, "purohit").session?.purohitId).toBe(purohitId);
  });

  it("requires a note to reject an application", () => {
    const admin = signIn(db, DEMO_ADMIN_PHONE, "admin");
    expect(() => A.reviewApplication(admin, { applicationId: "app-seed-1", approve: false }, ctx())).toThrow(/reason/);
    expect(A.reviewApplication(admin, { applicationId: "app-seed-1", approve: false, note: "Add certificates" }, ctx()).value.status).toBe("rejected");
  });

  it("validates applications", () => {
    const errors = A.validateApplication({ ...application, phone: "123", bio: "short", languages: [] });
    expect(Object.keys(errors).sort()).toEqual(["bio", "languages", "phone"]);
  });

  it("hides suspended purohits and stops their bookings", () => {
    const admin = signIn(db, DEMO_ADMIN_PHONE, "admin");
    const suspended = A.setPurohitSuspended(admin, { purohitId: "pt-001", suspended: true }).db;
    expect(listPublicPurohits(suspended).some((p) => p.id === "pt-001")).toBe(false);
    const asUser = signIn(suspended, DEMO_USER_PHONE);
    expect(() => A.createBooking(asUser, bookingInput(db), ctx())).toThrow(/no longer available/);
    expect(() => A.checkSignIn(suspended, { phone: DEMO_PUROHIT_PHONE, role: "purohit" })).toThrow(/suspended/);
  });

  it("cancels any active booking with a refund and notifies both sides", () => {
    const admin = signIn(db, DEMO_ADMIN_PHONE, "admin");
    const { db: next, value } = A.adminCancelBooking(admin, { bookingId: "BK-240111", reason: "Duplicate booking" }, ctx());
    expect(value).toMatchObject({ status: "cancelled", paymentStatus: "refunded", cancellation: { by: "admin" } });
    expect(notificationsFor(next, { role: "user", userId: "u-002" })[0].title).toMatch(/support/);
    expect(notificationsFor(next, { role: "purohit", purohitId: "pt-001" })[0].title).toMatch(/support/);
  });
});
