"use client";

import Link from "next/link";
import { categories } from "@/lib/mock-data";
import {
  Home,
  Sun,
  Heart,
  Scissors,
  Baby,
  Flower2,
  Star,
  Compass,
  Flame,
  Droplets,
  BookOpen,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Sun,
  Heart,
  Scissors,
  Baby,
  Flower2,
  Star,
  Compass,
  Flame,
  Droplets,
  BookOpen,
};

export function CategoryGrid() {
  return (
    <section className="px-4 py-12 md:py-16 max-w-6xl mx-auto">
      {/* Section header with kicker */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-[2px] bg-maroon-800" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-maroon-800">
              Categories
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl md:text-3xl text-white">
            Browse by Category
          </h2>
        </div>
        <Link
          href="/search"
          className="text-sm font-medium text-maroon-800 hover:text-maroon-700 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Flame;
          return (
            <Link
              key={cat.id}
              href={`/search?category=${cat.id}`}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-cream-100/50 border border-white/[0.06] hover:border-maroon-800/30 hover:bg-cream-100 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}
              >
                <Icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <span className="text-xs md:text-sm font-medium text-white/80 text-center leading-tight">
                {cat.name}
              </span>
              <span className="text-[10px] text-white/30">
                {cat.count} purohits
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
