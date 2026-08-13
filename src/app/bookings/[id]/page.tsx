"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/lib/booking-context";
import { purohits, services } from "@/lib/mock-data";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  CalendarDays,
  Clock,
  MapPin,
  IndianRupee,
  Phone,
  CheckCircle2,
  Circle,
  Loader2,
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

export default function BookingDetailPage() {
  const { id } = useParams();
  const { bookings, cancelBooking } = useApp();
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <h2 className="font-heading font-semibold text-xl">
            Booking not found
          </h2>
          <Link
            href="/bookings"
            className="text-maroon-800 text-sm mt-2 block"
          >
            ← Back to Bookings
          </Link>
        </div>
      </AppShell>
    );
  }

  const purohit = purohits.find((p) => p.id === booking.purohitId);
  const service = services.find((s) => s.id === booking.serviceId);
  const status = statusStyles[booking.status] || statusStyles.pending;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-charcoal mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="bg-cream-100 rounded-2xl shadow-card p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-heading font-bold text-xl text-charcoal">
                {service?.name || "Puja Service"}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-mono">
                {booking.id}
              </p>
            </div>
            <Badge className={cn("border-0 text-sm", status.bg, status.text)}>
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-cream-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <CalendarDays className="w-3 h-3" />
                Date
              </div>
              <div className="font-medium text-sm">{booking.date}</div>
            </div>
            <div className="bg-cream-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Clock className="w-3 h-3" />
                Time
              </div>
              <div className="font-medium text-sm">{booking.timeSlot}</div>
            </div>
            <div className="bg-cream-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <MapPin className="w-3 h-3" />
                Location
              </div>
              <div className="font-medium text-sm">{booking.city}</div>
            </div>
            <div className="bg-cream-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <IndianRupee className="w-3 h-3" />
                Amount
              </div>
              <div className="font-semibold text-sm text-maroon-800">
                ₹{booking.totalAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Purohit Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-maroon-700 to-maroon-900 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {purohit?.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="font-medium text-sm">{purohit?.name}</div>
                <div className="text-xs text-gray-400">{purohit?.city}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-cream-300"
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
          </div>

          {booking.address && (
            <>
              <Separator className="my-4" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Full Address</div>
                <div className="text-sm">{booking.address}</div>
              </div>
            </>
          )}

          {booking.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <div className="text-sm">{booking.notes}</div>
              </div>
            </>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-cream-100 rounded-2xl shadow-card p-5 mb-4">
          <h2 className="font-heading font-semibold text-lg mb-4">
            Booking Status
          </h2>
          <div className="space-y-0">
            {booking.timeline.map((item, i) => {
              const isLast = i === booking.timeline.length - 1;
              const isCompleted = !isLast || booking.status === "completed";
              return (
                <div key={i} className="flex gap-4">
                  {/* Line + Dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        isCompleted
                          ? "bg-emerald-100"
                          : isLast
                            ? "bg-maroon-100"
                            : "bg-cream-200"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isLast ? (
                        <Loader2 className="w-4 h-4 text-maroon-800 animate-spin" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    {i < booking.timeline.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 h-12",
                          isCompleted ? "bg-emerald-200" : "bg-cream-200"
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8">
                    <div className="font-medium text-sm">{item.status}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {!["completed", "cancelled"].includes(booking.status) && (
          <Button
            variant="outline"
            onClick={() => cancelBooking(booking.id)}
            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-900/30 hover:text-red-400"
          >
            Cancel Booking
          </Button>
        )}
      </div>
    </AppShell>
  );
}
