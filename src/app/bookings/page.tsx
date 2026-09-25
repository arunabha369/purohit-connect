"use client";

import Link from "next/link";
import { CalendarDays, CalendarPlus, ChevronRight, Clock, History, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { getService } from "@/lib/catalog";
import { useApp, usePurohit, type Booking } from "@/lib/store";
import { RequireRole } from "@/components/auth/require-role";
import { isActiveBooking } from "@/lib/booking-status";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceIcon } from "@/components/shared/service-icon";

function BookingCard({ booking }: { booking: Booking }) {
  const purohit = usePurohit(booking.purohitId);
  const service = getService(booking.serviceId);

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group block rounded-2xl border border-border bg-card p-4 shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gold-700/60 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <ServiceIcon name={service?.icon} className="hidden sm:flex" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">{service?.name ?? "Puja"}</h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">with {purohit?.name ?? "your purohit"}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-subtle-foreground" />
              {formatDate(booking.date, "weekday")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-subtle-foreground" />
              {booking.timeSlot}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-subtle-foreground" />
              {booking.city}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 sm:ml-15">
        <span className="font-heading font-semibold text-foreground">{formatINR(booking.pricing.total)}</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
          Details
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function BookingsContent() {
  const { db, user } = useApp();
  const bookings = db.bookings.filter((b) => b.userId === user?.id);

  const upcoming = bookings
    .filter((b) => isActiveBooking(b.status))
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = bookings
    .filter((b) => !isActiveBooking(b.status))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="container-page max-w-3xl py-6 sm:py-10">
      <PageHeader
        title="My bookings"
        description="Track upcoming ceremonies and revisit past ones."
        actions={
          <Link href="/search" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
            <CalendarPlus /> Book a puja
          </Link>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="upcoming" className="sm:px-5">
            Upcoming
            <span className="rounded-full bg-background/60 px-1.5 text-xs tabular-nums">{upcoming.length}</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="sm:px-5">
            Past
            <span className="rounded-full bg-background/60 px-1.5 text-xs tabular-nums">{past.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarPlus}
              title="No upcoming ceremonies"
              description="When you book a purohit, you'll be able to track every step here."
              action={
                <Link href="/search" className={buttonVariants()}>
                  Find a purohit
                </Link>
              }
            />
          ) : (
            upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 ? (
            <EmptyState
              icon={History}
              title="No past bookings yet"
              description="Completed and cancelled ceremonies will appear here."
            />
          ) : (
            past.map((b) => <BookingCard key={b.id} booking={b} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <AppShell>
      <RequireRole role="user">
        <BookingsContent />
      </RequireRole>
    </AppShell>
  );
}
