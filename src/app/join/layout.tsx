import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a purohit",
  description:
    "Grow your practice with PurohitConnect: steady bookings from verified families, on-time payouts and no paperwork. Apply in five minutes.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
