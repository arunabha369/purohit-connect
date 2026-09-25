import type { BookingStatus } from "./store/types";

export type { BookingStatus };

export type StatusTone = "warning" | "info" | "violet" | "primary" | "success" | "danger" | "neutral";

export const bookingStatusMeta: Record<
  BookingStatus,
  { label: string; tone: StatusTone; description: string }
> = {
  pending: {
    label: "Pending",
    tone: "warning",
    description: "Waiting for the purohit to confirm",
  },
  accepted: {
    label: "Confirmed",
    tone: "info",
    description: "Your purohit has confirmed the booking",
  },
  "on-the-way": {
    label: "On the way",
    tone: "violet",
    description: "Panditji is travelling to your venue",
  },
  "in-progress": {
    label: "In progress",
    tone: "primary",
    description: "The ceremony is under way",
  },
  completed: {
    label: "Completed",
    tone: "success",
    description: "Ceremony completed successfully",
  },
  cancelled: {
    label: "Cancelled",
    tone: "danger",
    description: "This booking was cancelled",
  },
};

/** Ordered lifecycle used by the progress tracker. */
export const bookingLifecycle: { status: BookingStatus; label: string }[] = [
  { status: "pending", label: "Placed" },
  { status: "accepted", label: "Confirmed" },
  { status: "on-the-way", label: "On the way" },
  { status: "in-progress", label: "In progress" },
  { status: "completed", label: "Completed" },
];

export function isActiveBooking(status: BookingStatus) {
  return status !== "completed" && status !== "cancelled";
}

export const toneClasses: Record<StatusTone, string> = {
  warning: "bg-warning/12 text-warning ring-warning/25",
  info: "bg-info/12 text-info ring-info/25",
  violet: "bg-violet/12 text-violet ring-violet/25",
  primary: "bg-primary/12 text-primary ring-primary/25",
  success: "bg-success/12 text-success ring-success/25",
  danger: "bg-destructive/12 text-destructive ring-destructive/25",
  neutral: "bg-surface text-muted-foreground ring-border",
};

export const toneDotClasses: Record<StatusTone, string> = {
  warning: "bg-warning",
  info: "bg-info",
  violet: "bg-violet",
  primary: "bg-primary",
  success: "bg-success",
  danger: "bg-destructive",
  neutral: "bg-muted-foreground",
};
