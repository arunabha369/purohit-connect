import type { Metadata } from "next";
import { getPurohit } from "@/lib/mock-data";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const purohit = getPurohit(params.id);
  if (!purohit) return { title: "Purohit not found" };
  return {
    title: `${purohit.name} — ${purohit.city}`,
    description: `${purohit.name}: ${purohit.experience} years of experience in ${purohit.specializations.join(", ")}. Rated ${purohit.rating}/5 by ${purohit.reviewCount} families.`,
  };
}

export default function PurohitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
