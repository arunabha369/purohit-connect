"use client";

import Link from "next/link";
import { usePublicPurohits } from "@/lib/store";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { PurohitCard } from "@/components/shared/purohit-card";

export function PurohitCards() {
  const topPurohits = usePublicPurohits()
    .filter((p) => p.bookable && !p.isNew)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 6);

  return (
    <section className="container-page py-14 sm:py-20" aria-labelledby="top-purohits-heading">
      <SectionHeader
        id="top-purohits-heading"
        eyebrow="Top rated"
        title="Purohits families love"
        description="Every purohit is verified for credentials, experience and conduct."
        action={{ href: "/search", label: "View all purohits" }}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topPurohits.map((p) => (
          <PurohitCard key={p.id} purohit={p} />
        ))}
      </div>
      <div className="mt-8 text-center sm:hidden">
        <Link href="/search" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
          View all purohits
        </Link>
      </div>
    </section>
  );
}
