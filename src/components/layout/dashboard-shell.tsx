"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import { useApp } from "@/lib/booking-context";
import { Logo } from "@/components/shared/logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";

export interface DashboardNavItem<T extends string> {
  id: T;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

/** Keeps the active dashboard view in the URL hash so back/forward and deep links work. */
export function useHashView<T extends string>(views: readonly T[], fallback: T) {
  const [view, setViewState] = useState<T>(fallback);

  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.replace("#", "") as T;
      setViewState(views.includes(hash) ? hash : fallback);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [views, fallback]);

  const setView = useCallback((next: T) => {
    if (window.location.hash !== `#${next}`) window.location.hash = next;
    setViewState(next);
    window.scrollTo({ top: 0 });
  }, []);

  return [view, setView] as const;
}

function SidebarNav<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: DashboardNavItem<T>[];
  active: T;
  onSelect: (id: T) => void;
}) {
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            )}
          >
            <item.icon className="size-[1.125rem]" />
            <span className="flex-1 text-left">{item.label}</span>
            {!!item.badge && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-semibold",
                  isActive ? "bg-primary text-primary-foreground" : "bg-surface-strong text-foreground"
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function DashboardShell<T extends string>({
  workspace,
  user,
  items,
  active,
  onNavigate,
  title,
  description,
  actions,
  children,
}: {
  workspace: string;
  user: { name: string; role: string };
  items: DashboardNavItem<T>[];
  active: T;
  onNavigate: (id: T) => void;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const sidebarFooter = (
    <div className="space-y-3 border-t border-border pt-4">
      <Link
        href="/"
        className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      >
        <ArrowLeft className="size-[1.125rem]" />
        Back to site
      </Link>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-heading text-xs font-semibold text-primary-foreground">
          {getInitials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">{user.name}</div>
          <div className="truncate text-xs text-muted-foreground">{user.role}</div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          aria-label="Log out"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-strong hover:text-destructive"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <a
        href="#dashboard-main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card/40 p-4 lg:flex">
        <Logo suffix={workspace} className="px-2 py-2" />
        <div className="mt-8 flex-1">
          <SidebarNav items={items} active={active} onSelect={onNavigate} />
        </div>
        {sidebarFooter}
      </aside>

      <div className="min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                aria-label="Open navigation"
                className="-ml-1 flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-surface hover:text-foreground lg:hidden"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <SheetTitle className="sr-only">{workspace} navigation</SheetTitle>
                <Logo suffix={workspace} className="px-2 py-2" />
                <div className="mt-6 flex-1">
                  <SidebarNav
                    items={items}
                    active={active}
                    onSelect={(id) => {
                      onNavigate(id);
                      setMenuOpen(false);
                    }}
                  />
                </div>
                {sidebarFooter}
              </SheetContent>
            </Sheet>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main id="dashboard-main" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {description && <div className="mb-6 text-sm text-muted-foreground">{description}</div>}
          <div key={active} className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Log out?"
        description={`You'll be signed out of the ${workspace.toLowerCase()} workspace.`}
        confirmLabel="Log out"
        tone="destructive"
        icon={<LogOut className="size-5" />}
        onConfirm={() => {
          logout();
          toast.info("You've been logged out");
          router.push("/login");
        }}
      />
    </div>
  );
}
