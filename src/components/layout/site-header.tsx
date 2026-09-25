"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { AccountMenu } from "./account-menu";
import { NotificationBell } from "./notification-bell";

export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Find a purohit" },
  { href: "/bookings", label: "My bookings" },
];

export function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { hydrated, session } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-b border-border bg-background/80 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl"
          : "border-b border-transparent bg-background/0"
      )}
    >
      <div className="container-page flex h-(--header-height) items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {primaryNav.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search purohits"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full md:hidden")}
          >
            <Search className="size-5" />
          </Link>
          <Link
            href="/search"
            className={cn(buttonVariants({ size: "sm" }), "hidden rounded-full px-4 md:inline-flex")}
          >
            Book a puja
          </Link>
          {!hydrated ? (
            <span aria-hidden className="h-10 w-[4.5rem] rounded-full bg-surface" />
          ) : session ? (
            <>
              <NotificationBell />
              <AccountMenu />
            </>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full px-4")}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
