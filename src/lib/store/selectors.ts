import { purohits as catalogPurohits, type Purohit } from "../catalog";
import type { AppNotification, Audience, Booking, DB, PurohitState, Review, User } from "./types";

export interface PurohitView extends Purohit {
  accepting: boolean;
  suspended: boolean;
  /** Visible, accepting and not suspended. */
  bookable: boolean;
  blockedDates: string[];
  /** Newly approved purohits have no reviews yet. */
  isNew: boolean;
}

export function getAllPurohits(db: DB): Purohit[] {
  return [...catalogPurohits, ...db.addedPurohits];
}

const defaultState: PurohitState = { accepting: true, suspended: false, blockedDates: [] };

/** Rating shown publicly: the catalog baseline adjusted by reviews submitted in the app. */
function liveRating(purohit: Purohit, reviews: Review[]) {
  const added = reviews.filter((r) => r.purohitId === purohit.id && r.source === "user");
  const count = purohit.reviewCount + added.length;
  if (!count) return { rating: 0, reviewCount: 0 };
  const total = purohit.rating * purohit.reviewCount + added.reduce((s, r) => s + r.rating, 0);
  return { rating: Math.round((total / count) * 10) / 10, reviewCount: count };
}

export function toPurohitView(db: DB, purohit: Purohit): PurohitView {
  const state = db.purohitState[purohit.id] ?? { ...defaultState, accepting: purohit.available };
  const { rating, reviewCount } = liveRating(purohit, db.reviews);
  return {
    ...purohit,
    rating,
    reviewCount,
    accepting: state.accepting,
    suspended: state.suspended,
    available: state.accepting && !state.suspended,
    bookable: state.accepting && !state.suspended,
    blockedDates: state.blockedDates,
    isNew: reviewCount === 0,
  };
}

export function getPurohitView(db: DB, id: string | undefined): PurohitView | undefined {
  const purohit = getAllPurohits(db).find((p) => p.id === id);
  return purohit ? toPurohitView(db, purohit) : undefined;
}

/** Purohits shown on the public site (suspended profiles are hidden). */
export function listPublicPurohits(db: DB): PurohitView[] {
  return getAllPurohits(db)
    .map((p) => toPurohitView(db, p))
    .filter((p) => !p.suspended);
}

export function reviewsFor(db: DB, purohitId: string): Review[] {
  return db.reviews
    .filter((r) => r.purohitId === purohitId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function walletBalance(db: DB, userId: string) {
  return db.walletTxns.filter((t) => t.userId === userId).reduce((sum, t) => sum + t.amount, 0);
}

export function walletHistory(db: DB, userId: string) {
  return db.walletTxns.filter((t) => t.userId === userId).sort((a, b) => b.at.localeCompare(a.at));
}

export function userBookings(db: DB, userId: string): Booking[] {
  return db.bookings.filter((b) => b.userId === userId);
}

export function purohitBookings(db: DB, purohitId: string): Booking[] {
  return db.bookings.filter((b) => b.purohitId === purohitId);
}

/** A "first booking" coupon applies until the family has a booking that wasn't cancelled. */
export function isFirstBooking(db: DB, userId: string) {
  return !db.bookings.some((b) => b.userId === userId && b.status !== "cancelled");
}

export function findUser(db: DB, id: string | undefined): User | undefined {
  return db.users.find((u) => u.id === id);
}

export function audienceMatches(to: Audience, audience: Audience) {
  if (to.role !== audience.role) return false;
  if (to.role === "user" && audience.role === "user") return to.userId === audience.userId;
  if (to.role === "purohit" && audience.role === "purohit") return to.purohitId === audience.purohitId;
  return true;
}

export function notificationsFor(db: DB, audience: Audience | null): AppNotification[] {
  if (!audience) return [];
  return db.notifications.filter((n) => audienceMatches(n.to, audience)).sort((a, b) => b.at.localeCompare(a.at));
}
