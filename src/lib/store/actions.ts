import { ADMIN_PHONES, getService, getServicesForPurohit, type Purohit } from "../catalog";
import { formatDate, formatINR, toISODate } from "../format";
import { OCCUPYING_STATUSES, slotState, slotsOverlap } from "./availability";
import { checkCoupon, priceBooking } from "./pricing";
import { createSeed } from "./seed";
import { audienceMatches, getAllPurohits, getPurohitView, isFirstBooking, walletBalance } from "./selectors";
import type {
  Address,
  AppNotification,
  Audience,
  Booking,
  DB,
  PaymentMethod,
  PurohitApplication,
  Review,
  Role,
  TimelineEvent,
  User,
} from "./types";

export class ActionError extends Error {}

export interface ActionContext {
  now: Date;
  newId: (prefix: string) => string;
}

export type ActionOutput<T> = { db: DB; value: T };

function fail(message: string): never {
  throw new ActionError(message);
}

export const PHONE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Internal helpers ────────────────────────────────────────

function currentUser(db: DB): User {
  const s = db.session;
  if (!s || s.role !== "user") fail("Please sign in to continue.");
  const user = db.users.find((u) => u.id === s.userId);
  if (!user) fail("Your account could not be found. Please sign in again.");
  if (user.status === "suspended") fail("Your account is suspended. Please contact support.");
  return user;
}

function currentPurohitId(db: DB): string {
  const s = db.session;
  if (!s || s.role !== "purohit" || !s.purohitId) fail("Please sign in as a purohit to continue.");
  return s.purohitId;
}

function requireAdmin(db: DB) {
  if (db.session?.role !== "admin") fail("Only admins can do this.");
}

function findBooking(db: DB, id: string): Booking {
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) fail("Booking not found.");
  return booking;
}

function replaceUser(db: DB, user: User): DB {
  return { ...db, users: db.users.map((u) => (u.id === user.id ? user : u)) };
}

function replaceBooking(db: DB, booking: Booking): DB {
  return { ...db, bookings: db.bookings.map((b) => (b.id === booking.id ? booking : b)) };
}

function event(ctx: ActionContext, status: string, description: string): TimelineEvent {
  return { status, description, at: ctx.now.toISOString() };
}

function notify(
  db: DB,
  ctx: ActionContext,
  to: Audience,
  n: Pick<AppNotification, "title" | "body" | "href">
): DB {
  const notification: AppNotification = { ...n, id: ctx.newId("nt"), to, at: ctx.now.toISOString(), read: false };
  return { ...db, notifications: [notification, ...db.notifications] };
}

function purohitName(db: DB, id: string) {
  return getAllPurohits(db).find((p) => p.id === id)?.name ?? "Your purohit";
}

function serviceName(id: string) {
  return getService(id)?.name ?? "Puja";
}

/** Cancels a booking and returns money that was collected online. */
function cancelWithRefund(
  db: DB,
  ctx: ActionContext,
  booking: Booking,
  by: Role,
  reason: string,
  description: string
): { db: DB; booking: Booking } {
  let next = db;
  let paymentStatus = booking.paymentStatus;
  if (booking.paymentStatus === "paid") {
    paymentStatus = "refunded";
    if (booking.paymentMethod === "Wallet") {
      next = {
        ...next,
        walletTxns: [
          {
            id: ctx.newId("wt"),
            userId: booking.userId,
            amount: booking.pricing.total,
            description: `Refund for ${booking.id}`,
            at: ctx.now.toISOString(),
            bookingId: booking.id,
          },
          ...next.walletTxns,
        ],
      };
    }
  }
  const updated: Booking = {
    ...booking,
    status: "cancelled",
    paymentStatus,
    cancellation: { by, reason },
    timeline: [...booking.timeline, event(ctx, "Cancelled", description)],
  };
  return { db: replaceBooking(next, updated), booking: updated };
}

function refundNote(booking: Booking) {
  if (booking.paymentStatus !== "paid") return "";
  return booking.paymentMethod === "Wallet"
    ? ` ${formatINR(booking.pricing.total)} has been refunded to your wallet.`
    : ` A refund of ${formatINR(booking.pricing.total)} to your ${booking.paymentMethod === "UPI" ? "UPI account" : "card"} will arrive in 3–5 working days.`;
}

// ── Session ─────────────────────────────────────────────────

/** Checks a phone number can sign in with the chosen role, before an OTP is sent. */
export function checkSignIn(db: DB, input: { phone: string; role: Role }): ActionOutput<{ isNewUser: boolean }> {
  const { phone, role } = input;
  if (!PHONE_PATTERN.test(phone)) fail("Enter a valid 10-digit Indian mobile number.");
  if (role === "admin") {
    if (!ADMIN_PHONES.includes(phone)) fail("This number isn't authorised for admin access.");
    return { db, value: { isNewUser: false } };
  }
  if (role === "purohit") {
    const purohit = getAllPurohits(db).find((p) => p.phone === phone);
    if (!purohit) fail("No purohit account is linked to this number. Apply to join first.");
    if (db.purohitState[purohit.id]?.suspended) fail("This purohit account is suspended. Please contact support.");
    return { db, value: { isNewUser: false } };
  }
  const user = db.users.find((u) => u.phone === phone);
  if (user?.status === "suspended") fail("This account is suspended. Please contact support.");
  return { db, value: { isNewUser: !user } };
}

export function signIn(
  db: DB,
  input: { phone: string; role: Role },
  ctx: ActionContext
): ActionOutput<{ needsProfile: boolean }> {
  checkSignIn(db, input);
  const { phone, role } = input;
  if (role === "admin") {
    return { db: { ...db, session: { role, phone } }, value: { needsProfile: false } };
  }
  if (role === "purohit") {
    const purohit = getAllPurohits(db).find((p) => p.phone === phone)!;
    return { db: { ...db, session: { role, phone, purohitId: purohit.id } }, value: { needsProfile: false } };
  }
  let next = db;
  let user = db.users.find((u) => u.phone === phone);
  if (!user) {
    user = {
      id: ctx.newId("u"),
      name: "",
      phone,
      email: "",
      city: "",
      addresses: [],
      favorites: [],
      status: "active",
      joinedAt: ctx.now.toISOString(),
    };
    next = { ...next, users: [...next.users, user] };
  }
  return {
    db: { ...next, session: { role: "user", phone, userId: user.id } },
    value: { needsProfile: !user.name },
  };
}

export function signOut(db: DB): ActionOutput<void> {
  return { db: { ...db, session: null }, value: undefined };
}

export function resetDemo(_db: DB, _input: void, ctx: ActionContext): ActionOutput<void> {
  return { db: createSeed(ctx.now), value: undefined };
}

// ── Profile ─────────────────────────────────────────────────

export function updateProfile(
  db: DB,
  input: { name: string; email: string; city: string }
): ActionOutput<User> {
  const user = currentUser(db);
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = input.email.trim();
  if (name.length < 2) fail("Enter your full name.");
  if (email && !EMAIL_PATTERN.test(email)) fail("Enter a valid email address.");
  if (!input.city) fail("Choose your city.");
  const updated = { ...user, name, email, city: input.city };
  return { db: replaceUser(db, updated), value: updated };
}

export function addAddress(
  db: DB,
  input: { label: string; address: string },
  ctx: ActionContext
): ActionOutput<Address> {
  const user = currentUser(db);
  const address = input.address.trim();
  if (address.length < 10) fail("Enter the full address with city and PIN code.");
  const created: Address = {
    id: ctx.newId("addr"),
    label: input.label.trim() || "Other",
    address,
    isDefault: user.addresses.length === 0,
  };
  return { db: replaceUser(db, { ...user, addresses: [...user.addresses, created] }), value: created };
}

export function setDefaultAddress(db: DB, addressId: string): ActionOutput<void> {
  const user = currentUser(db);
  if (!user.addresses.some((a) => a.id === addressId)) fail("Address not found.");
  const addresses = user.addresses.map((a) => ({ ...a, isDefault: a.id === addressId }));
  return { db: replaceUser(db, { ...user, addresses }), value: undefined };
}

export function removeAddress(db: DB, addressId: string): ActionOutput<void> {
  const user = currentUser(db);
  const removed = user.addresses.find((a) => a.id === addressId);
  if (!removed) fail("Address not found.");
  let addresses = user.addresses.filter((a) => a.id !== addressId);
  if (removed.isDefault && addresses.length) {
    addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
  }
  return { db: replaceUser(db, { ...user, addresses }), value: undefined };
}

export function toggleFavorite(db: DB, purohitId: string): ActionOutput<boolean> {
  const user = currentUser(db);
  const saved = !user.favorites.includes(purohitId);
  const favorites = saved ? [...user.favorites, purohitId] : user.favorites.filter((id) => id !== purohitId);
  return { db: replaceUser(db, { ...user, favorites }), value: saved };
}

export const WALLET_TOP_UP = { min: 100, max: 50000 };

export function addMoney(db: DB, amount: number, ctx: ActionContext): ActionOutput<number> {
  const user = currentUser(db);
  if (!Number.isInteger(amount) || amount < WALLET_TOP_UP.min || amount > WALLET_TOP_UP.max) {
    fail(`Enter an amount between ${formatINR(WALLET_TOP_UP.min)} and ${formatINR(WALLET_TOP_UP.max)}.`);
  }
  const next: DB = {
    ...db,
    walletTxns: [
      { id: ctx.newId("wt"), userId: user.id, amount, description: "Added money to wallet", at: ctx.now.toISOString() },
      ...db.walletTxns,
    ],
  };
  return { db: next, value: walletBalance(next, user.id) };
}

// ── Bookings (family) ───────────────────────────────────────

export interface CreateBookingInput {
  purohitId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  /** Save a newly entered address to the user's profile under this label. */
  saveAddressAs?: string;
}

export function createBooking(db: DB, input: CreateBookingInput, ctx: ActionContext): ActionOutput<Booking> {
  const user = currentUser(db);
  const purohit = getPurohitView(db, input.purohitId);
  if (!purohit || purohit.suspended) fail("This purohit is no longer available.");
  if (!purohit.bookable) fail(`${purohit.name} isn't accepting new bookings right now.`);

  const service = getServicesForPurohit(purohit).find((s) => s.id === input.serviceId);
  if (!service) fail("Choose a ceremony this purohit performs.");

  const state = slotState(purohit.id, input.date, input.timeSlot, {
    bookings: db.bookings,
    blockedDates: purohit.blockedDates,
    now: ctx.now,
  });
  if (state !== "open") fail("That time slot was just taken. Please choose another.");

  const address = input.address.trim();
  if (address.length < 10) fail("Enter the full ceremony address.");

  const firstBooking = isFirstBooking(db, user.id);
  if (input.couponCode) {
    const check = checkCoupon(input.couponCode, { base: service.basePrice, isFirstBooking: firstBooking });
    if (!check.ok) fail(check.error);
  }
  const pricing = priceBooking({ base: service.basePrice, couponCode: input.couponCode, isFirstBooking: firstBooking });

  if (input.paymentMethod === "Wallet" && walletBalance(db, user.id) < pricing.total) {
    fail("Your wallet balance is too low for this booking.");
  }

  const booking: Booking = {
    id: ctx.newId("BK"),
    userId: user.id,
    purohitId: purohit.id,
    serviceId: service.id,
    date: input.date,
    timeSlot: input.timeSlot,
    status: "pending",
    address,
    city: input.city.trim(),
    notes: input.notes.trim().slice(0, 500),
    pricing,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === "Pay later" ? "due" : "paid",
    createdAt: ctx.now.toISOString(),
    timeline: [event(ctx, "Booking placed", `Request sent to ${purohit.name} for ${service.name}`)],
  };

  let next: DB = { ...db, bookings: [booking, ...db.bookings] };
  if (input.paymentMethod === "Wallet") {
    next = {
      ...next,
      walletTxns: [
        {
          id: ctx.newId("wt"),
          userId: user.id,
          amount: -pricing.total,
          description: `Payment for ${booking.id}`,
          at: ctx.now.toISOString(),
          bookingId: booking.id,
        },
        ...next.walletTxns,
      ],
    };
  }
  if (input.saveAddressAs !== undefined) {
    next = addAddress(next, { label: input.saveAddressAs, address }, ctx).db;
  }
  next = notify(next, ctx, { role: "purohit", purohitId: purohit.id }, {
    title: "New booking request",
    body: `${user.name} requested ${service.name} on ${formatDate(booking.date, "weekday")}, ${booking.timeSlot}.`,
    href: "/purohit-dashboard#requests",
  });
  return { db: next, value: booking };
}

/** Families can change plans until the purohit sets off. */
export function canFamilyModify(booking: Booking) {
  return booking.status === "pending" || booking.status === "accepted";
}

export function cancelBooking(
  db: DB,
  input: { bookingId: string; reason: string },
  ctx: ActionContext
): ActionOutput<Booking> {
  const user = currentUser(db);
  const booking = findBooking(db, input.bookingId);
  if (booking.userId !== user.id) fail("Booking not found.");
  if (!canFamilyModify(booking)) fail("This booking can no longer be cancelled online. Please call support.");
  const reason = input.reason.trim() || "No reason given";
  const result = cancelWithRefund(db, ctx, booking, "user", reason, `You cancelled this booking: ${reason}.${refundNote(booking)}`);
  const next = notify(result.db, ctx, { role: "purohit", purohitId: booking.purohitId }, {
    title: "Booking cancelled",
    body: `${user.name} cancelled ${serviceName(booking.serviceId)} on ${formatDate(booking.date, "weekday")}.`,
    href: "/purohit-dashboard#schedule",
  });
  return { db: next, value: result.booking };
}

export function rescheduleBooking(
  db: DB,
  input: { bookingId: string; date: string; timeSlot: string },
  ctx: ActionContext
): ActionOutput<Booking> {
  const user = currentUser(db);
  const booking = findBooking(db, input.bookingId);
  if (booking.userId !== user.id) fail("Booking not found.");
  if (!canFamilyModify(booking)) fail("This booking can no longer be rescheduled online. Please call support.");
  if (booking.date === input.date && booking.timeSlot === input.timeSlot) fail("Choose a different date or time.");
  const purohit = getPurohitView(db, booking.purohitId);
  const state = slotState(booking.purohitId, input.date, input.timeSlot, {
    bookings: db.bookings,
    blockedDates: purohit?.blockedDates ?? [],
    now: ctx.now,
    excludeBookingId: booking.id,
  });
  if (state !== "open") fail("That time slot isn't available. Please choose another.");

  const wasConfirmed = booking.status === "accepted";
  const updated: Booking = {
    ...booking,
    date: input.date,
    timeSlot: input.timeSlot,
    status: "pending",
    timeline: [
      ...booking.timeline,
      event(
        ctx,
        "Rescheduled",
        `Moved to ${formatDate(input.date, "weekday")}, ${input.timeSlot}.${wasConfirmed ? " Waiting for the purohit to reconfirm." : ""}`
      ),
    ],
  };
  const next = notify(replaceBooking(db, updated), ctx, { role: "purohit", purohitId: booking.purohitId }, {
    title: "Booking rescheduled",
    body: `${user.name} moved ${serviceName(booking.serviceId)} to ${formatDate(input.date, "weekday")}, ${input.timeSlot}. Please confirm.`,
    href: "/purohit-dashboard#requests",
  });
  return { db: next, value: updated };
}

export function submitReview(
  db: DB,
  input: { bookingId: string; rating: number; comment: string },
  ctx: ActionContext
): ActionOutput<Review> {
  const user = currentUser(db);
  const booking = findBooking(db, input.bookingId);
  if (booking.userId !== user.id) fail("Booking not found.");
  if (booking.status !== "completed") fail("You can review a ceremony once it's completed.");
  if (booking.reviewId) fail("You've already reviewed this ceremony.");
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) fail("Choose a rating from 1 to 5 stars.");

  const review: Review = {
    id: ctx.newId("rv"),
    purohitId: booking.purohitId,
    bookingId: booking.id,
    userId: user.id,
    userName: user.name,
    rating: input.rating,
    comment: input.comment.trim().slice(0, 500),
    date: toISODate(ctx.now),
    serviceName: serviceName(booking.serviceId),
    source: "user",
  };
  let next: DB = { ...replaceBooking(db, { ...booking, reviewId: review.id }), reviews: [review, ...db.reviews] };
  next = notify(next, ctx, { role: "purohit", purohitId: booking.purohitId }, {
    title: `New ${review.rating}★ review`,
    body: `${user.name} reviewed ${review.serviceName}.`,
    href: `/purohit/${booking.purohitId}`,
  });
  return { db: next, value: review };
}

// ── Notifications ───────────────────────────────────────────

export function sessionAudience(db: DB): Audience | null {
  const s = db.session;
  if (!s) return null;
  if (s.role === "user" && s.userId) return { role: "user", userId: s.userId };
  if (s.role === "purohit" && s.purohitId) return { role: "purohit", purohitId: s.purohitId };
  if (s.role === "admin") return { role: "admin" };
  return null;
}

export function markNotificationsRead(db: DB, ids?: string[]): ActionOutput<void> {
  const audience = sessionAudience(db);
  if (!audience) fail("Please sign in to continue.");
  const notifications = db.notifications.map((n) =>
    audienceMatches(n.to, audience) && (!ids || ids.includes(n.id)) ? { ...n, read: true } : n
  );
  return { db: { ...db, notifications }, value: undefined };
}

// ── Purohit workflow ────────────────────────────────────────

function ownBooking(db: DB, bookingId: string) {
  const purohitId = currentPurohitId(db);
  const booking = findBooking(db, bookingId);
  if (booking.purohitId !== purohitId) fail("Booking not found.");
  return booking;
}

export function purohitAccept(db: DB, bookingId: string, ctx: ActionContext): ActionOutput<Booking> {
  const booking = ownBooking(db, bookingId);
  if (booking.status !== "pending") fail("This request has already been handled.");
  // Only confirmed (non-pending) ceremonies can clash; other pending requests are still just requests.
  const conflict = db.bookings.some(
    (b) =>
      b.id !== booking.id &&
      b.purohitId === booking.purohitId &&
      b.date === booking.date &&
      b.status !== "pending" &&
      OCCUPYING_STATUSES.includes(b.status) &&
      slotsOverlap(b.timeSlot, booking.timeSlot)
  );
  if (conflict) fail("You already have a confirmed ceremony at this time. Decline this request instead.");
  const name = purohitName(db, booking.purohitId);
  const updated: Booking = {
    ...booking,
    status: "accepted",
    timeline: [...booking.timeline, event(ctx, "Confirmed", `${name} confirmed your booking`)],
  };
  const next = notify(replaceBooking(db, updated), ctx, { role: "user", userId: booking.userId }, {
    title: "Booking confirmed",
    body: `${name} confirmed your ${serviceName(booking.serviceId)} on ${formatDate(booking.date, "weekday")}.`,
    href: `/bookings/${booking.id}`,
  });
  return { db: next, value: updated };
}

export function purohitDecline(
  db: DB,
  input: { bookingId: string; reason: string },
  ctx: ActionContext
): ActionOutput<Booking> {
  const booking = ownBooking(db, input.bookingId);
  if (booking.status !== "pending" && booking.status !== "accepted") fail("This booking can't be cancelled now.");
  const reason = input.reason.trim();
  if (!reason) fail("Tell the family why you can't make it.");
  const name = purohitName(db, booking.purohitId);
  const verb = booking.status === "pending" ? "declined" : "cancelled";
  const result = cancelWithRefund(
    db,
    ctx,
    booking,
    "purohit",
    reason,
    `${name} ${verb} this booking: ${reason}.${refundNote(booking)}`
  );
  const next = notify(result.db, ctx, { role: "user", userId: booking.userId }, {
    title: `Booking ${verb} by purohit`,
    body: `${name} can't perform ${serviceName(booking.serviceId)} on ${formatDate(booking.date, "weekday")}. Find another purohit — any payment will be refunded.`,
    href: `/bookings/${booking.id}`,
  });
  return { db: next, value: result.booking };
}

const ADVANCE: Partial<Record<Booking["status"], { to: Booking["status"]; label: string; userTitle: string }>> = {
  accepted: { to: "on-the-way", label: "On the way", userTitle: "Panditji is on the way" },
  "on-the-way": { to: "in-progress", label: "Ceremony started", userTitle: "Your ceremony has started" },
  "in-progress": { to: "completed", label: "Completed", userTitle: "Ceremony completed" },
};

export function nextPurohitStep(booking: Booking) {
  return ADVANCE[booking.status];
}

export function purohitAdvance(db: DB, bookingId: string, ctx: ActionContext): ActionOutput<Booking> {
  const booking = ownBooking(db, bookingId);
  const step = ADVANCE[booking.status];
  if (!step) fail("This booking can't be updated.");
  if (booking.status === "accepted" && booking.date > toISODate(ctx.now)) {
    fail(`You can start travelling on the day of the ceremony (${formatDate(booking.date, "weekday")}).`);
  }
  const service = serviceName(booking.serviceId);
  const name = purohitName(db, booking.purohitId);
  const descriptions: Record<string, string> = {
    "on-the-way": `${name} is on the way to your venue`,
    "in-progress": `${service} has begun`,
    completed: `${service} completed successfully`,
  };
  const updated: Booking = {
    ...booking,
    status: step.to,
    paymentStatus: step.to === "completed" && booking.paymentStatus === "due" ? "paid" : booking.paymentStatus,
    timeline: [...booking.timeline, event(ctx, step.label, descriptions[step.to])],
  };
  const next = notify(replaceBooking(db, updated), ctx, { role: "user", userId: booking.userId }, {
    title: step.userTitle,
    body:
      step.to === "completed"
        ? `How was your ${service}? Share a review to help other families.`
        : descriptions[step.to],
    href: `/bookings/${booking.id}`,
  });
  return { db: next, value: updated };
}

export function setAccepting(db: DB, accepting: boolean): ActionOutput<void> {
  const purohitId = currentPurohitId(db);
  const state = db.purohitState[purohitId];
  return {
    db: { ...db, purohitState: { ...db.purohitState, [purohitId]: { ...state, accepting } } },
    value: undefined,
  };
}

export function toggleBlockedDate(db: DB, date: string, ctx: ActionContext): ActionOutput<boolean> {
  const purohitId = currentPurohitId(db);
  if (date < toISODate(ctx.now)) fail("You can't change past dates.");
  const state = db.purohitState[purohitId];
  const blocked = state.blockedDates.includes(date);
  if (!blocked) {
    const hasBooking = db.bookings.some(
      (b) => b.purohitId === purohitId && b.date === date && OCCUPYING_STATUSES.includes(b.status)
    );
    if (hasBooking) fail("You have bookings on this day. Handle them before marking the day off.");
  }
  const blockedDates = blocked ? state.blockedDates.filter((d) => d !== date) : [...state.blockedDates, date].sort();
  return {
    db: { ...db, purohitState: { ...db.purohitState, [purohitId]: { ...state, blockedDates } } },
    value: !blocked,
  };
}

// ── Admin ───────────────────────────────────────────────────

export function adminCancelBooking(
  db: DB,
  input: { bookingId: string; reason: string },
  ctx: ActionContext
): ActionOutput<Booking> {
  requireAdmin(db);
  const booking = findBooking(db, input.bookingId);
  if (!OCCUPYING_STATUSES.includes(booking.status)) fail("Only active bookings can be cancelled.");
  const reason = input.reason.trim();
  if (!reason) fail("Add a reason for the cancellation.");
  const result = cancelWithRefund(
    db,
    ctx,
    booking,
    "admin",
    reason,
    `Cancelled by PurohitConnect support: ${reason}.${refundNote(booking)}`
  );
  let next = notify(result.db, ctx, { role: "user", userId: booking.userId }, {
    title: "Booking cancelled by support",
    body: `${serviceName(booking.serviceId)} on ${formatDate(booking.date, "weekday")} was cancelled: ${reason}.`,
    href: `/bookings/${booking.id}`,
  });
  next = notify(next, ctx, { role: "purohit", purohitId: booking.purohitId }, {
    title: "Booking cancelled by support",
    body: `${serviceName(booking.serviceId)} on ${formatDate(booking.date, "weekday")} was cancelled: ${reason}.`,
    href: "/purohit-dashboard#schedule",
  });
  return { db: next, value: result.booking };
}

export function setPurohitSuspended(
  db: DB,
  input: { purohitId: string; suspended: boolean }
): ActionOutput<void> {
  requireAdmin(db);
  const state = db.purohitState[input.purohitId];
  if (!state) fail("Purohit not found.");
  return {
    db: { ...db, purohitState: { ...db.purohitState, [input.purohitId]: { ...state, suspended: input.suspended } } },
    value: undefined,
  };
}

export function setUserStatus(
  db: DB,
  input: { userId: string; status: User["status"] }
): ActionOutput<void> {
  requireAdmin(db);
  const user = db.users.find((u) => u.id === input.userId);
  if (!user) fail("User not found.");
  return { db: replaceUser(db, { ...user, status: input.status }), value: undefined };
}

export interface ApplicationInput {
  name: string;
  phone: string;
  email: string;
  city: string;
  experience: number;
  languages: string[];
  specializations: string[];
  bio: string;
  startingPrice: number;
}

export function validateApplication(input: ApplicationInput): Partial<Record<keyof ApplicationInput, string>> {
  const errors: Partial<Record<keyof ApplicationInput, string>> = {};
  if (input.name.trim().length < 3) errors.name = "Enter your full name.";
  if (!PHONE_PATTERN.test(input.phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (input.email.trim() && !EMAIL_PATTERN.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (!input.city) errors.city = "Choose your city.";
  if (!Number.isInteger(input.experience) || input.experience < 1 || input.experience > 70)
    errors.experience = "Enter your years of experience (1–70).";
  if (!input.languages.length) errors.languages = "Choose at least one language.";
  if (!input.specializations.length) errors.specializations = "Choose at least one ceremony.";
  if (input.bio.trim().length < 40) errors.bio = "Tell families about your training and experience (at least 40 characters).";
  if (!Number.isInteger(input.startingPrice) || input.startingPrice < 500 || input.startingPrice > 100000)
    errors.startingPrice = "Enter a starting price between ₹500 and ₹1,00,000.";
  return errors;
}

export function submitApplication(
  db: DB,
  input: ApplicationInput,
  ctx: ActionContext
): ActionOutput<PurohitApplication> {
  const errors = validateApplication(input);
  const first = Object.values(errors)[0];
  if (first) fail(first);
  if (getAllPurohits(db).some((p) => p.phone === input.phone)) {
    fail("This number already has a purohit account. Sign in instead.");
  }
  if (db.applications.some((a) => a.phone === input.phone && a.status === "pending")) {
    fail("An application with this number is already under review.");
  }
  const application: PurohitApplication = {
    id: ctx.newId("app"),
    name: input.name.trim(),
    phone: input.phone,
    email: input.email.trim(),
    city: input.city,
    experience: input.experience,
    languages: input.languages,
    specializations: input.specializations,
    bio: input.bio.trim(),
    startingPrice: input.startingPrice,
    status: "pending",
    submittedAt: ctx.now.toISOString(),
  };
  let next: DB = { ...db, applications: [application, ...db.applications] };
  next = notify(next, ctx, { role: "admin" }, {
    title: "New purohit application",
    body: `${application.name} from ${application.city} applied to join.`,
    href: "/admin#applications",
  });
  return { db: next, value: application };
}

export function reviewApplication(
  db: DB,
  input: { applicationId: string; approve: boolean; note?: string },
  ctx: ActionContext
): ActionOutput<PurohitApplication> {
  requireAdmin(db);
  const app = db.applications.find((a) => a.id === input.applicationId);
  if (!app) fail("Application not found.");
  if (app.status !== "pending") fail("This application has already been reviewed.");

  if (!input.approve) {
    const note = input.note?.trim();
    if (!note) fail("Add a reason so the applicant knows what to fix.");
    const rejected: PurohitApplication = { ...app, status: "rejected", reviewNote: note };
    return {
      db: { ...db, applications: db.applications.map((a) => (a.id === app.id ? rejected : a)) },
      value: rejected,
    };
  }

  if (getAllPurohits(db).some((p) => p.phone === app.phone)) fail("A purohit with this phone number already exists.");
  const purohit: Purohit = {
    id: ctx.newId("pt"),
    phone: app.phone,
    name: app.name,
    photo: "",
    city: app.city,
    languages: app.languages,
    specializations: app.specializations,
    rating: 0,
    reviewCount: 0,
    experience: app.experience,
    priceRange: { min: app.startingPrice, max: app.startingPrice * 5 },
    bio: app.bio,
    certificates: [],
    available: true,
    gallery: [],
    completedPujas: 0,
    responseTime: "2 hours",
  };
  const approved: PurohitApplication = { ...app, status: "approved", purohitId: purohit.id };
  return {
    db: {
      ...db,
      addedPurohits: [...db.addedPurohits, purohit],
      purohitState: { ...db.purohitState, [purohit.id]: { accepting: true, suspended: false, blockedDates: [] } },
      applications: db.applications.map((a) => (a.id === app.id ? approved : a)),
    },
    value: approved,
  };
}
