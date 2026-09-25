import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { categories } from "@/lib/catalog";
import { Logo } from "@/components/shared/logo";

const companyLinks = [
  { href: "/search", label: "Find a purohit" },
  { href: "/bookings", label: "Track a booking" },
  { href: "/join", label: "Join as a purohit" },
  { href: "/help", label: "Help & FAQs" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            India&apos;s trusted platform for booking verified purohits for every Vedic ceremony —
            with transparent pricing and complete samagri.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Popular pujas</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/search?category=${c.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">PurohitConnect</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Need help?</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href="tel:+918001234567"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="size-4 text-primary" />
                1800-123-4567
              </a>
            </li>
            <li>
              <a
                href="mailto:namaste@purohitconnect.in"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="size-4 text-primary" />
                namaste@purohitconnect.in
              </a>
            </li>
            <li className="text-xs text-subtle-foreground">Every day, 6 AM – 10 PM IST</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-subtle-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} PurohitConnect. All rights reserved.</p>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <span>Made with devotion in India</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
