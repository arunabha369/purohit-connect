"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/lib/booking-context";
import { purohits, services } from "@/lib/mock-data";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  accepted: { bg: "bg-blue-100", text: "text-blue-700", label: "Accepted" },
  "on-the-way": { bg: "bg-purple-100", text: "text-purple-700", label: "On the Way" },
  "in-progress": { bg: "bg-cyan-100", text: "text-cyan-700", label: "In Progress" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

export default function BookingsPage() {
  const { bookings } = useApp();

  const upcoming = bookings.filter(
    (b) => !["completed", "cancelled"].includes(b.status)
  );
  const past = bookings.filter((b) =>
    ["completed", "cancelled"].includes(b.status)
  );

  const BookingCard = ({ booking }: { booking: (typeof bookings)[0] }) => {
    const purohit = purohits.find((p) => p.id === booking.purohitId);
    const service = services.find((s) => s.id === booking.serviceId);
    const status = statusStyles[booking.status] || statusStyles.pending;

    return (
      <Link href={`/bookings/${booking.id}`}>
        <div className="bg-cream-100 rounded-2xl shadow-card hover:shadow-card-hover transition-all p-5 group">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-heading font-semibold text-base text-charcoal group-hover:text-maroon-800 transition-colors">
                {service?.name || "Puja Service"}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {purohit?.name || "Purohit"}
              </p>
            </div>
            <Badge className={cn("border-0", status.bg, status.text)}>
              {status.label}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {booking.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {booking.timeSlot}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {booking.city}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-cream-200">
            <span className="font-semibold text-sm flex items-center gap-0.5">
              <IndianRupee className="w-3 h-3" />
              {booking.totalAmount.toLocaleString("en-IN")}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-maroon-800 transition-colors">
              View Details
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="font-heading font-bold text-2xl text-charcoal mb-6">
          My Bookings
        </h1>

        <Tabs defaultValue="upcoming">
          <TabsList className="w-full bg-cream-100 rounded-xl p-1 h-auto">
            <TabsTrigger
              value="upcoming"
              className="flex-1 rounded-lg py-2.5 data-[state=active]:bg-cream-200 data-[state=active]:shadow-sm"
            >
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex-1 rounded-lg py-2.5 data-[state=active]:bg-cream-200 data-[state=active]:shadow-sm"
            >
              Past ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📅</p>
                <h3 className="font-heading font-semibold text-lg">
                  No upcoming bookings
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Browse purohits and book your next ceremony
                </p>
                <Link href="/search">
                  <button className="mt-4 px-6 py-2 bg-maroon-800 text-white rounded-xl text-sm font-medium">
                    Find Purohits
                  </button>
                </Link>
              </div>
            ) : (
              upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-3">
            {past.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🕐</p>
                <h3 className="font-heading font-semibold text-lg">
                  No past bookings
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Your completed bookings will appear here
                </p>
              </div>
            ) : (
              past.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
