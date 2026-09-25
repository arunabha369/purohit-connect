import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a purohit",
  description: "Search verified purohits by ceremony, city, language and budget.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
