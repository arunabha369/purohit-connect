"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/purohit-dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <nav className="mx-auto max-w-sm rounded-full bg-black/40 backdrop-blur-2xl border border-white/[0.08] px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-full transition-all",
                  isActive
                    ? "text-maroon-800 bg-maroon-800/10"
                    : "text-white/40 hover:text-white/60"
                )}
              >
                <tab.icon
                  className={cn(
                    "w-5 h-5",
                    isActive && "drop-shadow-[0_0_6px_rgba(212,168,67,0.4)]"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span
                  className={cn(
                    "text-[9px]",
                    isActive ? "font-bold" : "font-medium"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
