"use client";

import { useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Recharts styling that follows the design tokens: recessive hairline grid, muted axis text. */
export const chartTheme = {
  series: "var(--chart-1)",
  grid: "var(--border)",
  axisTick: { fill: "var(--muted-foreground)", fontSize: 12 },
  cursorFill: "rgb(255 255 255 / 0.04)",
  surface: "var(--card)",
};

export function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
  seriesLabel,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string | number;
  formatValue: (v: number) => string;
  seriesLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value ?? 0);
  return (
    <div className="rounded-xl border border-border-strong bg-popover px-3 py-2 shadow-elevated">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center gap-2 text-sm">
        <span aria-hidden className="size-2 rounded-full" style={{ background: chartTheme.series }} />
        <span className="text-muted-foreground">{seriesLabel}</span>
        <span className="font-semibold text-foreground tabular-nums">{formatValue(value)}</span>
      </div>
    </div>
  );
}

/**
 * Card wrapper for a chart with a Chart / Table toggle, so every value is
 * reachable without hovering.
 */
export function ChartPanel<T extends Record<string, string | number>>({
  title,
  description,
  data,
  columns,
  children,
  className,
}: {
  title: string;
  description?: string;
  data: T[];
  columns: { key: keyof T; label: string; format?: (v: T[keyof T]) => string; numeric?: boolean }[];
  children: React.ReactNode;
  className?: string;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <section className={cn("flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6", className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div role="group" aria-label="View as" className="flex shrink-0 rounded-lg border border-border bg-surface/50 p-0.5">
          {(["chart", "table"] as const).map((v) => {
            const Icon = v === "chart" ? BarChart3 : Table2;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                aria-label={v === "chart" ? "Chart view" : "Table view"}
                onClick={() => setView(v)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md transition-colors",
                  view === v ? "bg-surface-strong text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
              </button>
            );
          })}
        </div>
      </div>
      {view === "chart" ? (
        <div className="h-64 flex-1 xl:h-auto xl:min-h-64">{children}</div>
      ) : (
        <div className="max-h-64 overflow-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr>
                {columns.map((c) => (
                  <th
                    key={String(c.key)}
                    scope="col"
                    className={cn("px-3 py-2 font-medium text-muted-foreground", c.numeric ? "text-right" : "text-left")}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td
                      key={String(c.key)}
                      className={cn("px-3 py-2 text-foreground", c.numeric && "text-right tabular-nums")}
                    >
                      {c.format ? c.format(row[c.key]) : String(row[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
