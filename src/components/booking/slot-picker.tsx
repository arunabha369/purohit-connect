"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { CalendarDays, Moon, Sun, Sunrise } from "lucide-react";
import { timeSlots, type DayPeriod } from "@/lib/catalog";
import { toISODate } from "@/lib/format";
import { slotState, upcomingDays, type AvailabilityContext } from "@/lib/store/availability";
import { cn } from "@/lib/utils";

const periodIcons: Record<DayPeriod, React.ComponentType<{ className?: string }>> = {
  Morning: Sunrise,
  Afternoon: Sun,
  Evening: Moon,
};

function dayLabel(d: Date) {
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE");
}

export function DateStrip({
  purohitId,
  value,
  onChange,
  availability,
  days = 14,
  className,
}: {
  purohitId: string;
  value: string;
  onChange: (date: string) => void;
  availability: AvailabilityContext;
  days?: number;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Date" className={cn("no-scrollbar flex gap-2 overflow-x-auto pb-1", className)}>
      {upcomingDays(days, availability.now).map((d) => {
        const iso = toISODate(d);
        const blocked = availability.blockedDates.includes(iso);
        const open = timeSlots.some((s) => slotState(purohitId, iso, s.label, availability) === "open");
        const selected = value === iso;
        return (
          <button
            key={iso}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${format(d, "EEEE, d MMMM")}${open ? "" : blocked ? ", unavailable" : ", fully booked"}`}
            disabled={!open}
            onClick={() => onChange(iso)}
            className={cn(
              "flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border transition-colors disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-40",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface/40 text-foreground hover:border-border-strong"
            )}
          >
            <span className={cn("text-[0.6875rem] font-medium", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {dayLabel(d)}
            </span>
            <span className="font-heading text-xl font-semibold">{format(d, "d")}</span>
            <span className={cn("text-[0.6875rem]", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {blocked ? "Off" : format(d, "MMM")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SlotGrid({
  purohitId,
  date,
  value,
  onChange,
  availability,
}: {
  purohitId: string;
  date: string;
  value: string;
  onChange: (slot: string) => void;
  availability: AvailabilityContext;
}) {
  if (!date) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-dashed border-border-strong p-4 text-sm text-muted-foreground">
        <CalendarDays className="size-4" /> Select a date to see available time slots.
      </p>
    );
  }
  return (
    <div className="space-y-5">
      {(["Morning", "Afternoon", "Evening"] as DayPeriod[]).map((period) => {
        const Icon = periodIcons[period];
        return (
          <div key={period}>
            <div className="mb-2.5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="size-4 text-primary" />
              {period}
            </div>
            <div role="radiogroup" aria-label={`${period} slots`} className="grid grid-cols-2 gap-2">
              {timeSlots
                .filter((s) => s.period === period)
                .map((s) => {
                  const available = slotState(purohitId, date, s.label, availability) === "open";
                  const selected = value === s.label;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={!available}
                      onClick={() => onChange(s.label)}
                      className={cn(
                        "flex h-12 items-center justify-center rounded-xl border px-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:text-subtle-foreground disabled:line-through disabled:opacity-60 sm:text-sm",
                        selected
                          ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_1px_var(--primary)]"
                          : "border-border bg-surface/40 text-foreground hover:border-border-strong"
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
