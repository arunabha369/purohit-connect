import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { BottomNav } from "./bottom-nav";

/**
 * Consumer-facing page frame.
 * - `bottomNav`: show the mobile tab bar (pages with their own sticky
 *   action bar, like checkout, turn it off).
 * - `footer`: show the site footer.
 */
export function AppShell({
  children,
  bottomNav = true,
  footer = false,
  className,
}: {
  children: React.ReactNode;
  bottomNav?: boolean;
  footer?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col",
        bottomNav && "pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:pb-0"
      )}
    >
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className={cn("flex-1", className)}>
        {children}
      </main>
      {footer && <SiteFooter />}
      {bottomNav && <BottomNav />}
    </div>
  );
}
