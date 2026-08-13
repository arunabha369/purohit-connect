"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const banners = [
  {
    title: "Griha Pravesh Special",
    subtitle: "20% off on complete ceremony packages",
    gradient: "from-maroon-800/20 to-transparent",
    emoji: "🏠",
    cta: "Book Now",
  },
  {
    title: "Wedding Season Offer",
    subtitle: "Premium Vivah Sanskar with experienced pandits",
    gradient: "from-saffron-500/20 to-transparent",
    emoji: "💒",
    cta: "Explore",
  },
  {
    title: "Satyanarayan Puja",
    subtitle: "Most popular — Starting at ₹3,100",
    gradient: "from-gold-500/20 to-transparent",
    emoji: "🙏",
    cta: "View Details",
  },
];

export function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 py-8 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-cream-100/50 border border-white/[0.06]">
        <div
          className="flex transition-transform duration-700 ease-out h-[240px] md:h-[320px]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner, i) => (
            <div
              key={i}
              className="min-w-full relative flex items-center p-8 md:p-16"
            >
              {/* Background Glow */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-50",
                  banner.gradient
                )}
              />
              {/* Decorative circle glow */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-maroon-800/10 blur-[80px]" />

              <div className="relative z-10 max-w-lg">
                <div className="text-4xl md:text-6xl mb-4 drop-shadow-lg">
                  {banner.emoji}
                </div>
                <h3 className="font-heading font-black text-2xl md:text-4xl mb-2 text-white tracking-tight">
                  {banner.title}
                </h3>
                <p className="text-sm md:text-base text-white/60 mb-8 max-w-md">
                  {banner.subtitle}
                </p>
                <button className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-maroon-800/20 border border-maroon-800/30 text-maroon-800 text-sm font-semibold hover:bg-maroon-800 hover:text-cream-50 transition-all">
                  {banner.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === current ? "bg-maroon-800 w-6" : "bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
