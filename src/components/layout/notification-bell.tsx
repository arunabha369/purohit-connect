"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { useApp, useNotifications } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const { api } = useApp();
  const { items, unread } = useNotifications();
  const recent = items.slice(0, 8);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className={cn(
          "relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground data-popup-open:bg-surface data-popup-open:text-foreground",
          className
        )}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold text-primary-foreground ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => api.markNotificationsRead()}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</div>
        ) : (
          <div className="max-h-96 overflow-y-auto p-1.5">
            {recent.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => {
                  if (!n.read) api.markNotificationsRead([n.id]);
                  if (n.href) router.push(n.href);
                }}
                className="items-start gap-3 py-2.5"
              >
                <span
                  aria-hidden
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")}
                />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", n.read ? "text-foreground/80" : "font-medium text-foreground")}>
                    {n.title}
                    {!n.read && <span className="sr-only"> (unread)</span>}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug whitespace-normal text-muted-foreground">
                    {n.body}
                  </span>
                  <span className="mt-1 block text-[0.6875rem] text-subtle-foreground">
                    {formatDistanceToNowStrict(new Date(n.at), { addSuffix: true })}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
