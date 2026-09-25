import type { Metadata } from "next";
import { getPurohit } from "@/lib/mock-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const purohit = getPurohit(id);
  if (!purohit) return { title: "Purohit not found" };
  return {
    title: `${purohit.name} — ${purohit.city}`,
    description: `${purohit.name}: ${purohit.experience} years of experience in ${purohit.specializations.join(", ")}. Rated ${purohit.rating}/5 by ${purohit.reviewCount} families.`,
  };
}

export default function PurohitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
