"use client";

import { useMemo, useState } from "react";
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
  IndianRupee,
  Search,
  SearchX,
  UserCheck,
  Users,
} from "lucide-react";
import {
  adminStats,
  adminUsers,
  bookingsByCityData,
  getPurohit,
  getService,
  purohits,
  revenueChartData,
} from "@/lib/mock-data";
import { useApp } from "@/lib/booking-context";
import { BookingStatus, bookingStatusMeta } from "@/lib/booking-status";
import { formatCompactINR, formatDate, formatINR, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { DashboardShell, useHashView, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { ChartPanel, ChartTooltip, chartTheme } from "@/components/shared/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Panel, PanelHeader } from "@/components/shared/panel";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge } from "@/components/shared/rating";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge, ToneBadge } from "@/components/shared/status-badge";

const VIEWS = ["overview", "bookings", "purohits", "users"] as const;
type View = (typeof VIEWS)[number];

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
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

export default function AdminDashboardPage() {
  const { bookings, profile } = useApp();
  const [view, setView] = useHashView(VIEWS, "overview");
  const [bookingQuery, setBookingQuery] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"all" | BookingStatus>("all");
  const [purohitQuery, setPurohitQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [purohitActive, setPurohitActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(purohits.map((p) => [p.id, p.available]))
  );

  const filteredBookings = useMemo(() => {
    const q = bookingQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      if (bookingStatus !== "all" && b.status !== bookingStatus) return false;
      if (!q) return true;
      const service = getService(b.serviceId)?.name ?? "";
      const purohit = getPurohit(b.purohitId)?.name ?? "";
      return [b.id, service, purohit, b.city].some((f) => f.toLowerCase().includes(q));
    });
  }, [bookings, bookingQuery, bookingStatus]);

  const filteredPurohits = purohits.filter((p) =>
    [p.name, p.city].some((f) => f.toLowerCase().includes(purohitQuery.trim().toLowerCase()))
  );
  const filteredUsers = adminUsers.filter((u) =>
    [u.name, u.city, u.phone].some((f) => f.toLowerCase().includes(userQuery.trim().toLowerCase()))
  );

  const nav: DashboardNavItem<View>[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "purohits", label: "Purohits", icon: UserCheck },
    { id: "users", label: "Users", icon: Users },
  ];

  const titles: Record<View, string> = {
    overview: "Overview",
    bookings: "Bookings",
    purohits: "Purohits",
    users: "Users",
  };

  const bookingsTable = (rows: typeof bookings) => (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Booking</TableHead>
          <TableHead className="hidden md:table-cell">Purohit</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((b) => (
          <TableRow key={b.id}>
            <TableCell>
              <div className="font-medium text-foreground">{getService(b.serviceId)?.name}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {b.id} · {b.city}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{getPurohit(b.purohitId)?.name}</TableCell>
            <TableCell className="hidden sm:table-cell">{formatDate(b.date)}</TableCell>
            <TableCell className="hidden text-right font-medium tabular-nums sm:table-cell">{formatINR(b.totalAmount)}</TableCell>
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
      user={{ name: profile.name, role: "Platform admin" }}
      items={nav}
      active={view}
      onNavigate={setView}
      title={titles[view]}
    >
      {view === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Total revenue"
              value={formatCompactINR(adminStats.totalRevenue)}
              icon={IndianRupee}
              delta={{ value: adminStats.monthlyGrowth, period: "last month" }}
            />
            <StatCard
              label="Total bookings"
              value={formatNumber(adminStats.totalBookings)}
              icon={CalendarDays}
              hint={`${adminStats.activeBookings} active right now`}
            />
            <StatCard
              label="Registered users"
              value={formatNumber(adminStats.totalUsers)}
              icon={Users}
              delta={{ value: 12.4, period: "last month" }}
            />
            <StatCard
              label="Active purohits"
              value={formatNumber(adminStats.totalPurohits)}
              icon={UserCheck}
              hint="Across 10 cities"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartPanel
              title="Monthly revenue"
              description="Gross booking value, last 12 months"
              data={revenueChartData}
              columns={[
                { key: "month", label: "Month" },
                { key: "revenue", label: "Revenue", numeric: true, format: (v) => formatINR(Number(v)) },
                { key: "bookings", label: "Bookings", numeric: true, format: (v) => formatNumber(Number(v)) },
              ]}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
                  <defs>
                    <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartTheme.series} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={chartTheme.series} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={chartTheme.grid} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={chartTheme.axisTick} dy={6} interval="preserveStartEnd" />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={chartTheme.axisTick}
                    width={52}
                    tickFormatter={(v: number) => formatCompactINR(v).replace(".0", "")}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
                    content={<ChartTooltip seriesLabel="Revenue" formatValue={formatINR} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={chartTheme.series}
                    strokeWidth={2}
                    fill="url(#revenue-fill)"
                    dot={false}
                    activeDot={{ r: 5, fill: chartTheme.series, stroke: chartTheme.surface, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel
              title="Bookings by city"
              description="All-time, top 7 cities"
              data={bookingsByCityData}
              columns={[
                { key: "city", label: "City" },
                { key: "bookings", label: "Bookings", numeric: true, format: (v) => formatNumber(Number(v)) },
              ]}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingsByCityData}
                  layout="vertical"
                  margin={{ top: 0, right: 48, bottom: 0, left: 0 }}
                  barCategoryGap={6}
                >
                  <CartesianGrid horizontal={false} stroke={chartTheme.grid} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="city"
                    tickLine={false}
                    axisLine={false}
                    tick={chartTheme.axisTick}
                    width={76}
                  />
                  <Tooltip
                    cursor={{ fill: chartTheme.cursorFill }}
                    content={<ChartTooltip seriesLabel="Bookings" formatValue={formatNumber} />}
                  />
                  <Bar dataKey="bookings" fill={chartTheme.series} radius={[0, 4, 4, 0]} maxBarSize={20}>
                    <LabelList
                      dataKey="bookings"
                      position="right"
                      formatter={(v: unknown) => formatNumber(Number(v))}
                      style={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
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
            {bookingsTable(bookings.slice(0, 5))}
          </Panel>
        </div>
      )}

      {view === "bookings" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={bookingQuery} onChange={setBookingQuery} placeholder="Search ID, ceremony, purohit, city" />
            <Select value={bookingStatus} onValueChange={(v) => v && setBookingStatus(v as typeof bookingStatus)}>
              <SelectTrigger aria-label="Filter by status" className="h-10 w-full sm:w-48">
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
          <SearchInput value={purohitQuery} onChange={setPurohitQuery} placeholder="Search name or city" />
          {filteredPurohits.length ? (
            <TableCard>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Purohit</TableHead>
                    <TableHead className="hidden sm:table-cell">Rating</TableHead>
                    <TableHead className="hidden md:table-cell">Experience</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Pujas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurohits.map((p) => {
                    const active = purohitActive[p.id];
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <PurohitAvatar name={p.name} size="sm" />
                            <div>
                              <div className="font-medium text-foreground">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{p.city}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <RatingBadge rating={p.rating} count={p.reviewCount} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{p.experience} yrs</TableCell>
                        <TableCell className="hidden text-right tabular-nums lg:table-cell">{formatNumber(p.completedPujas)}</TableCell>
                        <TableCell>
                          <ToneBadge tone={active ? "success" : "neutral"}>{active ? "Active" : "Inactive"}</ToneBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={active ? "ghost" : "soft"}
                            size="xs"
                            onClick={() => {
                              setPurohitActive((s) => ({ ...s, [p.id]: !active }));
                              toast.success(`${p.name} ${active ? "deactivated" : "activated"}`);
                            }}
                          >
                            {active ? "Deactivate" : "Activate"}
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
                    <TableHead className="hidden sm:table-cell text-right">Bookings</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.city}</div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell">{u.phone}</TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">{u.bookings}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(u.joined)}</TableCell>
                      <TableCell>
                        <ToneBadge tone={u.status === "active" ? "success" : "danger"}>
                          {u.status === "active" ? "Active" : "Suspended"}
                        </ToneBadge>
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
    </DashboardShell>
  );
}
