import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & FAQs",
  description: "Answers about booking a purohit, payments, refunds, rescheduling and joining PurohitConnect as a purohit.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
