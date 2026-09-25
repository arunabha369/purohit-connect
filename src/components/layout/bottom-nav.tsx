"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { isActiveBooking } from "@/lib/booking-status";
import { isNavActive } from "./site-header";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Explore", icon: Search },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { db, user } = useApp();
  const activeCount = user
    ? db.bookings.filter((b) => b.userId === user.id && isActiveBooking(b.status)).length
    : 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 pb-safe backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid h-(--bottom-nav-height) max-w-md grid-cols-4">
        {tabs.map((tab) => {
          const active = isNavActive(pathname, tab.href);
          const showBadge = tab.href === "/bookings" && activeCount > 0;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="relative">
                  <tab.icon className="size-[1.375rem]" strokeWidth={active ? 2.25 : 1.75} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold text-primary-foreground">
                      {activeCount}
                      <span className="sr-only"> active bookings</span>
                    </span>
                  )}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
