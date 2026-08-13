"use client";

import Link from "next/link";
import { purohits } from "@/lib/mock-data";
import { Star, MapPin, Languages, IndianRupee } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const avatarGradients = [
  "from-maroon-800 to-maroon-600",
  "from-maroon-700 to-maroon-500",
  "from-maroon-900 to-maroon-700",
  "from-maroon-600 to-maroon-400",
  "from-saffron-600 to-saffron-400",
  "from-saffron-700 to-saffron-500",
  "from-maroon-800 to-saffron-500",
  "from-saffron-500 to-maroon-700",
];

export function PurohitCards() {
  const topPurohits = purohits
    .filter((p) => p.available)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <section className="px-4 py-12 md:py-16 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-[2px] bg-maroon-800" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-maroon-800">
              Top Rated
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl md:text-3xl text-white">
            Top Rated Purohits
          </h2>
        </div>
        <Link
          href="/search"
          className="text-sm font-medium text-maroon-800 hover:text-maroon-700"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topPurohits.map((p, i) => (
          <Link
            key={p.id}
            href={`/purohit/${p.id}`}
            className="group rounded-2xl bg-cream-100/50 border border-white/[0.06] hover:border-maroon-800/30 transition-all duration-300 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center flex-shrink-0 shadow-lg shadow-maroon-800/20`}
                >
                  <span className="text-cream-50 font-heading font-bold text-lg">
                    {getInitials(p.name)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-base text-white group-hover:text-maroon-800 transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5 text-maroon-800">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-sm font-bold text-maroon-800">
                            {p.rating}
                          </span>
                        </div>
                        <span className="text-xs text-white/30">
                          ({p.reviewCount})
                        </span>
                      </div>
                    </div>
                    {p.available && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                        Live
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-white/35">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {p.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Languages className="w-3 h-3" />
                      {p.languages.slice(0, 2).join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.specializations.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-medium text-white/30 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                <div className="text-sm">
                  <span className="text-white/30 text-xs">From </span>
                  <span className="font-bold text-maroon-800 inline-flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {p.priceRange.min.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="text-xs text-white/30">
                  {p.experience} yrs exp
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
