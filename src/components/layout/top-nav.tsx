"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Find Purohits" },
  { href: "/bookings", label: "Bookings" },
  { href: "/profile", label: "Profile" },
];

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (
    pathname.startsWith("/purohit-dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login")
  ) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="max-w-6xl mx-auto rounded-full bg-black/30 backdrop-blur-xl border border-white/[0.08] px-3 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 pl-2">
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-maroon-700/50">
            <Image src="/logo.png" alt="PurohitConnect Logo" fill className="object-cover" />
          </div>
          <span className="font-heading font-bold text-base text-white tracking-tight hidden sm:block">
            Purohit<span className="text-maroon-800">Connect</span>
          </span>
        </Link>

        {/* Desktop Nav Links — center */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-maroon-800" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side CTAs */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.12] text-white/70 text-sm font-medium hover:border-white/25 hover:text-white transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </Link>
          <Link
            href="/login"
            className="hidden md:flex items-center px-5 py-2 rounded-full bg-maroon-800 text-cream-50 text-sm font-semibold hover:bg-maroon-700 transition-all shadow-lg shadow-maroon-800/25"
          >
            Book Now
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-white/[0.12] text-white/70 hover:text-white transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-2 mx-2 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] p-4 animate-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-maroon-800/20 text-maroon-800"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-white/[0.08] pt-3 flex flex-col gap-2">
              <Link
                href="/purohit-dashboard"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
              >
                Purohit Dashboard
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
              >
                Admin Panel
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center justify-center px-5 py-3 rounded-full bg-maroon-800 text-cream-50 text-sm font-semibold"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
