"use client";

import { purohitDashboardData } from "@/lib/mock-data";
import { useApp } from "@/lib/booking-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Home,
  User,
  LogOut,
  BarChart3,
  CalendarDays,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const sideNavItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: CalendarDays, label: "Calendar", active: false },
  { icon: User, label: "Profile", active: false },
];

export default function PurohitDashboardPage() {
  const { acceptRequest, rejectRequest, acceptedRequests, rejectedRequests } =
    useApp();
  const data = purohitDashboardData;
  const [sideOpen, setSideOpen] = useState(false);

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
                <SheetTitle className="font-heading text-lg">Menu</SheetTitle>
                <nav className="flex flex-col gap-1 mt-6">
                  {sideNavItems.map((item) => (
                    <button
                      key={item.label}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                        item.active
                          ? "bg-maroon-50 text-maroon-800"
                          : "text-cream-400 hover:bg-cream-200"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                  <Separator className="my-3" />
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-cream-400 hover:bg-cream-200"
                  >
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-maroon-800 to-saffron-400 flex items-center justify-center">
                <span className="text-white font-bold text-xs">🙏</span>
              </div>
              <span className="font-heading font-bold text-lg">
                Purohit <span className="text-maroon-800">Dashboard</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hidden md:flex"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
              >
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
                  item.active
                    ? "bg-maroon-50 text-maroon-800"
                    : "text-cream-400 hover:bg-cream-200"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <Separator className="my-3" />
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-cream-400 hover:bg-cream-200"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6">
          <h1 className="font-heading font-bold text-2xl text-charcoal mb-6">
            Welcome back, Pandit Ramesh 🙏
          </h1>

          {/* Earnings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Today</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="font-heading font-bold text-2xl text-charcoal flex items-center gap-0.5">
                <IndianRupee className="w-5 h-5" />
                {data.todayEarnings.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">This Week</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="font-heading font-bold text-2xl text-charcoal flex items-center gap-0.5">
                <IndianRupee className="w-5 h-5" />
                {data.weekEarnings.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">This Month</span>
                <BarChart3 className="w-4 h-4 text-maroon-800" />
              </div>
              <div className="font-heading font-bold text-2xl text-charcoal flex items-center gap-0.5">
                <IndianRupee className="w-5 h-5" />
                {data.monthEarnings.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-emerald-600 mt-1">
                ↑ 12% vs last month
              </div>
            </div>
          </div>

          {/* Incoming Requests */}
          <div className="bg-cream-100 rounded-2xl shadow-card p-5 mb-6">
            <h2 className="font-heading font-semibold text-lg mb-4">
              Incoming Requests
            </h2>
            <div className="space-y-3">
              {data.pendingRequests.map((req) => {
                const isAccepted = acceptedRequests.includes(req.id);
                const isRejected = rejectedRequests.includes(req.id);
                return (
                  <div
                    key={req.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      isAccepted
                        ? "border-emerald-200 bg-emerald-50"
                        : isRejected
                          ? "border-red-200 bg-red-50 opacity-60"
                          : "border-cream-200"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-sm">{req.service}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {req.userName}
                        </p>
                      </div>
                      <span className="font-semibold text-sm text-maroon-800 flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />
                        {req.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {req.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {req.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {req.location}
                      </span>
                    </div>
                    {isAccepted ? (
                      <Badge className="bg-emerald-900/40 text-emerald-400 border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    ) : isRejected ? (
                      <Badge className="bg-red-900/40 text-red-400 border-0">
                        <XCircle className="w-3 h-3 mr-1" />
                        Declined
                      </Badge>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptRequest(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs h-8"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequest(req.id)}
                          className="border-red-800 text-red-400 hover:bg-red-900/30 rounded-lg text-xs h-8"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-cream-100 rounded-2xl shadow-card p-5">
            <h2 className="font-heading font-semibold text-lg mb-4">
              Upcoming Schedule
            </h2>
            <div className="space-y-3">
              {data.upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-cream-200"
                >
                  <div>
                    <div className="font-medium text-sm">{booking.service}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {booking.client} • {booking.location}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-maroon-200 text-maroon-800"
                  >
                    {booking.date}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
