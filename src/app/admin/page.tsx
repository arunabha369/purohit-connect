"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  IndianRupee,
  RotateCcw,
  Search,
  SearchX,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { getService } from "@/lib/catalog";
import { useApp, type Booking, type BookingStatus, type PurohitApplication } from "@/lib/store";
import { OCCUPYING_STATUSES } from "@/lib/store/availability";
import { findUser, getAllPurohits, toPurohitView, type PurohitView } from "@/lib/store/selectors";
import { bookingStatusMeta } from "@/lib/booking-status";
import { downloadFile } from "@/lib/calendar";
import { toCsv } from "@/lib/csv";
import { formatCompactINR, formatDate, formatINR, formatNumber, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { RequireRole } from "@/components/auth/require-role";
import { ReasonDialog } from "@/components/booking/reason-dialog";
import { DashboardShell, useHashView, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { ChartPanel, ChartTooltip, chartTheme } from "@/components/shared/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailRow, Panel, PanelHeader } from "@/components/shared/panel";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge } from "@/components/shared/rating";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge, ToneBadge } from "@/components/shared/status-badge";

const VIEWS = ["overview", "bookings", "purohits", "applications", "users"] as const;
type View = (typeof VIEWS)[number];

const adminCancelReasons = [
  "Purohit unavailable — could not find a replacement",
  "Duplicate booking",
  "Suspected fraud or policy violation",
  "Requested by the family over the phone",
];

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block flex-1 sm:max-w-xs">
      <span className="sr-only">{placeholder}</span>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-input bg-surface pr-3 pl-9 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-subtle-foreground hover:border-border-strong focus-visible:border-primary/70 focus-visible:ring-3 focus-visible:ring-primary/15"
      />
    </label>
  );
}

function TableCard({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">{children}</div>;
}

function purohitStatus(p: PurohitView): { label: string; tone: "success" | "neutral" | "danger" } {
  if (p.suspended) return { label: "Suspended", tone: "danger" };
  if (!p.accepting) return { label: "Paused", tone: "neutral" };
  return { label: "Active", tone: "success" };
}

function BookingSheet({
  booking,
  onOpenChange,
  onCancel,
}: {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
  onCancel: (b: Booking) => void;
}) {
  const { db } = useApp();
  const family = booking ? findUser(db, booking.userId) : undefined;
  const purohit = booking ? getAllPurohits(db).find((p) => p.id === booking.purohitId) : undefined;
  const service = booking ? getService(booking.serviceId) : undefined;

  return (
    <Sheet open={booking !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        {booking && (
          <>
            <div className="border-b border-border p-5 pr-12">
              <SheetTitle>{service?.name}</SheetTitle>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{booking.id}</p>
              <div className="mt-3">
                <StatusBadge status={booking.status} />
              </div>
            </div>
            <div className="space-y-6 p-5">
              <dl className="space-y-2.5">
                <DetailRow label="Family">
                  {family?.name || "—"}
                  <div className="text-xs font-normal text-muted-foreground">+91 {family?.phone}</div>
                </DetailRow>
                <DetailRow label="Purohit">{purohit?.name}</DetailRow>
                <DetailRow label="When">
                  {formatDate(booking.date, "weekday")}, {booking.timeSlot}
                </DetailRow>
                <DetailRow label="Venue">{booking.address}</DetailRow>
                <DetailRow label="Booked">{format(parseISO(booking.createdAt), "d MMM yyyy, h:mm a")}</DetailRow>
              </dl>
              <dl className="space-y-2.5 border-t border-border pt-5">
                <DetailRow label="Ceremony fee">{formatINR(booking.pricing.base)}</DetailRow>
                <DetailRow label="Platform fee">{formatINR(booking.pricing.platformFee)}</DetailRow>
                {booking.pricing.discount > 0 && (
                  <DetailRow label={`Coupon ${booking.pricing.coupon ?? ""}`}>−{formatINR(booking.pricing.discount)}</DetailRow>
                )}
                <DetailRow label="Total">{formatINR(booking.pricing.total)}</DetailRow>
                <DetailRow label="Payment">
                  {booking.paymentMethod} · {booking.paymentStatus}
                </DetailRow>
              </dl>
              {booking.cancellation && (
                <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-sm">
                  Cancelled by {booking.cancellation.by === "user" ? "the family" : booking.cancellation.by}:{" "}
                  {booking.cancellation.reason}
                </div>
              )}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Activity</h3>
                <ol className="space-y-3">
                  {[...booking.timeline].reverse().map((e, i) => (
                    <li key={`${e.at}-${i}`} className="text-sm">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-foreground">{e.status}</span>
                        <time className="shrink-0 text-xs text-muted-foreground" dateTime={e.at}>
                          {format(parseISO(e.at), "d MMM, h:mm a")}
                        </time>
                      </div>
                      <p className="text-muted-foreground">{e.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
              {OCCUPYING_STATUSES.includes(booking.status) && (
                <Button variant="destructive" className="w-full" onClick={() => onCancel(booking)}>
                  <XCircle /> Cancel & refund
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function AdminConsole() {
  const router = useRouter();
  const { db, api } = useApp();
  const [view, setView] = useHashView(VIEWS, "overview");
  const [bookingQuery, setBookingQuery] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"all" | BookingStatus>("all");
  const [purohitQuery, setPurohitQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [appFilter, setAppFilter] = useState<PurohitApplication["status"]>("pending");
  const [openBooking, setOpenBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PurohitApplication | null>(null);
  const [approveTarget, setApproveTarget] = useState<PurohitApplication | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const bookings = useMemo(() => [...db.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [db.bookings]);
  const purohits = useMemo(() => getAllPurohits(db).map((p) => toPurohitView(db, p)), [db]);
  const pendingApps = db.applications.filter((a) => a.status === "pending");
  const live = bookings.filter((b) => b.status !== "cancelled");
  const gmv = live.reduce((s, b) => s + b.pricing.total, 0);
  const platformRevenue = live.reduce((s, b) => s + b.pricing.platformFee - b.pricing.discount, 0);

  const monthly = useMemo(() => {
    const base = startOfMonth(new Date());
    return Array.from({ length: 6 }, (_, i) => {
      const from = toISODate(subMonths(base, 5 - i));
      const to = toISODate(subMonths(base, 4 - i));
      const inMonth = live.filter((b) => b.date >= from && b.date < to);
      return { month: format(parseISO(from), "MMM"), value: inMonth.reduce((s, b) => s + b.pricing.total, 0), bookings: inMonth.length };
    });
  }, [live]);

  const byCity = useMemo(() => {
    const counts = new Map<string, number>();
    live.forEach((b) => counts.set(b.city, (counts.get(b.city) ?? 0) + 1));
    return Array.from(counts.entries())
      .map(([city, count]) => ({ city, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 7);
  }, [live]);

  const filteredBookings = bookings.filter((b) => {
    if (bookingStatus !== "all" && b.status !== bookingStatus) return false;
    const q = bookingQuery.trim().toLowerCase();
    if (!q) return true;
    const fields = [
      b.id,
      getService(b.serviceId)?.name ?? "",
      purohits.find((p) => p.id === b.purohitId)?.name ?? "",
      findUser(db, b.userId)?.name ?? "",
      b.city,
    ];
    return fields.some((f) => f.toLowerCase().includes(q));
  });
  const filteredPurohits = purohits.filter((p) =>
    [p.name, p.city, p.phone].some((f) => f.toLowerCase().includes(purohitQuery.trim().toLowerCase()))
  );
  const filteredUsers = db.users.filter((u) =>
    [u.name, u.city, u.phone].some((f) => f.toLowerCase().includes(userQuery.trim().toLowerCase()))
  );

  const exportBookings = () => {
    const csv = toCsv(
      ["Booking ID", "Created", "Ceremony date", "Time", "Ceremony", "Family", "Phone", "Purohit", "City", "Status", "Payment", "Payment status", "Total (INR)"],
      filteredBookings.map((b) => {
        const u = findUser(db, b.userId);
        return [
          b.id,
          format(parseISO(b.createdAt), "yyyy-MM-dd HH:mm"),
          b.date,
          b.timeSlot,
          getService(b.serviceId)?.name,
          u?.name,
          u?.phone,
          purohits.find((p) => p.id === b.purohitId)?.name,
          b.city,
          bookingStatusMeta[b.status].label,
          b.paymentMethod,
          b.paymentStatus,
          b.pricing.total,
        ];
      })
    );
    downloadFile(`bookings-${toISODate(new Date())}.csv`, csv, "text/csv;charset=utf-8");
    toast.success(`Exported ${filteredBookings.length} bookings`);
  };

  const nav: DashboardNavItem<View>[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: CalendarDays, badge: bookings.filter((b) => b.status === "pending").length },
    { id: "purohits", label: "Purohits", icon: UserCheck },
    { id: "applications", label: "Applications", icon: ClipboardCheck, badge: pendingApps.length },
    { id: "users", label: "Users", icon: Users },
  ];

  const bookingsTable = (rows: Booking[]) => (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Booking</TableHead>
          <TableHead className="hidden md:table-cell">Family</TableHead>
          <TableHead className="hidden lg:table-cell">Purohit</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((b) => (
          <TableRow key={b.id} className="cursor-pointer" onClick={() => setOpenBooking(b)}>
            <TableCell>
              <button
                type="button"
                className="text-left font-medium text-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenBooking(b);
                }}
              >
                {getService(b.serviceId)?.name}
              </button>
              <div className="font-mono text-xs text-muted-foreground">
                {b.id} · {b.city}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{findUser(db, b.userId)?.name || "—"}</TableCell>
            <TableCell className="hidden lg:table-cell">{purohits.find((p) => p.id === b.purohitId)?.name}</TableCell>
            <TableCell className="hidden sm:table-cell">{formatDate(b.date)}</TableCell>
            <TableCell className="hidden text-right font-medium tabular-nums sm:table-cell">{formatINR(b.pricing.total)}</TableCell>
            <TableCell>
              <StatusBadge status={b.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardShell
      workspace="Admin"
      user={{ name: "Platform admin", role: `+91 ${db.session?.phone.slice(0, 5)} ${db.session?.phone.slice(5)}` }}
      items={nav}
      active={view}
      onNavigate={setView}
      title={nav.find((n) => n.id === view)?.label ?? "Admin"}
      actions={
        <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)} className="hidden sm:inline-flex">
          <RotateCcw /> Reset demo data
        </Button>
      }
    >
      {view === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label="Booking value (GMV)" value={formatCompactINR(gmv)} icon={IndianRupee} hint={`${formatCompactINR(platformRevenue)} platform revenue`} />
            <StatCard
              label="Bookings"
              value={formatNumber(live.length)}
              icon={CalendarDays}
              hint={`${bookings.filter((b) => b.status === "pending").length} awaiting a purohit`}
            />
            <StatCard
              label="Families"
              value={formatNumber(db.users.length)}
              icon={Users}
              hint={`${db.users.filter((u) => u.status === "suspended").length} suspended`}
            />
            <StatCard
              label="Purohits"
              value={formatNumber(purohits.filter((p) => !p.suspended).length)}
              icon={UserCheck}
              hint={`${pendingApps.length} application${pendingApps.length === 1 ? "" : "s"} to review`}
            />
          </div>

          {pendingApps.length > 0 && (
            <button
              type="button"
              onClick={() => setView("applications")}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/8 p-4 text-left transition-colors hover:bg-primary/12"
            >
              <span className="flex items-center gap-3">
                <ClipboardCheck className="size-5 text-primary" />
                <span className="text-sm text-foreground">
                  <span className="font-semibold">{pendingApps.length} purohit application{pendingApps.length > 1 ? "s" : ""}</span> waiting for
                  review
                </span>
              </span>
              <span className="text-sm font-medium text-primary">Review</span>
            </button>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartPanel
              title="Booking value"
              description="By ceremony month, excluding cancellations"
              data={monthly}
              columns={[
                { key: "month", label: "Month" },
                { key: "value", label: "Value", numeric: true, format: (v) => formatINR(Number(v)) },
                { key: "bookings", label: "Bookings", numeric: true },
              ]}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
                  <defs>
                    <linearGradient id="gmv-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartTheme.series} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={chartTheme.series} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={chartTheme.grid} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={chartTheme.axisTick} dy={6} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={chartTheme.axisTick}
                    width={52}
                    tickFormatter={(v: number) => formatCompactINR(v).replace(".0", "")}
                  />
                  <Tooltip cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} content={<ChartTooltip seriesLabel="Value" formatValue={formatINR} />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartTheme.series}
                    strokeWidth={2}
                    fill="url(#gmv-fill)"
                    dot={false}
                    activeDot={{ r: 5, fill: chartTheme.series, stroke: chartTheme.surface, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel
              title="Bookings by city"
              description="Excluding cancellations"
              data={byCity}
              columns={[
                { key: "city", label: "City" },
                { key: "bookings", label: "Bookings", numeric: true },
              ]}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCity} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={6}>
                  <CartesianGrid horizontal={false} stroke={chartTheme.grid} />
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis type="category" dataKey="city" tickLine={false} axisLine={false} tick={chartTheme.axisTick} width={84} />
                  <Tooltip cursor={{ fill: chartTheme.cursorFill }} content={<ChartTooltip seriesLabel="Bookings" formatValue={formatNumber} />} />
                  <Bar dataKey="bookings" fill={chartTheme.series} radius={[0, 4, 4, 0]} maxBarSize={20}>
                    <LabelList dataKey="bookings" position="right" style={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>

          <Panel className="p-0 sm:p-0">
            <PanelHeader
              title="Recent bookings"
              className="mb-0 px-5 pt-5 pb-4 sm:px-6"
              action={
                <Button variant="ghost" size="sm" onClick={() => setView("bookings")}>
                  View all
                </Button>
              }
            />
            {bookingsTable(bookings.slice(0, 6))}
          </Panel>
        </div>
      )}

      {view === "bookings" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={bookingQuery} onChange={setBookingQuery} placeholder="Search ID, ceremony, family, purohit" />
            <Select value={bookingStatus} onValueChange={(v) => v && setBookingStatus(v as typeof bookingStatus)}>
              <SelectTrigger aria-label="Filter by status" className="h-10 w-full sm:w-44">
                <SelectValue>{(v: string) => (v === "all" ? "All statuses" : bookingStatusMeta[v as BookingStatus].label)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(Object.keys(bookingStatusMeta) as BookingStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {bookingStatusMeta[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground sm:ml-auto">
              {filteredBookings.length} of {bookings.length}
            </span>
            <Button variant="outline" size="sm" onClick={exportBookings} disabled={!filteredBookings.length}>
              <Download /> Export CSV
            </Button>
          </div>
          {filteredBookings.length ? (
            <TableCard>{bookingsTable(filteredBookings)}</TableCard>
          ) : (
            <EmptyState icon={SearchX} title="No bookings match" description="Try a different search or status." />
          )}
        </div>
      )}

      {view === "purohits" && (
        <div className="space-y-4">
          <SearchInput value={purohitQuery} onChange={setPurohitQuery} placeholder="Search name, city or phone" />
          {filteredPurohits.length ? (
            <TableCard>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Purohit</TableHead>
                    <TableHead className="hidden sm:table-cell">Rating</TableHead>
                    <TableHead className="hidden text-right md:table-cell">Active bookings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurohits.map((p) => {
                    const status = purohitStatus(p);
                    const activeBookings = db.bookings.filter((b) => b.purohitId === p.id && OCCUPYING_STATUSES.includes(b.status)).length;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <PurohitAvatar name={p.name} size="sm" />
                            <div className="min-w-0">
                              <Link href={`/purohit/${p.id}`} className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary">
                                {p.name}
                                <ExternalLink className="size-3 opacity-60" />
                              </Link>
                              <div className="text-xs text-muted-foreground">
                                {p.city} · {p.experience} yrs
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <RatingBadge rating={p.rating} count={p.reviewCount} />
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums md:table-cell">{activeBookings}</TableCell>
                        <TableCell>
                          <ToneBadge tone={status.tone}>{status.label}</ToneBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={p.suspended ? "soft" : "ghost"}
                            size="xs"
                            onClick={() => {
                              const res = api.setPurohitSuspended({ purohitId: p.id, suspended: !p.suspended });
                              if (!res.ok) toast.error(res.error);
                              else
                                toast.success(
                                  p.suspended ? `${p.name} reinstated` : `${p.name} suspended`,
                                  p.suspended ? "The profile is visible again." : "Hidden from search; no new bookings."
                                );
                            }}
                          >
                            {p.suspended ? "Reinstate" : "Suspend"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableCard>
          ) : (
            <EmptyState icon={SearchX} title="No purohits match" />
          )}
        </div>
      )}

      {view === "applications" && (
        <div className="space-y-5">
          <div role="tablist" aria-label="Filter applications" className="inline-flex rounded-xl border border-border bg-card p-1">
            {(["pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={appFilter === f}
                onClick={() => setAppFilter(f)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium capitalize transition-colors",
                  appFilter === f ? "bg-surface-strong text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
                <span className="text-xs tabular-nums">{db.applications.filter((a) => a.status === f).length}</span>
              </button>
            ))}
          </div>
          {(() => {
            const apps = db.applications.filter((a) => a.status === appFilter);
            if (!apps.length) return <EmptyState icon={ClipboardCheck} title={`No ${appFilter} applications`} />;
            return (
              <div className="grid gap-4 xl:grid-cols-2">
                {apps.map((a) => (
                  <article key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <PurohitAvatar name={a.name} size="md" />
                        <div>
                          <h3 className="font-semibold text-foreground">{a.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {a.city} · {a.experience} yrs · from {formatINR(a.startingPrice)}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{format(parseISO(a.submittedAt), "d MMM")}</span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/85">{a.bio}</p>
                    <dl className="mt-4 space-y-2 text-sm">
                      <DetailRow label="Ceremonies">{a.specializations.join(", ")}</DetailRow>
                      <DetailRow label="Languages">{a.languages.join(", ")}</DetailRow>
                      <DetailRow label="Contact">
                        +91 {a.phone}
                        {a.email && <div className="text-xs font-normal text-muted-foreground">{a.email}</div>}
                      </DetailRow>
                    </dl>
                    {a.status === "pending" ? (
                      <div className="mt-5 flex gap-2">
                        <Button size="sm" variant="success" onClick={() => setApproveTarget(a)}>
                          <CheckCircle2 /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectTarget(a)}>
                          <XCircle /> Reject
                        </Button>
                      </div>
                    ) : a.status === "approved" ? (
                      <div className="mt-5 flex items-center gap-3">
                        <ToneBadge tone="success">Approved</ToneBadge>
                        {a.purohitId && (
                          <Link href={`/purohit/${a.purohitId}`} className="text-sm font-medium text-primary hover:text-primary-hover">
                            View profile
                          </Link>
                        )}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-muted-foreground">
                        <ToneBadge tone="danger">Rejected</ToneBadge> <span className="ml-2">{a.reviewNote}</span>
                      </p>
                    )}
                  </article>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {view === "users" && (
        <div className="space-y-4">
          <SearchInput value={userQuery} onChange={setUserQuery} placeholder="Search name, phone or city" />
          {filteredUsers.length ? (
            <TableCard>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Bookings</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{u.name || "New user (no name yet)"}</div>
                        <div className="text-xs text-muted-foreground">{u.city || "—"}</div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell">+91 {u.phone}</TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">
                        {db.bookings.filter((b) => b.userId === u.id).length}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(parseISO(u.joinedAt))}</TableCell>
                      <TableCell>
                        <ToneBadge tone={u.status === "active" ? "success" : "danger"}>{u.status === "active" ? "Active" : "Suspended"}</ToneBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={u.status === "active" ? "ghost" : "soft"}
                          size="xs"
                          onClick={() => {
                            const next = u.status === "active" ? "suspended" : "active";
                            const res = api.setUserStatus({ userId: u.id, status: next });
                            if (!res.ok) toast.error(res.error);
                            else toast.success(`${u.name || "User"} ${next === "active" ? "reactivated" : "suspended"}`);
                          }}
                        >
                          {u.status === "active" ? "Suspend" : "Reactivate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCard>
          ) : (
            <EmptyState icon={SearchX} title="No users match" />
          )}
        </div>
      )}

      <BookingSheet
        booking={openBooking && (db.bookings.find((b) => b.id === openBooking.id) ?? null)}
        onOpenChange={(o) => !o && setOpenBooking(null)}
        onCancel={setCancelTarget}
      />
      <ReasonDialog
        open={cancelTarget !== null}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel and refund this booking?"
        description="The family and the purohit are both notified. Online payments are refunded in full."
        reasons={adminCancelReasons}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        onConfirm={(reason) => {
          if (!cancelTarget) return;
          const res = api.adminCancelBooking({ bookingId: cancelTarget.id, reason });
          if (!res.ok) return res.error;
          toast.success("Booking cancelled", "Refund initiated and both parties notified.");
        }}
      />
      <ReasonDialog
        open={rejectTarget !== null}
        onOpenChange={(o) => !o && setRejectTarget(null)}
        title={`Reject ${rejectTarget?.name ?? "application"}?`}
        description="The applicant will see this reason so they can reapply."
        reasons={["Qualifications could not be verified", "Incomplete or unclear information", "Not operating in our service areas yet"]}
        confirmLabel="Reject application"
        onConfirm={(note) => {
          if (!rejectTarget) return;
          const res = api.reviewApplication({ applicationId: rejectTarget.id, approve: false, note });
          if (!res.ok) return res.error;
          toast.info("Application rejected");
        }}
      />
      <ConfirmDialog
        open={approveTarget !== null}
        onOpenChange={(o) => !o && setApproveTarget(null)}
        title={`Approve ${approveTarget?.name ?? ""}?`}
        description="Their profile goes live immediately and they can sign in to the purohit dashboard with their phone number."
        confirmLabel="Approve & publish"
        icon={<CheckCircle2 className="size-5" />}
        onConfirm={() => {
          if (!approveTarget) return;
          const res = api.reviewApplication({ applicationId: approveTarget.id, approve: true });
          if (!res.ok) toast.error(res.error);
          else toast.success(`${approveTarget.name} approved`, "The profile is now live in search.");
        }}
      />
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset all demo data?"
        description="Every booking, account change and application made in this browser will be replaced with fresh sample data, and you'll be signed out."
        confirmLabel="Reset data"
        tone="destructive"
        icon={<RotateCcw className="size-5" />}
        onConfirm={() => {
          api.resetDemo();
          toast.success("Demo data reset");
          router.push("/login?role=admin");
        }}
      />
    </DashboardShell>
  );
}

export default function AdminPage() {
  return (
    <RequireRole role="admin" fullScreen>
      <AdminConsole />
    </RequireRole>
  );
}
