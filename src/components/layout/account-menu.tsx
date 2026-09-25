"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Heart,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { useApp, usePurohit } from "@/lib/store";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";

export function AccountMenu({ className }: { className?: string }) {
  const router = useRouter();
  const { session, user, api } = useApp();
  const purohit = usePurohit(session?.purohitId);
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!session) return null;

  const name =
    session.role === "user" ? user?.name || "My account" : session.role === "purohit" ? (purohit?.name ?? "Purohit") : "Admin";
  const go = (href: string) => () => router.push(href);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className={cn(
            "group flex items-center gap-2 rounded-full border border-border-strong bg-card py-1 pr-2 pl-1 transition-colors hover:border-muted-foreground/40 data-popup-open:border-primary/50",
            className
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-gold-gradient font-heading text-xs font-semibold text-primary-foreground">
            {getInitials(name)}
          </span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-popup-open:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
              <span className="truncate text-sm font-semibold text-foreground">{name}</span>
              <span className="truncate font-normal">+91 {session.phone.slice(0, 5)} {session.phone.slice(5)}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {session.role === "user" && (
            <>
              <DropdownMenuItem onClick={go("/profile")}>
                <User /> My profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={go("/bookings")}>
                <CalendarDays /> My bookings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={go("/profile#saved")}>
                <Heart /> Saved purohits
              </DropdownMenuItem>
            </>
          )}
          {session.role === "purohit" && (
            <>
              <DropdownMenuItem onClick={go("/purohit-dashboard")}>
                <LayoutDashboard /> Dashboard
              </DropdownMenuItem>
              {session.purohitId && (
                <DropdownMenuItem onClick={go(`/purohit/${session.purohitId}`)}>
                  <ExternalLink /> My public profile
                </DropdownMenuItem>
              )}
            </>
          )}
          {session.role === "admin" && (
            <DropdownMenuItem onClick={go("/admin")}>
              <ShieldCheck /> Admin console
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmLogout(true)}>
            <LogOut /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Log out of PurohitConnect?"
        description="You'll need to verify your phone number again to manage your account."
        confirmLabel="Log out"
        tone="destructive"
        icon={<LogOut className="size-5" />}
        onConfirm={() => {
          api.signOut();
          toast.info("You've been logged out");
          router.push("/");
        }}
      />
    </>
  );
}
