"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, FileQuestion, Printer } from "lucide-react";
import { getService } from "@/lib/catalog";
import { useApp, usePurohit } from "@/lib/store";
import { bookingStatusMeta } from "@/lib/booking-status";
import { formatDate, formatINR } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import { RequireRole } from "@/components/auth/require-role";
import { EmptyState } from "@/components/shared/empty-state";

function Row({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-6 py-2 text-sm ${strong ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Receipt() {
  const { id } = useParams<{ id: string }>();
  const { db, user } = useApp();
  const booking = db.bookings.find((b) => b.id === id && b.userId === user?.id);
  const purohit = usePurohit(booking?.purohitId);

  if (!booking || !user) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={FileQuestion}
          title="Receipt not found"
          action={
            <Link href="/bookings" className={buttonVariants()}>
              View my bookings
            </Link>
          }
        />
      </div>
    );
  }

  const service = getService(booking.serviceId);
  const { pricing } = booking;
  const refunded = booking.paymentStatus === "refunded";
  const paymentLabel = refunded ? "Refunded" : booking.paymentStatus === "due" ? (booking.status === "cancelled" ? "Not charged" : "Due after ceremony") : "Paid";

  return (
    <div className="container-page max-w-3xl py-6 sm:py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link href={`/bookings/${booking.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft /> Back to booking
        </Link>
        <Button size="sm" onClick={() => window.print()}>
          <Printer /> Print or save as PDF
        </Button>
      </div>

      <article className="relative overflow-hidden rounded-2xl bg-white p-6 text-neutral-900 shadow-elevated sm:p-10 print:rounded-none print:shadow-none">
        {booking.status === "cancelled" && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 right-6 rotate-12 rounded-lg border-4 border-red-600/70 px-4 py-1 text-2xl font-black tracking-widest text-red-600/70 uppercase sm:right-10"
          >
            Cancelled
          </div>
        )}
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-200 pb-6">
          <div>
            <div className="font-heading text-xl font-semibold">
              Purohit<span className="text-amber-700">Connect</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">namaste@purohitconnect.in · 1800-123-4567</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-semibold">Receipt</h1>
            <p className="mt-1 font-mono text-sm text-neutral-600">{booking.id}</p>
            <p className="text-xs text-neutral-500">Issued {format(parseISO(booking.createdAt), "d MMM yyyy")}</p>
          </div>
        </header>

        <section className="grid gap-6 border-b border-neutral-200 py-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">Billed to</h2>
            <p className="mt-2 font-medium">{user.name}</p>
            <p className="text-sm text-neutral-600">+91 {user.phone.slice(0, 5)} {user.phone.slice(5)}</p>
            {user.email && <p className="text-sm text-neutral-600">{user.email}</p>}
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">Ceremony</h2>
            <p className="mt-2 font-medium">{service?.name}</p>
            <p className="text-sm text-neutral-600">with {purohit?.name ?? "your purohit"}</p>
            <p className="text-sm text-neutral-600">
              {formatDate(booking.date, "long")}, {booking.timeSlot}
            </p>
            <p className="text-sm text-neutral-600">{booking.address}</p>
          </div>
        </section>

        <section className="py-4">
          <Row label={`${service?.name ?? "Ceremony"} — ceremony fee`} value={formatINR(pricing.base)} />
          <Row label="Samagri kit" value="Included" />
          <Row label="Platform fee" value={formatINR(pricing.platformFee)} />
          {pricing.discount > 0 && <Row label={`Coupon ${pricing.coupon ?? ""}`} value={`−${formatINR(pricing.discount)}`} />}
          <div className="mt-2 border-t border-neutral-200 pt-2">
            <Row label="Total" value={formatINR(pricing.total)} strong />
          </div>
        </section>

        <section className="grid gap-4 rounded-xl bg-neutral-100 p-4 text-sm sm:grid-cols-3">
          <div>
            <div className="text-xs text-neutral-500">Payment method</div>
            <div className="mt-0.5 font-medium">{booking.paymentMethod}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Payment status</div>
            <div className="mt-0.5 font-medium">{paymentLabel}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Booking status</div>
            <div className="mt-0.5 font-medium">{bookingStatusMeta[booking.status].label}</div>
          </div>
        </section>

        <p className="mt-6 text-xs text-neutral-500">
          This is a computer-generated receipt and does not require a signature. Questions? Quote {booking.id} when you
          contact us.
        </p>
      </article>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <RequireRole role="user">
      <Receipt />
    </RequireRole>
  );
}
