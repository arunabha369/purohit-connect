"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, format, startOfMonth, subMonths } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
  Inbox,
  LayoutDashboard,
  MapPin,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";
import { getService, getServicesForPurohit } from "@/lib/catalog";
import { useApp, usePurohit, type Booking } from "@/lib/store";
import { OCCUPYING_STATUSES } from "@/lib/store/availability";
import { nextPurohitStep } from "@/lib/store/actions";
import { purohitEarning } from "@/lib/store/pricing";
import { findUser } from "@/lib/store/selectors";
import { formatCompactINR, formatDate, formatINR, formatNumber, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { RequireRole } from "@/components/auth/require-role";
import { ReasonDialog } from "@/components/booking/reason-dialog";
import { DashboardShell, useHashView, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { ChartPanel, ChartTooltip, chartTheme } from "@/components/shared/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Panel, PanelHeader } from "@/components/shared/panel";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge } from "@/components/shared/rating";
import { ServiceIcon } from "@/components/shared/service-icon";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";

const VIEWS = ["overview", "requests", "schedule", "availability", "profile"] as const;
type View = (typeof VIEWS)[number];

const declineReasons = [
  "I'm not available at this time",
  "The venue is too far for me",
  "I don't perform this ceremony in the family's tradition",
];

const cancelReasons = ["A personal emergency came up", "I'm unwell", "A scheduling conflict"];

const stepLabels: Record<string, string> = {
  "on-the-way": "Start travelling",
  "in-progress": "Start ceremony",
  completed: "Mark completed",
};

function BookingCard({
  booking,
  onDecline,
  onCancel,
}: {
  booking: Booking;
  onDecline?: (b: Booking) => void;
  onCancel?: (b: Booking) => void;
}) {
  const { db, api } = useApp();
  const family = findUser(db, booking.userId);
  const service = getService(booking.serviceId);
  const step = nextPurohitStep(booking);
  const today = toISODate(new Date());
  const canAdvance = step && !(booking.status === "accepted" && booking.date > today);
  const confirmed = booking.status !== "pending";

  const run = (fn: () => { ok: boolean; error?: string }, success: string) => {
    const res = fn();
    if (!res.ok) toast.error(res.error ?? "Something went wrong");
    else toast.success(success);
  };

  return (
    <article className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <ServiceIcon name={service?.icon} size="sm" />
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">{service?.name}</h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{family?.name ?? "Family"}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-heading font-semibold text-foreground">{formatINR(purohitEarning(booking.pricing))}</div>
          <div className="text-[0.6875rem] text-muted-foreground">
            {booking.paymentStatus === "due" ? "Collect after puja" : "Paid online"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-subtle-foreground" />
          {booking.date === today ? "Today" : formatDate(booking.date, "weekday")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 text-subtle-foreground" />
          {booking.timeSlot}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="size-4 shrink-0 text-subtle-foreground" />
          {/* The full address is shared once the booking is confirmed. */}
          <span className="truncate">{confirmed ? booking.address : booking.city}</span>
        </span>
      </div>
      {booking.notes && <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-foreground/85">&ldquo;{booking.notes}&rdquo;</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {booking.status === "pending" ? (
          <>
            <Button size="sm" variant="success" onClick={() => run(() => api.purohitAccept(booking.id), `Accepted — ${family?.name ?? "the family"} has been notified.`)}>
              <CheckCircle2 /> Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDecline?.(booking)}>
              <XCircle /> Decline
            </Button>
          </>
        ) : (
          <>
            <StatusBadge status={booking.status} />
            {step && (
              <Button
                size="sm"
                disabled={!canAdvance}
                onClick={() => run(() => api.purohitAdvance(booking.id), `Updated: ${step.label}`)}
              >
                {stepLabels[step.to]}
              </Button>
            )}
            {booking.status === "accepted" && (
              <Button size="sm" variant="ghost" onClick={() => onCancel?.(booking)}>
                Can&apos;t make it
              </Button>
            )}
            {step && !canAdvance && (
              <span className="text-xs text-muted-foreground">Available on the day of the ceremony</span>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function AvailabilityCalendar({ purohitId, blockedDates }: { purohitId: string; blockedDates: string[] }) {
  const { db, api } = useApp();
  const today = new Date();
  const days = Array.from({ length: 35 }, (_, i) => addDays(today, i));
  const bookedDates = new Set(
    db.bookings.filter((b) => b.purohitId === purohitId && OCCUPYING_STATUSES.includes(b.status)).map((b) => b.date)
  );

  return (
    <div>
      <ul className="grid grid-cols-5 gap-2 sm:grid-cols-7">
        {days.map((d) => {
          const iso = toISODate(d);
          const blocked = blockedDates.includes(iso);
          const booked = bookedDates.has(iso);
          return (
            <li key={iso}>
              <button
                type="button"
                aria-pressed={blocked}
                disabled={booked}
                onClick={() => {
                  const res = api.toggleBlockedDate(iso);
                  if (!res.ok) toast.error(res.error);
                  else toast.success(res.value ? `${format(d, "EEE, d MMM")} marked as a day off` : `${format(d, "EEE, d MMM")} is open again`);
                }}
                aria-label={`${format(d, "EEEE, d MMMM")}${booked ? ", has bookings" : blocked ? ", day off" : ", available"}`}
                className={cn(
                  "flex h-16 w-full flex-col items-center justify-center rounded-xl border text-center transition-colors disabled:cursor-not-allowed",
                  blocked
                    ? "border-dashed border-destructive/40 bg-destructive/8 text-destructive"
                    : booked
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-surface/40 text-foreground hover:border-border-strong"
                )}
              >
                <span className="text-[0.625rem] font-medium uppercase">{format(d, "EEE")}</span>
                <span className="font-heading text-base font-semibold">{format(d, "d MMM")}</span>
                <span className="text-[0.625rem]">{blocked ? "Off" : booked ? "Booked" : "Open"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded border border-border bg-surface" /> Open — tap to mark a day off
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded border border-dashed border-destructive/50 bg-destructive/10" /> Day off
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded border border-primary/40 bg-primary/15" /> Has bookings
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const { db, session, api } = useApp();
  const purohit = usePurohit(session?.purohitId);
  const [view, setView] = useHashView(VIEWS, "overview");
  const [declineTarget, setDeclineTarget] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [requestFilter, setRequestFilter] = useState<"pending" | "declined">("pending");

  const mine = useMemo(() => db.bookings.filter((b) => b.purohitId === session?.purohitId), [db.bookings, session?.purohitId]);
  const now = new Date();
  const today = toISODate(now);

  const pending = mine.filter((b) => b.status === "pending").sort((a, b) => a.date.localeCompare(b.date));
  const declined = mine
    .filter((b) => b.status === "cancelled" && b.cancellation?.by === "purohit")
    .sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = mine
    .filter((b) => ["accepted", "on-the-way", "in-progress"].includes(b.status))
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
  const completed = useMemo(() => mine.filter((b) => b.status === "completed"), [mine]);

  const monthStart = toISODate(startOfMonth(now));
  const earnedThisMonth = completed.filter((b) => b.date >= monthStart).reduce((s, b) => s + purohitEarning(b.pricing), 0);
  const earnedTotal = completed.reduce((s, b) => s + purohitEarning(b.pricing), 0);

  const monthly = useMemo(() => {
    const base = startOfMonth(new Date());
    return Array.from({ length: 6 }, (_, i) => {
      const start = subMonths(base, 5 - i);
      const end = subMonths(base, 4 - i);
      const from = toISODate(start);
      const to = toISODate(end);
      return {
        month: format(start, "MMM"),
        earnings: completed.filter((b) => b.date >= from && b.date < to).reduce((s, b) => s + purohitEarning(b.pricing), 0),
      };
    });
  }, [completed]);

  if (!purohit) return null;

  const nav: DashboardNavItem<View>[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "requests", label: "Requests", icon: Inbox, badge: pending.length },
    { id: "schedule", label: "Schedule", icon: CalendarCheck, badge: upcoming.filter((b) => b.date === today).length },
    { id: "availability", label: "Availability", icon: CalendarOff },
    { id: "profile", label: "My profile", icon: UserRound },
  ];

  const titles: Record<View, string> = {
    overview: `Namaste, ${purohit.name.split(" ").slice(1, 2).join("") || purohit.name} ji`,
    requests: "Booking requests",
    schedule: "Schedule",
    availability: "Availability",
    profile: "My profile",
  };

  const list = (items: Booking[], empty: React.ReactNode) =>
    items.length ? (
      <div className="grid gap-3 xl:grid-cols-2">
        {items.map((b) => (
          <BookingCard key={b.id} booking={b} onDecline={setDeclineTarget} onCancel={setCancelTarget} />
        ))}
      </div>
    ) : (
      empty
    );

  return (
    <DashboardShell
      workspace="Purohit"
      user={{ name: purohit.name, role: `${purohit.city} · Verified purohit` }}
      items={nav}
      active={view}
      onNavigate={setView}
      title={titles[view]}
      actions={
        <label className="flex cursor-pointer items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pr-1.5 pl-3 text-sm">
          <span className={cn("hidden font-medium sm:inline", purohit.accepting ? "text-success" : "text-muted-foreground")}>
            {purohit.accepting ? "Accepting bookings" : "Paused"}
          </span>
          <Switch
            checked={purohit.accepting}
            aria-label="Accepting new bookings"
            onCheckedChange={(v) => {
              api.setAccepting(v);
              toast.info(
                v ? "You're accepting bookings" : "New bookings paused",
                v ? "Families can book you again." : "Your profile shows you as unavailable. Existing bookings are not affected."
              );
            }}
          />
        </label>
      }
    >
      {view === "overview" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {pending.length
              ? `You have ${pending.length} request${pending.length > 1 ? "s" : ""} waiting for a response.`
              : "You're all caught up on requests."}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label="Pending requests" value={String(pending.length)} icon={Inbox} hint="Respond within a few hours" />
            <StatCard
              label="Upcoming ceremonies"
              value={String(upcoming.length)}
              icon={CalendarCheck}
              hint={`${upcoming.filter((b) => b.date === today).length} today`}
            />
            <StatCard label="Earned this month" value={formatCompactINR(earnedThisMonth)} icon={IndianRupee} hint={`${formatCompactINR(earnedTotal)} on PurohitConnect`} />
            <StatCard
              label="Rating"
              value={purohit.isNew ? "New" : purohit.rating.toFixed(1)}
              icon={Star}
              hint={purohit.isNew ? "No reviews yet" : `${formatNumber(purohit.reviewCount)} reviews`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <ChartPanel
              title="Earnings"
              description="Completed ceremonies, last 6 months"
              data={monthly}
              columns={[
                { key: "month", label: "Month" },
                { key: "earnings", label: "Earnings", numeric: true, format: (v) => formatINR(Number(v)) },
              ]}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
                  <CartesianGrid vertical={false} stroke={chartTheme.grid} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={chartTheme.axisTick} dy={6} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={chartTheme.axisTick}
                    width={52}
                    allowDecimals={false}
                    tickFormatter={(v: number) => formatCompactINR(v).replace(".0", "")}
                  />
                  <Tooltip cursor={{ fill: chartTheme.cursorFill }} content={<ChartTooltip seriesLabel="Earnings" formatValue={formatINR} />} />
                  <Bar dataKey="earnings" fill={chartTheme.series} radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <Panel>
              <PanelHeader
                title="Needs your response"
                action={
                  pending.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setView("requests")}>
                      View all
                    </Button>
                  )
                }
              />
              {pending.length ? (
                <div className="space-y-3">
                  {pending.slice(0, 2).map((b) => (
                    <BookingCard key={b.id} booking={b} onDecline={setDeclineTarget} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Inbox} title="You're all caught up" description="New requests will show up here." className="py-10" />
              )}
            </Panel>
          </div>

          <Panel>
            <PanelHeader
              title="Coming up"
              action={
                <Button variant="ghost" size="sm" onClick={() => setView("schedule")}>
                  Full schedule
                </Button>
              }
            />
            {list(
              upcoming.slice(0, 4),
              <EmptyState icon={CalendarCheck} title="Nothing scheduled" description="Accepted requests will appear here." className="py-10" />
            )}
          </Panel>
        </div>
      )}

      {view === "requests" && (
        <div className="space-y-5">
          <div role="tablist" aria-label="Filter requests" className="inline-flex rounded-xl border border-border bg-card p-1">
            {(
              [
                ["pending", pending.length],
                ["declined", declined.length],
              ] as const
            ).map(([f, count]) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={requestFilter === f}
                onClick={() => setRequestFilter(f)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium capitalize transition-colors",
                  requestFilter === f ? "bg-surface-strong text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
                <span className="text-xs tabular-nums">{count}</span>
              </button>
            ))}
          </div>
          {requestFilter === "pending"
            ? list(pending, <EmptyState icon={Inbox} title="No pending requests" description="You're all caught up." />)
            : declined.length ? (
                <ul className="space-y-3">
                  {declined.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                      <div>
                        <div className="font-medium text-foreground">{getService(b.serviceId)?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {findUser(db, b.userId)?.name} · {formatDate(b.date, "weekday")} · {b.cancellation?.reason}
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Inbox} title="No declined requests" />
              )}
        </div>
      )}

      {view === "schedule" && (
        <div className="space-y-6">
          <Panel>
            <PanelHeader title="Upcoming ceremonies" description={`${upcoming.length} confirmed`} />
            {list(
              upcoming,
              <EmptyState icon={CalendarCheck} title="Nothing scheduled" description="Accepted requests will appear here." className="py-10" />
            )}
          </Panel>
          <Panel>
            <PanelHeader title="Recently completed" />
            {completed.length ? (
              <ul className="divide-y divide-border">
                {[...completed]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 8)
                  .map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">{getService(b.serviceId)?.name}</div>
                        <div className="truncate text-sm text-muted-foreground">
                          {findUser(db, b.userId)?.name} · {formatDate(b.date)}
                        </div>
                      </div>
                      <div className="font-heading font-semibold text-foreground">{formatINR(purohitEarning(b.pricing))}</div>
                    </li>
                  ))}
              </ul>
            ) : (
              <EmptyState icon={CheckCircle2} title="No completed ceremonies yet" className="py-10" />
            )}
          </Panel>
        </div>
      )}

      {view === "availability" && (
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Accepting new bookings</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Pause to hide your open slots from families. Confirmed ceremonies stay as they are.
                </p>
              </div>
              <Switch checked={purohit.accepting} aria-label="Accepting new bookings" onCheckedChange={(v) => api.setAccepting(v)} />
            </div>
          </Panel>
          <Panel>
            <PanelHeader title="Days off" description="Mark days you can't take ceremonies. Families won't be able to book them." />
            <AvailabilityCalendar purohitId={purohit.id} blockedDates={purohit.blockedDates} />
          </Panel>
        </div>
      )}

      {view === "profile" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <div className="flex items-center gap-4">
              <PurohitAvatar name={purohit.name} size="xl" verified />
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-foreground">{purohit.name}</h2>
                <p className="text-sm text-muted-foreground">{purohit.city}</p>
                <RatingBadge rating={purohit.rating} count={purohit.reviewCount} className="mt-1" />
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-foreground/85">{purohit.bio}</p>
            <Link href={`/purohit/${purohit.id}`} className={cn(buttonVariants({ variant: "outline" }), "mt-5")}>
              View public profile <ExternalLink />
            </Link>
          </Panel>
          <Panel>
            <PanelHeader title="Ceremonies & pricing" description="What families see when they book you." />
            <ul className="divide-y divide-border">
              {getServicesForPurohit(purohit).map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <ServiceIcon name={s.icon} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.duration}</div>
                  </div>
                  <div className="font-heading font-semibold text-foreground">{formatINR(s.basePrice)}</div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">To change your services or pricing, call partner support on 1800-123-4567.</p>
          </Panel>
        </div>
      )}

      <ReasonDialog
        open={declineTarget !== null}
        onOpenChange={(o) => !o && setDeclineTarget(null)}
        title="Decline this request?"
        description="The family will be told why, refunded in full, and shown other available purohits."
        reasons={declineReasons}
        confirmLabel="Decline request"
        cancelLabel="Keep request"
        onConfirm={(reason) => {
          if (!declineTarget) return;
          const res = api.purohitDecline({ bookingId: declineTarget.id, reason });
          if (!res.ok) return res.error;
          toast.info("Request declined", "The family has been notified.");
        }}
      />
      <ReasonDialog
        open={cancelTarget !== null}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel a confirmed ceremony?"
        description="The family will be told why and refunded in full. Please cancel only if you truly can't attend."
        reasons={cancelReasons}
        confirmLabel="Cancel ceremony"
        cancelLabel="Keep booking"
        onConfirm={(reason) => {
          if (!cancelTarget) return;
          const res = api.purohitDecline({ bookingId: cancelTarget.id, reason });
          if (!res.ok) return res.error;
          toast.info("Ceremony cancelled", "The family has been notified and refunded.");
        }}
      />
    </DashboardShell>
  );
}

export default function PurohitDashboardPage() {
  return (
    <RequireRole role="purohit" fullScreen>
      <Dashboard />
    </RequireRole>
  );
}
