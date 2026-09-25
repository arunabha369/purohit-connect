import { cn } from "@/lib/utils";
import {
  BookingStatus,
  StatusTone,
  bookingStatusMeta,
  toneClasses,
  toneDotClasses,
} from "@/lib/booking-status";

export function ToneBadge({
  tone,
  children,
  dot = true,
  pulse = false,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", toneDotClasses[tone], pulse && "animate-pulse-soft")}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const meta = bookingStatusMeta[status];
  const live = status === "on-the-way" || status === "in-progress";
  return (
    <ToneBadge tone={meta.tone} pulse={live} className={className}>
      {meta.label}
    </ToneBadge>
  );
}
