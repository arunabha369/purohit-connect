import type { Purohit } from "../catalog";

export type Role = "user" | "purohit" | "admin";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "on-the-way"
  | "in-progress"
  | "completed"
  | "cancelled";

export type PaymentMethod = "UPI" | "Card" | "Wallet" | "Pay later";

/** paid: collected online · due: collect after the ceremony · refunded: returned to the family */
export type PaymentStatus = "paid" | "due" | "refunded";

export interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  /** Empty until the user completes onboarding after their first sign-in. */
  name: string;
  /** 10 digits, no country code. */
  phone: string;
  email: string;
  city: string;
  addresses: Address[];
  favorites: string[];
  status: "active" | "suspended";
  /** ISO date-time */
  joinedAt: string;
}

export interface TimelineEvent {
  status: string;
  /** ISO date-time */
  at: string;
  description: string;
}

export interface Pricing {
  base: number;
  platformFee: number;
  discount: number;
  total: number;
  coupon?: string;
}

export interface Booking {
  id: string;
  userId: string;
  purohitId: string;
  serviceId: string;
  /** Local `yyyy-MM-dd` */
  date: string;
  timeSlot: string;
  status: BookingStatus;
  address: string;
  city: string;
  notes: string;
  pricing: Pricing;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** ISO date-time */
  createdAt: string;
  timeline: TimelineEvent[];
  cancellation?: { by: Role; reason: string };
  reviewId?: string;
}

export interface Review {
  id: string;
  purohitId: string;
  bookingId?: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  /** Local `yyyy-MM-dd` */
  date: string;
  serviceName: string;
  /** "seed" reviews are already counted in the catalog's rating; "user" reviews adjust it. */
  source: "seed" | "user";
}

export interface WalletTxn {
  id: string;
  userId: string;
  /** Positive = credit, negative = debit. */
  amount: number;
  description: string;
  /** ISO date-time */
  at: string;
  bookingId?: string;
}

export type Audience =
  | { role: "user"; userId: string }
  | { role: "purohit"; purohitId: string }
  | { role: "admin" };

export interface AppNotification {
  id: string;
  to: Audience;
  title: string;
  body: string;
  href?: string;
  /** ISO date-time */
  at: string;
  read: boolean;
}

export interface PurohitApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  experience: number;
  languages: string[];
  specializations: string[];
  bio: string;
  startingPrice: number;
  status: "pending" | "approved" | "rejected";
  /** ISO date-time */
  submittedAt: string;
  reviewNote?: string;
  purohitId?: string;
}

export interface PurohitState {
  /** Purohit has paused new bookings themselves. */
  accepting: boolean;
  /** Admin has suspended the profile; hidden from the public site. */
  suspended: boolean;
  /** Local `yyyy-MM-dd` dates the purohit marked as unavailable. */
  blockedDates: string[];
}

export interface Session {
  role: Role;
  phone: string;
  userId?: string;
  purohitId?: string;
}

export interface DB {
  version: number;
  /** ISO date-time the demo data was generated. */
  seededAt: string;
  session: Session | null;
  users: User[];
  bookings: Booking[];
  reviews: Review[];
  walletTxns: WalletTxn[];
  notifications: AppNotification[];
  purohitState: Record<string, PurohitState>;
  applications: PurohitApplication[];
  /** Purohits created by approving applications. */
  addedPurohits: Purohit[];
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
