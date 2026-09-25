import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a ceremony",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
