"use client";

import Link from "next/link";
import { services } from "@/lib/mock-data";
import { Clock, IndianRupee } from "lucide-react";

export function PopularServices() {
  const popular = services.filter((s) => s.popular);

  return (
    <section className="px-4 py-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-[2px] bg-maroon-800" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-maroon-800">
              Popular
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl md:text-3xl text-white">
            Popular Services
          </h2>
        </div>
        <Link
          href="/search"
          className="text-sm font-medium text-maroon-800 hover:text-maroon-700"
        >
          See All →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {popular.map((service) => (
          <Link
            key={service.id}
            href={`/search?service=${service.id}`}
            className="min-w-[280px] md:min-w-[320px] rounded-2xl bg-cream-100/50 border border-white/[0.06] hover:border-maroon-800/30 transition-all duration-300 overflow-hidden group"
          >
            {/* Top accent strip */}
            <div className="h-1 bg-gradient-to-r from-maroon-800 to-maroon-600" />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-semibold text-base text-white group-hover:text-maroon-800 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-maroon-800/70 font-medium mt-0.5">
                    {service.nameHindi}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-maroon-800/15 border border-maroon-800/20 text-maroon-800 text-[10px] font-bold">
                  Popular
                </span>
              </div>
              <p className="text-xs text-white/35 line-clamp-2 mb-4">
                {service.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm font-bold text-maroon-800">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {service.basePrice.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-white/30 ml-1">
                    onwards
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/30">
                  <Clock className="w-3 h-3" />
                  {service.duration}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
