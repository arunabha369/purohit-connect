"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  Check,
  CircleX,
  Clock,
  Copy,
  FileQuestion,
  Headphones,
  MapPin,
  Phone,
  RotateCcw,
  Star,
  StickyNote,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/lib/booking-context";
import { getPurohit, getService } from "@/lib/mock-data";
import { bookingLifecycle, bookingStatusMeta, isActiveBooking } from "@/lib/booking-status";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { BackLink } from "@/components/shared/page-header";
import { DetailRow, Panel, PanelHeader } from "@/components/shared/panel";
import { EmptyState } from "@/components/shared/empty-state";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge, RatingStars } from "@/components/shared/rating";
import { ServiceIcon } from "@/components/shared/service-icon";
import { StatusBadge } from "@/components/shared/status-badge";

function ProgressTracker({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Booking progress">
      {bookingLifecycle.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={stage.status} className="flex flex-col items-center gap-2 text-center" aria-current={active ? "step" : undefined}>
            <div className="relative flex w-full items-center justify-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn("absolute right-1/2 h-0.5 w-full", i <= current ? "bg-primary" : "bg-border-strong")}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-background text-primary ring-2 ring-primary",
                  !done && !active && "bg-surface-strong text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : active ? <span className="size-2 animate-pulse-soft rounded-full bg-primary" /> : i + 1}
              </span>
            </div>
            <span className={cn("text-[0.6875rem] leading-tight sm:text-xs", done || active ? "text-foreground" : "text-muted-foreground")}>
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ReviewPanel({ bookingId, purohitName }: { bookingId: string; purohitName: string }) {
  const { reviews, submitReview } = useApp();
  const existing = reviews[bookingId];
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  if (existing) {
    return (
      <Panel>
        <PanelHeader title="Your review" icon={Star} />
        <RatingStars value={existing.rating} size="md" />
        {existing.comment && <p className="mt-3 text-sm leading-relaxed text-foreground/85">{existing.comment}</p>}
        <p className="mt-3 text-xs text-muted-foreground">Thank you — your feedback helps other families.</p>
      </Panel>
    );
  }

  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  return (
    <Panel>
      <PanelHeader title="How was your ceremony?" description={`Rate your experience with ${purohitName}.`} icon={Star} />
      <div className="flex items-center gap-3">
        <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="rounded-md p-0.5 transition-transform active:scale-90"
            >
              <Star
                className={cn(
                  "size-8 transition-colors",
                  n <= (hover || rating) ? "fill-primary text-primary" : "text-border-strong"
                )}
              />
            </button>
          ))}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{labels[hover || rating]}</span>
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 500))}
        placeholder="What stood out? Punctuality, explanations, chanting…"
        aria-label="Review"
        className="mt-4"
      />
      <Button
        className="mt-4"
        disabled={!rating}
        onClick={() => {
          submitReview(bookingId, { rating, comment: comment.trim() });
          toast.success("Review submitted", "Thank you for sharing your experience.");
        }}
      >
        Submit review
      </Button>
    </Panel>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { bookings, cancelBooking } = useApp();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <AppShell>
        <div className="container-page py-16">
          <EmptyState
            icon={FileQuestion}
            title="Booking not found"
            description="We couldn't find a booking with this ID. It may belong to a different account."
            action={
              <Link href="/bookings" className={buttonVariants()}>
                View my bookings
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  const purohit = getPurohit(booking.purohitId);
  const service = getService(booking.serviceId);
  const meta = bookingStatusMeta[booking.status];
  const active = isActiveBooking(booking.status);
  const stageIndex = bookingLifecycle.findIndex((s) => s.status === booking.status);
  const serviceFee = service?.basePrice ?? booking.totalAmount;
  const platformFee = Math.max(0, booking.totalAmount - serviceFee);
  const paymentState =
    booking.status === "cancelled"
      ? { label: "Refund initiated", className: "text-warning" }
      : booking.paymentMethod === "Pay later"
        ? { label: "Due after ceremony", className: "text-muted-foreground" }
        : { label: "Paid", className: "text-success" };

  return (
    <AppShell>
      <div className="container-page max-w-5xl py-6 sm:py-10">
        <BackLink href="/bookings" label="My bookings" />

        {/* Header */}
        <Panel className="mt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <ServiceIcon name={service?.icon} size="lg" />
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{service?.name ?? "Puja"}</h1>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard?.writeText(booking.id).then(
                      () => toast.success("Booking ID copied"),
                      () => undefined
                    )
                  }
                  className="mt-1 inline-flex items-center gap-1.5 rounded-md font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Copy booking ID ${booking.id}`}
                >
                  {booking.id}
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="sm:text-right">
              <StatusBadge status={booking.status} />
              <p className="mt-1.5 text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            {booking.status === "cancelled" ? (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/8 p-4 text-sm">
                <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div>
                  <div className="font-medium text-foreground">This booking was cancelled</div>
                  <p className="mt-0.5 text-muted-foreground">
                    Any amount paid will be refunded to your original payment method within 3–5 working days.
                  </p>
                </div>
              </div>
            ) : (
              <ProgressTracker current={stageIndex} />
            )}
          </div>
        </Panel>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div className="min-w-0 space-y-6">
            <Panel>
              <PanelHeader title="Ceremony details" />
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Date</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{formatDate(booking.date, "long")}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Time</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{booking.timeSlot}</dd>
                  </div>
                </div>
                <div className="flex gap-3 sm:col-span-2">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Venue</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{booking.address}</dd>
                  </div>
                </div>
                {booking.notes && (
                  <div className="flex gap-3 sm:col-span-2">
                    <StickyNote className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Your notes</dt>
                      <dd className="mt-0.5 text-foreground/90">{booking.notes}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </Panel>

            {booking.status === "completed" && purohit && (
              <ReviewPanel bookingId={booking.id} purohitName={purohit.name} />
            )}

            <Panel>
              <PanelHeader title="Activity" />
              <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[0.4375rem] before:w-px before:bg-border-strong">
                {[...booking.timeline].reverse().map((item, i) => (
                  <li key={`${item.status}-${i}`} className="relative flex gap-4 pl-0">
                    <span
                      aria-hidden
                      className={cn(
                        "relative z-10 mt-1.5 size-[0.9375rem] shrink-0 rounded-full border-2",
                        i === 0 ? "border-primary bg-primary/30" : "border-border-strong bg-card"
                      )}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className={cn("font-medium", i === 0 ? "text-foreground" : "text-foreground/80")}>
                          {item.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>

          <div className="space-y-6">
            {purohit && (
              <Panel>
                <div className="flex items-center gap-3">
                  <PurohitAvatar name={purohit.name} size="lg" verified />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Your purohit</div>
                    <div className="truncate font-semibold text-foreground">{purohit.name}</div>
                    <RatingBadge rating={purohit.rating} className="text-xs" />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a href="tel:+918001234567" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                    <Phone /> Call
                  </a>
                  <Link href={`/purohit/${purohit.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Profile
                  </Link>
                </div>
                <p className="mt-3 text-xs text-subtle-foreground">
                  Calls are connected through a private number to protect both parties.
                </p>
              </Panel>
            )}

            <Panel>
              <PanelHeader title="Payment" />
              <dl className="space-y-2.5">
                <DetailRow label="Ceremony fee">{formatINR(serviceFee)}</DetailRow>
                <DetailRow label="Samagri kit">
                  <span className="text-success">Included</span>
                </DetailRow>
                {platformFee > 0 && <DetailRow label="Platform fee">{formatINR(platformFee)}</DetailRow>}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <dt className="font-medium text-foreground">Total</dt>
                  <dd className="font-heading text-lg font-semibold text-foreground">{formatINR(booking.totalAmount)}</dd>
                </div>
                <DetailRow label="Method">{booking.paymentMethod}</DetailRow>
                <DetailRow label="Status">
                  <span className={paymentState.className}>{paymentState.label}</span>
                </DetailRow>
              </dl>
            </Panel>

            <div className="space-y-2">
              {active ? (
                <Button variant="destructive" className="w-full" onClick={() => setConfirmCancel(true)}>
                  <CircleX /> Cancel booking
                </Button>
              ) : (
                purohit?.available && (
                  <Link
                    href={`/book/${booking.purohitId}?service=${booking.serviceId}`}
                    className={cn(buttonVariants(), "w-full")}
                  >
                    <RotateCcw /> Book again
                  </Link>
                )
              )}
              <a href="tel:+918001234567" className={cn(buttonVariants({ variant: "ghost" }), "w-full")}>
                <Headphones /> Get help with this booking
              </a>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this booking?"
        description={
          <>
            {service?.name} with {purohit?.name} on {formatDate(booking.date, "weekday")}. Any amount paid will
            be refunded within 3–5 working days.
          </>
        }
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        tone="destructive"
        icon={<CircleX className="size-5" />}
        onConfirm={() => {
          cancelBooking(booking.id);
          toast.success("Booking cancelled", "Your refund has been initiated.");
        }}
      />
    </AppShell>
  );
}
