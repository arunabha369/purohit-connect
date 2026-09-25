"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
  Inbox,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  getPurohit,
  getServicesForPurohit,
  purohitDashboardData,
  purohitWeeklyEarnings,
} from "@/lib/mock-data";
import { useApp } from "@/lib/booking-context";
import { formatCompactINR, formatDate, formatINR, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { DashboardShell, useHashView, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { ChartPanel, ChartTooltip, chartTheme } from "@/components/shared/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Panel, PanelHeader } from "@/components/shared/panel";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge } from "@/components/shared/rating";
import { ServiceIcon } from "@/components/shared/service-icon";
import { StatCard } from "@/components/shared/stat-card";
import { ToneBadge } from "@/components/shared/status-badge";

const VIEWS = ["overview", "requests", "schedule", "profile"] as const;
type View = (typeof VIEWS)[number];

type Request = (typeof purohitDashboardData.pendingRequests)[number];

const data = purohitDashboardData;
const me = getPurohit("pt-001")!;

function RequestCard({
  req,
  state,
  onAccept,
  onDecline,
}: {
  req: Request;
  state: "pending" | "accepted" | "declined";
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border p-4 transition-colors sm:p-5",
        state === "accepted" && "border-success/30 bg-success/[0.04]",
        state === "declined" && "border-border bg-card opacity-60",
        state === "pending" && "border-border bg-surface/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{req.service}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{req.userName}</p>
        </div>
        <div className="text-right">
          <div className="font-heading font-semibold text-foreground">{formatINR(req.amount)}</div>
          {state !== "pending" && (
            <ToneBadge tone={state === "accepted" ? "success" : "neutral"} className="mt-1">
              {state === "accepted" ? "Accepted" : "Declined"}
            </ToneBadge>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-subtle-foreground" />
          {formatDate(req.date, "weekday")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 text-subtle-foreground" />
          {req.time}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4 text-subtle-foreground" />
          {req.location}
        </span>
      </div>
      {state === "pending" && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="success" onClick={onAccept} className="flex-1 sm:flex-none">
            <CheckCircle2 /> Accept
          </Button>
          <Button size="sm" variant="outline" onClick={onDecline} className="flex-1 sm:flex-none">
            <XCircle /> Decline
          </Button>
        </div>
      )}
    </article>
  );
}

export default function PurohitDashboardPage() {
  const {
    acceptRequest,
    rejectRequest,
    acceptedRequests,
    rejectedRequests,
    purohitAvailable,
    setPurohitAvailable,
  } = useApp();
  const [view, setView] = useHashView(VIEWS, "overview");
  const [declineTarget, setDeclineTarget] = useState<Request | null>(null);
  const [requestFilter, setRequestFilter] = useState<"pending" | "accepted" | "declined">("pending");

  const stateOf = (id: string) =>
    acceptedRequests.includes(id) ? "accepted" : rejectedRequests.includes(id) ? "declined" : "pending";
  const pending = data.pendingRequests.filter((r) => stateOf(r.id) === "pending");

  const accept = (req: Request) => {
    acceptRequest(req.id);
    toast.success("Request accepted", `${req.userName} has been notified.`);
  };

  const schedule = [
    ...data.pendingRequests
      .filter((r) => stateOf(r.id) === "accepted")
      .map((r) => ({ id: r.id, service: r.service, date: r.date, client: r.userName, location: r.location, time: r.time })),
    ...data.upcomingBookings.map((b) => ({ ...b, time: undefined as string | undefined })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const nav: DashboardNavItem<View>[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "requests", label: "Requests", icon: Inbox, badge: pending.length },
    { id: "schedule", label: "Schedule", icon: CalendarDays },
    { id: "profile", label: "My profile", icon: UserRound },
  ];

  const titles: Record<View, string> = {
    overview: `Namaste, ${me.name.split(" ")[1]} ji`,
    requests: "Booking requests",
    schedule: "Schedule",
    profile: "My profile",
  };

  const scheduleList = (items: typeof schedule) =>
    items.length ? (
      <ol className="space-y-3">
        {items.map((b) => (
          <li key={b.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface/40 p-4">
            <div className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-primary/10 py-1.5 text-primary">
              <span className="text-[0.625rem] font-semibold uppercase">{formatDate(b.date, "short").split(" ")[1]}</span>
              <span className="font-heading text-lg leading-none font-semibold">{formatDate(b.date, "short").split(" ")[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-foreground">{b.service}</div>
              <div className="mt-0.5 truncate text-sm text-muted-foreground">
                {b.client} · {b.location}
                {b.time && ` · ${b.time}`}
              </div>
            </div>
          </li>
        ))}
      </ol>
    ) : (
      <EmptyState icon={CalendarCheck} title="Nothing scheduled" description="Accepted requests will appear here." className="py-10" />
    );

  return (
    <DashboardShell
      workspace="Purohit"
      user={{ name: me.name, role: `${me.city} · Verified purohit` }}
      items={nav}
      active={view}
      onNavigate={setView}
      title={titles[view]}
      actions={
        <label className="flex cursor-pointer items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pr-1.5 pl-3 text-sm">
          <span className={cn("hidden font-medium sm:inline", purohitAvailable ? "text-success" : "text-muted-foreground")}>
            {purohitAvailable ? "Accepting bookings" : "Paused"}
          </span>
          <Switch
            checked={purohitAvailable}
            aria-label="Accepting new bookings"
            onCheckedChange={(v) => {
              setPurohitAvailable(v);
              toast.info(v ? "You're accepting bookings" : "New bookings paused", v ? undefined : "Existing bookings are not affected.");
            }}
          />
        </label>
      }
    >
      {view === "overview" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Here&apos;s how your week is going.</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label="Today" value={formatINR(data.todayEarnings)} icon={IndianRupee} hint="2 ceremonies" />
            <StatCard label="This week" value={formatINR(data.weekEarnings)} icon={TrendingUp} delta={{ value: 8, period: "last week" }} />
            <StatCard label="This month" value={formatCompactINR(data.monthEarnings)} icon={CalendarDays} delta={{ value: 12, period: "last month" }} />
            <StatCard label="Pujas completed" value={formatNumber(data.totalCompleted)} icon={CheckCircle2} hint="All time" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <ChartPanel
              title="Earnings this week"
              description={`${formatINR(purohitWeeklyEarnings.reduce((s, d) => s + d.earnings, 0))} across 7 days`}
              data={purohitWeeklyEarnings}
              columns={[
                { key: "day", label: "Day" },
                { key: "earnings", label: "Earnings", numeric: true, format: (v) => formatINR(Number(v)) },
              ]}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purohitWeeklyEarnings} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
                  <CartesianGrid vertical={false} stroke={chartTheme.grid} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={chartTheme.axisTick} dy={6} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={chartTheme.axisTick}
                    width={48}
                    tickFormatter={(v: number) => `₹${v / 1000}K`}
                  />
                  <Tooltip
                    cursor={{ fill: chartTheme.cursorFill }}
                    content={<ChartTooltip seriesLabel="Earnings" formatValue={formatINR} />}
                  />
                  <Bar dataKey="earnings" fill={chartTheme.series} radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <Panel>
              <PanelHeader
                title="Needs your response"
                description={pending.length ? `${pending.length} pending request${pending.length > 1 ? "s" : ""}` : undefined}
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
                  {pending.slice(0, 2).map((req) => (
                    <RequestCard
                      key={req.id}
                      req={req}
                      state="pending"
                      onAccept={() => accept(req)}
                      onDecline={() => setDeclineTarget(req)}
                    />
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
            {scheduleList(schedule.slice(0, 3))}
          </Panel>
        </div>
      )}

      {view === "requests" && (
        <div className="space-y-5">
          <div role="tablist" aria-label="Filter requests" className="inline-flex rounded-xl border border-border bg-card p-1">
            {(["pending", "accepted", "declined"] as const).map((f) => {
              const count = data.pendingRequests.filter((r) => stateOf(r.id) === f).length;
              return (
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
                  <span className="text-xs tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
          {(() => {
            const list = data.pendingRequests.filter((r) => stateOf(r.id) === requestFilter);
            return list.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {list.map((req) => (
                  <RequestCard
                    key={req.id}
                    req={req}
                    state={stateOf(req.id)}
                    onAccept={() => accept(req)}
                    onDecline={() => setDeclineTarget(req)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title={`No ${requestFilter} requests`}
                description={requestFilter === "pending" ? "You're all caught up." : undefined}
              />
            );
          })()}
        </div>
      )}

      {view === "schedule" && (
        <Panel>
          <PanelHeader title="Upcoming ceremonies" description={`${schedule.length} scheduled`} />
          {scheduleList(schedule)}
        </Panel>
      )}

      {view === "profile" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel>
            <div className="flex items-center gap-4">
              <PurohitAvatar name={me.name} size="xl" verified />
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-foreground">{me.name}</h2>
                <p className="text-sm text-muted-foreground">{me.city}</p>
                <RatingBadge rating={me.rating} count={me.reviewCount} className="mt-1" />
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-foreground/85">{me.bio}</p>
            <Link href={`/purohit/${me.id}`} className={cn(buttonVariants({ variant: "outline" }), "mt-5")}>
              View public profile <ExternalLink />
            </Link>
          </Panel>
          <Panel>
            <PanelHeader title="Ceremonies & pricing" description="What families see when they book you." />
            <ul className="divide-y divide-border">
              {getServicesForPurohit(me).map((s) => (
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
          </Panel>
        </div>
      )}

      <ConfirmDialog
        open={declineTarget !== null}
        onOpenChange={(o) => !o && setDeclineTarget(null)}
        title="Decline this request?"
        description={
          declineTarget && (
            <>
              {declineTarget.service} for {declineTarget.userName} on {formatDate(declineTarget.date, "weekday")}.
              The family will be offered other available purohits.
            </>
          )
        }
        confirmLabel="Decline request"
        cancelLabel="Keep request"
        tone="destructive"
        icon={<XCircle className="size-5" />}
        onConfirm={() => {
          if (!declineTarget) return;
          rejectRequest(declineTarget.id);
          toast.info("Request declined", `${declineTarget.userName} will be offered other purohits.`);
        }}
      />
    </DashboardShell>
  );
}
