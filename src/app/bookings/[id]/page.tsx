"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Check,
  CircleX,
  Clock,
  Copy,
  FileQuestion,
  Headphones,
  MapPin,
  Phone,
  ReceiptText,
  RotateCcw,
  Star,
  StickyNote,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { getService } from "@/lib/catalog";
import { useApp, usePurohit, type Booking } from "@/lib/store";
import { canFamilyModify } from "@/lib/store/actions";
import { bookingLifecycle, bookingStatusMeta, isActiveBooking } from "@/lib/booking-status";
import { buildIcs, downloadFile } from "@/lib/calendar";
import { formatDate, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { RequireRole } from "@/components/auth/require-role";
import { DateStrip, SlotGrid } from "@/components/booking/slot-picker";
import { BackLink } from "@/components/shared/page-header";
import { DetailRow, Panel, PanelHeader } from "@/components/shared/panel";
import { EmptyState } from "@/components/shared/empty-state";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge, RatingStars } from "@/components/shared/rating";
import { ServiceIcon } from "@/components/shared/service-icon";
import { StatusBadge } from "@/components/shared/status-badge";

const SUPPORT_PHONE = "tel:+918001234567";

const cancelReasons = [
  "My plans changed",
  "I booked another purohit",
  "The date or time no longer works",
  "The price is too high",
  "Other",
];

function formatEventTime(iso: string) {
  return format(parseISO(iso), "d MMM, h:mm a");
}

function refundText(booking: Booking) {
  if (booking.paymentStatus !== "paid") return "Nothing was charged, so there's nothing to refund.";
  if (booking.paymentMethod === "Wallet") return `${formatINR(booking.pricing.total)} will be returned to your wallet immediately.`;
  return `${formatINR(booking.pricing.total)} will be refunded to your ${booking.paymentMethod === "UPI" ? "UPI account" : "card"} within 3–5 working days.`;
}

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
                <span aria-hidden className={cn("absolute right-1/2 h-0.5 w-full", i <= current ? "bg-primary" : "bg-border-strong")} />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-background text-primary ring-2 ring-primary",
                  !done && !active && "bg-surface-strong text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : active ? (
                  <span className="size-2 animate-pulse-soft rounded-full bg-primary" />
                ) : (
                  i + 1
                )}
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

function CancelDialog({ booking, open, onOpenChange }: { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { api } = useApp();
  const [reason, setReason] = useState(cancelReasons[0]);
  const [other, setOther] = useState("");

  const submit = () => {
    const res = api.cancelBooking({ bookingId: booking.id, reason: reason === "Other" ? other : reason });
    if (!res.ok) {
      toast.error("Couldn't cancel", res.error);
      return;
    }
    onOpenChange(false);
    toast.success("Booking cancelled", refundText(booking));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setReason(cancelReasons[0]);
          setOther("");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>{refundText(booking)}</DialogDescription>
        </DialogHeader>
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-foreground">Why are you cancelling?</legend>
          <div role="radiogroup" className="space-y-2">
            {cancelReasons.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                onClick={() => setReason(r)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors",
                  reason === r ? "border-primary bg-primary/8 text-foreground" : "border-border text-foreground/90 hover:bg-surface"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                    reason === r ? "border-primary" : "border-border-strong"
                  )}
                >
                  {reason === r && <span className="size-2 rounded-full bg-primary" />}
                </span>
                {r}
              </button>
            ))}
          </div>
          {reason === "Other" && (
            <Textarea
              autoFocus
              value={other}
              onChange={(e) => setOther(e.target.value.slice(0, 200))}
              placeholder="Tell us a little more (optional)"
              aria-label="Other reason"
              className="mt-3 min-h-20"
            />
          )}
        </fieldset>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep booking
          </Button>
          <Button variant="destructive" onClick={submit}>
            Cancel booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleDialog({ booking, open, onOpenChange }: { booking: Booking; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { db, api } = useApp();
  const purohit = usePurohit(booking.purohitId);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const availability = {
    bookings: db.bookings,
    blockedDates: purohit?.blockedDates ?? [],
    now: new Date(),
    excludeBookingId: booking.id,
  };

  const submit = () => {
    const res = api.rescheduleBooking({ bookingId: booking.id, date, timeSlot: slot });
    if (!res.ok) {
      toast.error("Couldn't reschedule", res.error);
      return;
    }
    onOpenChange(false);
    toast.success("Booking rescheduled", `${formatDate(date, "weekday")}, ${slot}. We've asked Panditji to confirm.`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setDate("");
          setSlot("");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reschedule</DialogTitle>
          <DialogDescription>
            Currently {formatDate(booking.date, "weekday")}, {booking.timeSlot}.
            {booking.status === "accepted" && " Panditji will need to confirm the new time."}
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-5">
          <DateStrip
            purohitId={booking.purohitId}
            value={date}
            availability={availability}
            onChange={(d) => {
              setDate(d);
              setSlot("");
            }}
          />
          <SlotGrid purohitId={booking.purohitId} date={date} value={slot} onChange={setSlot} availability={availability} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep current time
          </Button>
          <Button onClick={submit} disabled={!date || !slot}>
            Confirm new time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewPanel({ booking, purohitName }: { booking: Booking; purohitName: string }) {
  const { db, api } = useApp();
  const existing = db.reviews.find((r) => r.id === booking.reviewId);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  if (existing) {
    return (
      <Panel>
        <PanelHeader title="Your review" icon={Star} />
        <RatingStars value={existing.rating} size="md" />
        {existing.comment && <p className="mt-3 text-sm leading-relaxed text-foreground/85">{existing.comment}</p>}
        <p className="mt-3 text-xs text-muted-foreground">Thank you — your review is live on {purohitName}&apos;s profile.</p>
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
              <Star className={cn("size-8 transition-colors", n <= (hover || rating) ? "fill-primary text-primary" : "text-border-strong")} />
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
          const res = api.submitReview({ bookingId: booking.id, rating, comment });
          if (!res.ok) {
            toast.error("Couldn't submit review", res.error);
            return;
          }
          toast.success("Review published", "Thank you for helping other families choose.");
        }}
      >
        Submit review
      </Button>
    </Panel>
  );
}

function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { db, user } = useApp();
  const booking = db.bookings.find((b) => b.id === id && b.userId === user?.id);
  const purohit = usePurohit(booking?.purohitId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  if (!booking) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={FileQuestion}
          title="Booking not found"
          description="We couldn't find this booking on your account."
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
  const meta = bookingStatusMeta[booking.status];
  const active = isActiveBooking(booking.status);
  const modifiable = canFamilyModify(booking);
  const stageIndex = bookingLifecycle.findIndex((s) => s.status === booking.status);
  const { pricing } = booking;
  const paymentState =
    booking.paymentStatus === "refunded"
      ? { label: "Refunded", className: "text-warning" }
      : booking.paymentStatus === "due"
        ? { label: booking.status === "cancelled" ? "Not charged" : "Due after ceremony", className: "text-muted-foreground" }
        : { label: "Paid", className: "text-success" };
  const cancelledBy =
    booking.cancellation?.by === "purohit" ? "by the purohit" : booking.cancellation?.by === "admin" ? "by PurohitConnect support" : "by you";

  const addToCalendar = () =>
    downloadFile(
      `${booking.id}.ics`,
      buildIcs({
        uid: booking.id,
        title: `${service?.name ?? "Puja"} with ${purohit?.name ?? "Panditji"}`,
        description: `Booking ${booking.id}. ${booking.notes}`,
        location: booking.address,
        date: booking.date,
        timeSlot: booking.timeSlot,
      }),
      "text/calendar"
    );

  return (
    <div className="container-page max-w-5xl py-6 sm:py-10">
      <BackLink href="/bookings" label="My bookings" />

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
                <div className="font-medium text-foreground">Cancelled {cancelledBy}</div>
                {booking.cancellation?.reason && <p className="mt-0.5 text-muted-foreground">Reason: {booking.cancellation.reason}</p>}
                <p className="mt-0.5 text-muted-foreground">
                  {booking.paymentStatus === "refunded"
                    ? booking.paymentMethod === "Wallet"
                      ? `${formatINR(pricing.total)} was returned to your wallet.`
                      : `${formatINR(pricing.total)} is being refunded to your ${booking.paymentMethod === "UPI" ? "UPI account" : "card"} (3–5 working days).`
                    : "You were not charged."}
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
            <ul className="grid gap-4 sm:grid-cols-2">
              <li className="flex gap-3">
                <CalendarDays aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="mt-0.5 font-medium text-foreground">{formatDate(booking.date, "long")}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="mt-0.5 font-medium text-foreground">{booking.timeSlot}</p>
                </div>
              </li>
              <li className="flex gap-3 sm:col-span-2">
                <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Venue</p>
                  <p className="mt-0.5 font-medium text-foreground">{booking.address}</p>
                </div>
              </li>
              {booking.notes && (
                <li className="flex gap-3 sm:col-span-2">
                  <StickyNote aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Your notes</p>
                    <p className="mt-0.5 text-foreground/90">{booking.notes}</p>
                  </div>
                </li>
              )}
            </ul>
            {modifiable && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
                <Button variant="secondary" size="sm" onClick={() => setRescheduleOpen(true)}>
                  <CalendarClock /> Reschedule
                </Button>
                <Button variant="ghost" size="sm" onClick={addToCalendar}>
                  <CalendarPlus /> Add to calendar
                </Button>
              </div>
            )}
          </Panel>

          {booking.status === "completed" && purohit && <ReviewPanel booking={booking} purohitName={purohit.name} />}

          <Panel>
            <PanelHeader title="Activity" />
            <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[0.4375rem] before:w-px before:bg-border-strong">
              {[...booking.timeline].reverse().map((item, i) => (
                <li key={`${item.at}-${i}`} className="relative flex gap-4">
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 mt-1.5 size-[0.9375rem] shrink-0 rounded-full border-2",
                      i === 0 ? "border-primary bg-primary/30" : "border-border-strong bg-card"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className={cn("font-medium", i === 0 ? "text-foreground" : "text-foreground/80")}>{item.status}</span>
                      <time dateTime={item.at} className="text-xs text-muted-foreground">
                        {formatEventTime(item.at)}
                      </time>
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
                  <RatingBadge rating={purohit.rating} count={purohit.reviewCount} className="text-xs" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a
                  href={SUPPORT_PHONE}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                  aria-disabled={!active}
                  tabIndex={active ? undefined : -1}
                >
                  <Phone /> Call
                </a>
                <Link href={`/purohit/${purohit.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Profile
                </Link>
              </div>
              <p className="mt-3 text-xs text-subtle-foreground">
                {active
                  ? "Calls are connected through a private number to protect both parties."
                  : "Calling is available for upcoming ceremonies."}
              </p>
            </Panel>
          )}

          <Panel>
            <PanelHeader title="Payment" />
            <dl className="space-y-2.5">
              <DetailRow label="Ceremony fee">{formatINR(pricing.base)}</DetailRow>
              <DetailRow label="Samagri kit">
                <span className="text-success">Included</span>
              </DetailRow>
              <DetailRow label="Platform fee">{formatINR(pricing.platformFee)}</DetailRow>
              {pricing.discount > 0 && (
                <DetailRow label={`Coupon ${pricing.coupon ?? ""}`}>
                  <span className="text-success">−{formatINR(pricing.discount)}</span>
                </DetailRow>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <dt className="font-medium text-foreground">Total</dt>
                <dd className="font-heading text-lg font-semibold text-foreground">{formatINR(pricing.total)}</dd>
              </div>
              <DetailRow label="Method">{booking.paymentMethod}</DetailRow>
              <DetailRow label="Status">
                <span className={paymentState.className}>{paymentState.label}</span>
              </DetailRow>
            </dl>
            <Link
              href={`/bookings/${booking.id}/receipt`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-4 w-full")}
            >
              <ReceiptText /> View receipt
            </Link>
          </Panel>

          <div className="space-y-2">
            {modifiable ? (
              <Button variant="destructive" className="w-full" onClick={() => setCancelOpen(true)}>
                <CircleX /> Cancel booking
              </Button>
            ) : (
              !active &&
              purohit?.bookable && (
                <Link href={`/book/${booking.purohitId}?service=${booking.serviceId}`} className={cn(buttonVariants(), "w-full")}>
                  <RotateCcw /> Book again
                </Link>
              )
            )}
            <a href={SUPPORT_PHONE} className={cn(buttonVariants({ variant: "ghost" }), "w-full")}>
              <Headphones /> Get help with this booking
            </a>
          </div>
        </div>
      </div>

      <CancelDialog booking={booking} open={cancelOpen} onOpenChange={setCancelOpen} />
      <RescheduleDialog booking={booking} open={rescheduleOpen} onOpenChange={setRescheduleOpen} />
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <AppShell>
      <RequireRole role="user">
        <BookingDetail />
      </RequireRole>
    </AppShell>
  );
}
