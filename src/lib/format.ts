import { format, isValid, parseISO } from "date-fns";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹5,100 */
export function formatINR(amount: number) {
  return inr.format(amount);
}

/** ₹45.2L / ₹1.2Cr / ₹8.4K — for dashboards where space is tight. */
export function formatCompactINR(amount: number) {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(1)}Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return formatINR(amount);
}

export function formatNumber(n: number) {
  return n.toLocaleString("en-IN");
}

/**
 * Formats a `yyyy-MM-dd` string (or Date) in the user's local calendar.
 * `parseISO` treats date-only strings as local dates, so there is no
 * UTC off-by-one shift.
 */
export function formatDate(
  value: string | Date,
  pattern: "short" | "medium" | "long" | "weekday" = "medium"
) {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return String(value);
  switch (pattern) {
    case "short":
      return format(date, "d MMM");
    case "weekday":
      return format(date, "EEE, d MMM");
    case "long":
      return format(date, "EEEE, d MMMM yyyy");
    default:
      return format(date, "d MMM yyyy");
  }
}

/** Local `yyyy-MM-dd` for a Date — never use toISOString() for this. */
export function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

const HONORIFICS = new Set(["pandit", "pt.", "acharya", "shri", "sri", "dr."]);

/** "Pandit Ramesh Shastri" → "RS" */
export function getInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const meaningful = words.filter((w) => !HONORIFICS.has(w.toLowerCase()));
  const source = meaningful.length ? meaningful : words;
  return source
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Small stable hash for deterministic mock variation. */
export function hashString(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
