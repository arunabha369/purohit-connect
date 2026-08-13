"use client";

import {
  adminStats,
  revenueChartData,
  bookingsByCityData,
  initialBookings,
  purohits,
  services,
} from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  CalendarDays,
  IndianRupee,
  TrendingUp,
  Home,
  LogOut,
  BarChart3,
  UserCheck,
  Menu,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  accepted: { bg: "bg-blue-100", text: "text-blue-700", label: "Accepted" },
  "on-the-way": { bg: "bg-purple-100", text: "text-purple-700", label: "On the Way" },
  "in-progress": { bg: "bg-cyan-100", text: "text-cyan-700", label: "In Progress" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

export default function AdminDashboardPage() {
  const [sideOpen, setSideOpen] = useState(false);

  const sideNavItems = [
    { icon: BarChart3, label: "Overview", active: true },
    { icon: CalendarDays, label: "Bookings", active: false },
    { icon: UserCheck, label: "Purohits", active: false },
    { icon: Users, label: "Users", active: false },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-xl border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={sideOpen} onOpenChange={setSideOpen}>
              <SheetTrigger className="md:hidden flex h-10 w-10 items-center justify-center rounded-md hover:bg-cream-200 text-gray-500">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-cream-100 border-cream-200">
                <SheetTitle className="font-heading text-lg">Admin Menu</SheetTitle>
                <nav className="flex flex-col gap-1 mt-6">
                  {sideNavItems.map((item) => (
                    <button
                      key={item.label}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                        item.active ? "bg-maroon-50 text-maroon-800" : "text-cream-400 hover:bg-cream-200"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                  <Separator className="my-3" />
                  <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-cream-400 hover:bg-cream-200">
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-charcoal to-charcoal-lighter flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-saffron-400" />
              </div>
              <span className="font-heading font-bold text-lg">
                Admin <span className="text-maroon-800">Panel</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-500 hidden md:flex">
                <Home className="w-4 h-4 mr-1" /> Home
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <LogOut className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 p-4 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            {sideNavItems.map((item) => (
              <button
                key={item.label}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full",
                  item.active ? "bg-maroon-50 text-maroon-800" : "text-cream-400 hover:bg-cream-200"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <Separator className="my-3" />
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-cream-400 hover:bg-cream-200">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 px-4 py-6 overflow-hidden">
          <h1 className="font-heading font-bold text-2xl text-charcoal mb-6">
            Admin Overview
          </h1>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-emerald-600 font-medium">
                  +{adminStats.monthlyGrowth}%
                </span>
              </div>
              <div className="font-heading font-bold text-xl text-charcoal">
                {adminStats.totalUsers.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-gray-500">Total Users</div>
            </div>
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <CalendarDays className="w-5 h-5 text-maroon-800" />
                <span className="text-xs text-emerald-600 font-medium">
                  {adminStats.activeBookings} active
                </span>
              </div>
              <div className="font-heading font-bold text-xl text-charcoal">
                {adminStats.totalBookings.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-gray-500">Total Bookings</div>
            </div>
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <IndianRupee className="w-5 h-5 text-emerald-500" />
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="font-heading font-bold text-xl text-charcoal">
                ₹{(adminStats.totalRevenue / 100000).toFixed(1)}L
              </div>
              <div className="text-xs text-gray-500">Total Revenue</div>
            </div>
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="w-5 h-5 text-saffron-500" />
              </div>
              <div className="font-heading font-bold text-xl text-charcoal">
                {adminStats.totalPurohits}
              </div>
              <div className="text-xs text-gray-500">Active Purohits</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-base mb-4">
                Revenue Trend
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="#5A5A6A"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#5A5A6A"
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(value: unknown) => [
                        `₹${(Number(value) || 0).toLocaleString("en-IN")}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #2A2A3A", background: "#111119", color: "#F0ECE4",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#D4A843"
                      strokeWidth={2.5}
                      dot={{ fill: "#D4A843", r: 4 }}
                      activeDot={{ r: 6, fill: "#E8C050" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-base mb-4">
                Bookings by City
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsByCityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                    <XAxis
                      dataKey="city"
                      tick={{ fontSize: 11 }}
                      stroke="#5A5A6A"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#5A5A6A"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #2A2A3A", background: "#111119", color: "#F0ECE4",
                      }}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#D4A843"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tables */}
          <Tabs defaultValue="bookings">
            <TabsList className="bg-cream-100 rounded-xl p-1 h-auto">
              <TabsTrigger
                value="bookings"
                className="rounded-lg py-2 data-[state=active]:bg-cream-200 data-[state=active]:shadow-sm"
              >
                Recent Bookings
              </TabsTrigger>
              <TabsTrigger
                value="purohits"
                className="rounded-lg py-2 data-[state=active]:bg-cream-200 data-[state=active]:shadow-sm"
              >
                Purohits
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-4">
              <div className="bg-cream-100 rounded-2xl shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-cream-200">
                      <TableHead className="font-semibold">Booking ID</TableHead>
                      <TableHead className="font-semibold">Service</TableHead>
                      <TableHead className="font-semibold">City</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialBookings.map((b) => {
                      const service = services.find((s) => s.id === b.serviceId);
                      const status = statusStyles[b.status];
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono text-xs">
                            {b.id}
                          </TableCell>
                          <TableCell className="text-sm">
                            {service?.name}
                          </TableCell>
                          <TableCell className="text-sm">{b.city}</TableCell>
                          <TableCell className="text-sm font-medium">
                            ₹{b.totalAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "border-0 text-xs",
                                status?.bg,
                                status?.text
                              )}
                            >
                              {status?.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="purohits" className="mt-4">
              <div className="bg-cream-100 rounded-2xl shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-cream-200">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">City</TableHead>
                      <TableHead className="font-semibold">Rating</TableHead>
                      <TableHead className="font-semibold">Experience</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purohits.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-sm">
                          {p.name}
                        </TableCell>
                        <TableCell className="text-sm">{p.city}</TableCell>
                        <TableCell className="text-sm">
                          ⭐ {p.rating}
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.experience} yrs
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "border-0 text-xs",
                              p.available
                                ? "bg-emerald-900/40 text-emerald-400"
                                : "bg-gray-800/40 text-gray-400"
                            )}
                          >
                            {p.available ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
