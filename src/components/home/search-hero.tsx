"use client";

import { ArrowRight, MessageCircle, ShieldCheck, Wrench, Headphones } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const badges = [
  { icon: ShieldCheck, label: "Verified Pandits" },
  { icon: Wrench, label: "Complete Samagri" },
  { icon: Headphones, label: "24/7 Support" },
];

export function SearchHero() {
  const router = useRouter();

  return (
    <section className="relative z-0 min-h-[90vh] flex items-center overflow-hidden bg-cream-50">
      {/* Background watermark text */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[18vw] font-heading font-black text-white/[0.03] tracking-tighter leading-none whitespace-nowrap">
          PUROHIT
        </span>
      </div>

      {/* Subtle glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-maroon-800/5 blur-[150px] pointer-events-none z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-maroon-800/8 blur-[120px] pointer-events-none z-10" />

      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Kicker */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-maroon-800" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-maroon-800">
                Trusted Puja Services
              </span>
            </div>

            {/* Main headlines */}
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
              <span className="text-white">Book Trusted.</span>
              <br />
              <span className="text-white">Pray More.</span>
              <br />
              <span className="text-maroon-800">Go Sacred.</span>
            </h1>

            <p className="mt-6 text-white/40 text-sm md:text-base max-w-md leading-relaxed">
              PurohitConnect showcases verified, experienced pandits with
              transparent pricing, complete samagri, and hassle-free booking.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => router.push("/search")}
                className="group flex items-center gap-2 px-6 py-3 rounded-full bg-maroon-800 text-cream-50 text-sm font-semibold hover:bg-maroon-700 transition-all shadow-lg shadow-maroon-800/30"
              >
                Explore Purohits
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/bookings")}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/[0.12] text-white/70 text-sm font-medium hover:border-white/25 hover:text-white transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                My Bookings
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-2 mt-10">
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-cream-100/60 border border-white/[0.06] text-sm"
                >
                  <badge.icon className="w-4 h-4 text-maroon-800" />
                  <span className="text-white/70 font-medium text-xs">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats / Visual element */}
          <div className="hidden md:flex flex-col items-center justify-center relative">
            {/* Floating badge */}
            <div className="absolute top-4 right-8 flex items-center gap-2 px-4 py-2 rounded-full bg-maroon-800/20 border border-maroon-800/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-maroon-800 animate-pulse-soft" />
              <span className="text-xs text-maroon-800 font-medium">
                Verified · Experienced
              </span>
              <span className="text-maroon-800">✦</span>
            </div>

            {/* Large decorative element with generated image */}
            <div className="relative w-80 h-80 rounded-3xl bg-gradient-to-br from-cream-200/50 to-cream-100/30 border border-white/[0.06] flex items-center justify-center overflow-hidden shadow-2xl shadow-maroon-800/10">
              <Image 
                src="/hero-bg.png" 
                alt="Traditional Indian Puja setup" 
                fill 
                className="object-cover opacity-90 transition-opacity hover:opacity-100" 
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>

            {/* Bottom floating SCROLL indicator */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
              <span className="text-[10px] tracking-[0.3em] uppercase font-medium">
                Scroll
              </span>
              <span className="text-lg">↓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
