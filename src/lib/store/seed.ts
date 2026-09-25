import { addDays, addMinutes, min, startOfDay } from "date-fns";
import { getCatalogPurohit, getService, purohits, sampleReviews } from "../catalog";
import { toISODate } from "../format";
import { parseSlot } from "./availability";
import { priceBooking } from "./pricing";
import type {
  AppNotification,
  Booking,
  BookingStatus,
  DB,
  PaymentMethod,
  PurohitApplication,
  PurohitState,
  Review,
  TimelineEvent,
  User,
  WalletTxn,
} from "./types";

export const DB_VERSION = 1;

/** Demo account with sample bookings. */
export const DEMO_USER_PHONE = "9876543210";
/** Demo purohit account (Pandit Ramesh Shastri). */
export const DEMO_PUROHIT_PHONE = "9000000001";
/** Demo admin account. */
export const DEMO_ADMIN_PHONE = "9000000000";

interface SeedBooking {
  id: string;
  userId: string;
  purohitId: string;
  serviceId: string;
  /** Days from today (negative = past). */
  offset: number;
  slot: string;
  status: BookingStatus;
  method: PaymentMethod;
  notes?: string;
  cancelReason?: string;
}

const seedUsers: Omit<User, "joinedAt" | "favorites" | "addresses" | "status" | "email">[] = [
  { id: "u-001", name: "Arun Banerjee", phone: DEMO_USER_PHONE, city: "Delhi" },
  { id: "u-002", name: "Rahul Gupta", phone: "9811022345", city: "Noida" },
  { id: "u-003", name: "Meena Devi", phone: "9999012345", city: "Delhi" },
  { id: "u-004", name: "Sunil Yadav", phone: "9415033890", city: "Varanasi" },
  { id: "u-005", name: "Neha Sharma", phone: "9838012345", city: "Lucknow" },
  { id: "u-006", name: "Anil Pandey", phone: "9810098765", city: "Delhi" },
  { id: "u-007", name: "Priya Singh", phone: "9899011122", city: "Noida" },
  { id: "u-008", name: "Rajesh Kumar", phone: "9811022346", city: "Delhi" },
  { id: "u-009", name: "Sneha Patil", phone: "9820077881", city: "Pune" },
  { id: "u-010", name: "Vikash Gupta", phone: "9008044567", city: "Bengaluru" },
  { id: "u-011", name: "Ritika Banerjee", phone: "9830066712", city: "Kolkata" },
  { id: "u-012", name: "Meera Sharma", phone: "9829012098", city: "Jaipur" },
];

const cityAddresses: Record<string, string> = {
  Delhi: "C-12, Defence Colony, New Delhi, DL 110024",
  Noida: "House 21, Sector 44, Noida, UP 201303",
  Varanasi: "B-7, Lanka, Varanasi, UP 221005",
  Lucknow: "14 Vipin Khand, Gomti Nagar, Lucknow, UP 226010",
  Pune: "Flat 5, Kothrud, Pune, MH 411038",
  Bengaluru: "Villa 12, Prestige Lakeside, Whitefield, Bengaluru, KA 560066",
  Kolkata: "House No. 45, Salt Lake, Sector V, Kolkata, WB 700091",
  Jaipur: "22 Civil Lines, Jaipur, RJ 302006",
};

const arunAddresses = [
  { id: "addr-1", label: "Home", address: "Flat 302, Sunrise Apartments, Sector 62, Noida, UP 201301", isDefault: true },
  { id: "addr-2", label: "Office", address: "Tower B, 5th Floor, Cyber City, Gurugram, HR 122002", isDefault: false },
  { id: "addr-3", label: "Parents", address: "House No. 45, Salt Lake, Sector V, Kolkata, WB 700091", isDefault: false },
];

const seedBookings: SeedBooking[] = [
  // Demo family (Arun)
  { id: "BK-240101", userId: "u-001", purohitId: "pt-001", serviceId: "griha-pravesh-puja", offset: -20, slot: "9:00 AM - 12:00 PM", status: "completed", method: "UPI", notes: "Please bring all samagri. We have a large puja room." },
  { id: "BK-240102", userId: "u-001", purohitId: "pt-003", serviceId: "satyanarayan-puja", offset: 6, slot: "5:00 PM - 7:00 PM", status: "accepted", method: "Card", notes: "Evening puja preferred. 15 family members expected." },
  { id: "BK-240103", userId: "u-001", purohitId: "pt-006", serviceId: "ganesh-puja", offset: 3, slot: "8:00 AM - 10:00 AM", status: "pending", method: "Wallet", notes: "Small family gathering. Please arrive 15 mins early." },
  { id: "BK-240104", userId: "u-001", purohitId: "pt-004", serviceId: "vivah-sanskar", offset: 0, slot: "10:00 AM - 1:00 PM", status: "on-the-way", method: "UPI", notes: "Wedding ceremony for 200 guests. Mandap already set up." },
  { id: "BK-240105", userId: "u-001", purohitId: "pt-002", serviceId: "rudrabhishek", offset: -45, slot: "6:00 AM - 8:00 AM", status: "completed", method: "UPI", notes: "Family of 8." },
  { id: "BK-240106", userId: "u-001", purohitId: "pt-008", serviceId: "naamkaran-puja", offset: -12, slot: "10:00 AM - 1:00 PM", status: "cancelled", method: "Card", cancelReason: "Plans changed" },

  // Demo purohit (Pandit Ramesh Shastri, pt-001)
  { id: "BK-240111", userId: "u-002", purohitId: "pt-001", serviceId: "satyanarayan-puja", offset: 5, slot: "5:00 PM - 7:00 PM", status: "pending", method: "UPI", notes: "About 20 guests." },
  { id: "BK-240112", userId: "u-003", purohitId: "pt-001", serviceId: "griha-pravesh-puja", offset: 9, slot: "9:00 AM - 12:00 PM", status: "pending", method: "Pay later", notes: "New flat on the 4th floor, lift available." },
  { id: "BK-240113", userId: "u-004", purohitId: "pt-001", serviceId: "vivah-sanskar", offset: 14, slot: "10:00 AM - 1:00 PM", status: "pending", method: "Card", notes: "Traditional Awadhi wedding." },
  { id: "BK-240114", userId: "u-006", purohitId: "pt-001", serviceId: "satyanarayan-puja", offset: 0, slot: "6:00 PM - 8:00 PM", status: "accepted", method: "UPI" },
  { id: "BK-240115", userId: "u-005", purohitId: "pt-001", serviceId: "vivah-sanskar", offset: 15, slot: "6:00 AM - 8:00 AM", status: "accepted", method: "Card", notes: "Sharma family wedding." },
  { id: "BK-240116", userId: "u-007", purohitId: "pt-001", serviceId: "griha-pravesh-puja", offset: -7, slot: "9:00 AM - 12:00 PM", status: "completed", method: "UPI" },
  { id: "BK-240117", userId: "u-008", purohitId: "pt-001", serviceId: "satyanarayan-puja", offset: -38, slot: "5:00 PM - 7:00 PM", status: "completed", method: "Pay later" },
  { id: "BK-240118", userId: "u-011", purohitId: "pt-001", serviceId: "satyanarayan-puja", offset: -66, slot: "8:00 AM - 10:00 AM", status: "completed", method: "UPI" },
  { id: "BK-240119", userId: "u-012", purohitId: "pt-001", serviceId: "griha-pravesh-puja", offset: -95, slot: "9:00 AM - 12:00 PM", status: "completed", method: "Card" },
  { id: "BK-240120", userId: "u-009", purohitId: "pt-001", serviceId: "vivah-sanskar", offset: -130, slot: "10:00 AM - 1:00 PM", status: "completed", method: "UPI" },
  { id: "BK-240121", userId: "u-002", purohitId: "pt-001", serviceId: "satyanarayan-puja", offset: -160, slot: "5:00 PM - 7:00 PM", status: "completed", method: "UPI" },

  // Other activity across the platform
  { id: "BK-240131", userId: "u-009", purohitId: "pt-003", serviceId: "ganesh-puja", offset: -25, slot: "8:00 AM - 10:00 AM", status: "completed", method: "UPI" },
  { id: "BK-240132", userId: "u-011", purohitId: "pt-007", serviceId: "shradh-karma", offset: -18, slot: "6:00 AM - 8:00 AM", status: "completed", method: "Pay later" },
  { id: "BK-240133", userId: "u-012", purohitId: "pt-008", serviceId: "vivah-sanskar", offset: 20, slot: "10:00 AM - 1:00 PM", status: "accepted", method: "Card" },
  { id: "BK-240134", userId: "u-010", purohitId: "pt-006", serviceId: "havan-homam", offset: 8, slot: "8:00 AM - 10:00 AM", status: "pending", method: "UPI" },
];

const LIFECYCLE: BookingStatus[] = ["pending", "accepted", "on-the-way", "in-progress", "completed"];

function buildTimeline(b: SeedBooking, date: Date, placedAt: Date, now: Date): TimelineEvent[] {
  const purohit = getCatalogPurohit(b.purohitId)!;
  const service = getService(b.serviceId)!;
  const [start, end] = parseSlot(b.slot) ?? [9 * 60, 11 * 60];
  // Nothing in the seeded history may be later than "now".
  const at = (d: Date) => min([d, now]).toISOString();
  const events: TimelineEvent[] = [
    {
      status: "Booking placed",
      at: at(placedAt),
      description: `Request sent to ${purohit.name} for ${service.name}`,
    },
  ];
  const reached = LIFECYCLE.indexOf(b.status);
  if (b.status === "cancelled") {
    events.push({
      status: "Cancelled",
      at: at(addMinutes(placedAt, 26 * 60)),
      description: `You cancelled this booking: ${b.cancelReason ?? "No reason given"}. Refund initiated.`,
    });
    return events;
  }
  if (reached >= 1)
    events.push({ status: "Confirmed", at: at(addMinutes(placedAt, 45)), description: `${purohit.name} confirmed your booking` });
  if (reached >= 2)
    events.push({ status: "On the way", at: at(addMinutes(date, start - 45)), description: "Panditji is on the way to your venue" });
  if (reached >= 3)
    events.push({ status: "Ceremony started", at: at(addMinutes(date, start)), description: `${service.name} has begun` });
  if (reached >= 4)
    events.push({ status: "Completed", at: at(addMinutes(date, end)), description: `${service.name} completed successfully` });
  return events;
}

export function createSeed(now: Date): DB {
  const today = startOfDay(now);
  const day = (offset: number) => addDays(today, offset);

  const users: User[] = seedUsers.map((u, i) => ({
    ...u,
    email: u.id === "u-001" ? "arun.banerjee@example.com" : "",
    addresses:
      u.id === "u-001"
        ? arunAddresses
        : [{ id: `addr-${u.id}`, label: "Home", address: cityAddresses[u.city] ?? `${u.city}`, isDefault: true }],
    favorites: u.id === "u-001" ? ["pt-001", "pt-003", "pt-006"] : [],
    status: u.id === "u-010" ? "suspended" : "active",
    joinedAt: addDays(today, -300 + i * 17).toISOString(),
  }));

  const bookings: Booking[] = seedBookings.map((b, i) => {
    const service = getService(b.serviceId)!;
    const user = users.find((u) => u.id === b.userId)!;
    const address = user.addresses.find((a) => a.isDefault)!.address;
    const date = day(b.offset);
    // Placed ~6 days before the ceremony, but never in the future.
    const placedAt = min([addMinutes(addDays(date, -6), 10 * 60 + 15), addMinutes(now, -(i + 2) * 47)]);
    const paymentStatus =
      b.status === "cancelled"
        ? b.method === "Pay later"
          ? "due"
          : "refunded"
        : b.method === "Pay later" && b.status !== "completed"
          ? "due"
          : "paid";
    return {
      id: b.id,
      userId: b.userId,
      purohitId: b.purohitId,
      serviceId: b.serviceId,
      date: toISODate(date),
      timeSlot: b.slot,
      status: b.status,
      address,
      city: address.split(",").map((s) => s.trim()).slice(-2, -1)[0] ?? user.city,
      notes: b.notes ?? "",
      pricing: priceBooking({ base: service.basePrice, isFirstBooking: false }),
      paymentMethod: b.method,
      paymentStatus,
      createdAt: placedAt.toISOString(),
      timeline: buildTimeline(b, date, placedAt, now),
      ...(b.cancelReason ? { cancellation: { by: "user" as const, reason: b.cancelReason } } : {}),
    };
  });

  const reviews: Review[] = sampleReviews.map((r, i) => ({
    ...r,
    id: `rv-seed-${i + 1}`,
    date: toISODate(day(-(i * 16 + 9))),
    source: "seed",
  }));
  const arunReview: Review = {
    id: "rv-seed-arun",
    purohitId: "pt-002",
    bookingId: "BK-240105",
    userId: "u-001",
    userName: "Arun Banerjee",
    rating: 5,
    comment: "A beautifully conducted Rudrabhishek. Acharya ji explained every step to the family.",
    date: toISODate(day(-44)),
    serviceName: "Rudrabhishek",
    source: "seed",
  };
  reviews.push(arunReview);
  const bk105 = bookings.find((b) => b.id === "BK-240105")!;
  bk105.reviewId = arunReview.id;

  const walletBooking = bookings.find((b) => b.id === "BK-240103")!;
  const walletTxns: WalletTxn[] = [
    { id: "wt-seed-1", userId: "u-001", amount: 2000, description: "Added money to wallet", at: addDays(today, -60).toISOString() },
    {
      id: "wt-seed-2",
      userId: "u-001",
      amount: 2049,
      description: "Referral reward",
      at: addDays(today, -30).toISOString(),
    },
    {
      id: "wt-seed-3",
      userId: "u-001",
      amount: -walletBooking.pricing.total,
      description: `Payment for ${walletBooking.id}`,
      at: walletBooking.createdAt,
      bookingId: walletBooking.id,
    },
  ];

  const purohitState: Record<string, PurohitState> = Object.fromEntries(
    purohits.map((p) => [p.id, { accepting: p.available, suspended: false, blockedDates: [] as string[] }])
  );
  purohitState["pt-001"].blockedDates = [toISODate(day(4)), toISODate(day(11))];

  // Notifications mirror the matching timeline events so times always agree.
  const eventTime = (bookingId: string, status: string) =>
    bookings.find((b) => b.id === bookingId)!.timeline.find((e) => e.status === status)!.at;

  const notifications: AppNotification[] = [
    {
      id: "nt-seed-1",
      to: { role: "user", userId: "u-001" },
      title: "Panditji is on the way",
      body: "Pandit Arvind Tiwari is travelling to your venue for Vivah Sanskar.",
      href: "/bookings/BK-240104",
      at: eventTime("BK-240104", "On the way"),
      read: false,
    },
    {
      id: "nt-seed-2",
      to: { role: "user", userId: "u-001" },
      title: "Booking confirmed",
      body: "Pandit Vikram Joshi confirmed your Satyanarayan Puja.",
      href: "/bookings/BK-240102",
      at: eventTime("BK-240102", "Confirmed"),
      read: true,
    },
    ...["BK-240111", "BK-240112", "BK-240113"].map((id, i) => {
      const b = bookings.find((x) => x.id === id)!;
      const u = users.find((x) => x.id === b.userId)!;
      return {
        id: `nt-seed-p${i}`,
        to: { role: "purohit" as const, purohitId: "pt-001" },
        title: "New booking request",
        body: `${u.name} requested ${getService(b.serviceId)!.name}.`,
        href: "/purohit-dashboard#requests",
        at: b.createdAt,
        read: false,
      };
    }),
    {
      id: "nt-seed-a1",
      to: { role: "admin" },
      title: "New purohit application",
      body: "Pandit Harish Kulkarni from Pune applied to join.",
      href: "/admin#applications",
      at: addDays(today, -2).toISOString(),
      read: false,
    },
  ];

  const applications: PurohitApplication[] = [
    {
      id: "app-seed-1",
      name: "Pandit Harish Kulkarni",
      phone: "9123456780",
      email: "harish.kulkarni@example.com",
      city: "Pune",
      experience: 14,
      languages: ["Marathi", "Hindi", "Sanskrit"],
      specializations: ["Griha Pravesh", "Satyanarayan Puja", "Ganesh Puja"],
      bio: "Trained at Vaidik Sanshodhan Mandal, Pune. Performs Griha Pravesh and Ganesh Puja in the traditional Maharashtrian style.",
      startingPrice: 2100,
      status: "pending",
      submittedAt: addDays(today, -2).toISOString(),
    },
    {
      id: "app-seed-2",
      name: "Acharya Mohan Sharma",
      phone: "9123456781",
      email: "",
      city: "Hyderabad",
      experience: 9,
      languages: ["Telugu", "Hindi", "Sanskrit"],
      specializations: ["Havan/Homam", "Navgraha Shanti"],
      bio: "Specialises in Navagraha homam and Ganapati homam for home and business occasions.",
      startingPrice: 2500,
      status: "pending",
      submittedAt: addDays(today, -5).toISOString(),
    },
  ];

  return {
    version: DB_VERSION,
    seededAt: now.toISOString(),
    session: null,
    users,
    bookings,
    reviews,
    walletTxns,
    notifications,
    purohitState,
    applications,
    addedPurohits: [],
  };
}

/** Rendered on the server and during hydration: no session, no private data. */
export const EMPTY_DB: DB = {
  version: DB_VERSION,
  seededAt: "",
  session: null,
  users: [],
  bookings: [],
  reviews: sampleReviews.map((r, i) => ({ ...r, id: `rv-seed-${i + 1}`, date: "", source: "seed" as const })),
  walletTxns: [],
  notifications: [],
  purohitState: Object.fromEntries(
    purohits.map((p) => [p.id, { accepting: p.available, suspended: false, blockedDates: [] as string[] }])
  ),
  applications: [],
  addedPurohits: [],
};
