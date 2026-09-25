import { PLATFORM_FEE } from "../catalog";
import type { Pricing } from "./types";

export interface Coupon {
  code: string;
  description: string;
  kind: "flat" | "percent";
  value: number;
  /** Minimum ceremony fee for the coupon to apply. */
  minOrder: number;
  /** Cap for percentage coupons. */
  maxDiscount?: number;
  firstBookingOnly?: boolean;
}

export const COUPONS: Coupon[] = [
  {
    code: "FIRST100",
    description: "₹100 off your first booking",
    kind: "flat",
    value: 100,
    minOrder: 1000,
    firstBookingOnly: true,
  },
  {
    code: "PUJA10",
    description: "10% off ceremonies above ₹2,000 (up to ₹500)",
    kind: "percent",
    value: 10,
    minOrder: 2000,
    maxDiscount: 500,
  },
];

export type CouponCheck = { ok: true; coupon: Coupon; discount: number } | { ok: false; error: string };

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function checkCoupon(
  code: string,
  { base, isFirstBooking }: { base: number; isFirstBooking: boolean }
): CouponCheck {
  const coupon = COUPONS.find((c) => c.code === normalizeCouponCode(code));
  if (!coupon) return { ok: false, error: "This code isn't valid." };
  if (coupon.firstBookingOnly && !isFirstBooking) {
    return { ok: false, error: "This code is only valid on your first booking." };
  }
  if (base < coupon.minOrder) {
    return {
      ok: false,
      error: `Applies to ceremonies of ₹${coupon.minOrder.toLocaleString("en-IN")} or more.`,
    };
  }
  const raw = coupon.kind === "flat" ? coupon.value : Math.round((base * coupon.value) / 100);
  const discount = Math.min(raw, coupon.maxDiscount ?? raw, base);
  return { ok: true, coupon, discount };
}

/** Full price breakdown. Discounts apply to the ceremony fee only, never the platform fee. */
export function priceBooking({
  base,
  couponCode,
  isFirstBooking,
}: {
  base: number;
  couponCode?: string;
  isFirstBooking: boolean;
}): Pricing {
  let discount = 0;
  let coupon: string | undefined;
  if (couponCode) {
    const check = checkCoupon(couponCode, { base, isFirstBooking });
    if (check.ok) {
      discount = check.discount;
      coupon = check.coupon.code;
    }
  }
  return {
    base,
    platformFee: PLATFORM_FEE,
    discount,
    total: base + PLATFORM_FEE - discount,
    ...(coupon ? { coupon } : {}),
  };
}

/** What the purohit earns from a booking: the ceremony fee (discounts are funded by the platform). */
export function purohitEarning(pricing: Pricing) {
  return pricing.base;
}
