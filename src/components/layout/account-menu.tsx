"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { useApp } from "@/lib/booking-context";
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
  const { profile, logout } = useApp();
  const [confirmLogout, setConfirmLogout] = useState(false);

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
            {getInitials(profile.name)}
          </span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-popup-open:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
              <span className="text-sm font-semibold text-foreground">{profile.name}</span>
              <span className="truncate font-normal">{profile.phone}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={go("/profile")}>
            <User /> My profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={go("/bookings")}>
            <CalendarDays /> My bookings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={go("/profile#saved")}>
            <Heart /> Saved purohits
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Demo workspaces</DropdownMenuLabel>
            <DropdownMenuItem onClick={go("/purohit-dashboard")}>
              <LayoutDashboard /> Purohit dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={go("/admin")}>
              <ShieldCheck /> Admin console
            </DropdownMenuItem>
          </DropdownMenuGroup>
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
        description="You'll need to verify your phone number again to manage your bookings."
        confirmLabel="Log out"
        tone="destructive"
        icon={<LogOut className="size-5" />}
        onConfirm={() => {
          logout();
          toast.info("You've been logged out");
          router.push("/login");
        }}
      />
    </>
  );
}
