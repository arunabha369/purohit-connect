import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * KPI tile: label · value · optional delta vs a named period.
 * Delta colour encodes direction × whether "up" is good, and always ships
 * with an arrow icon so it never relies on colour alone.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  delta?: { value: number; period: string; upIsGood?: boolean };
  hint?: string;
  className?: string;
}) {
  const positive = delta ? delta.value >= 0 : false;
  const good = delta ? (delta.upIsGood ?? true) === positive : false;
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <span className="hidden size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground sm:flex">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-3 font-heading text-2xl font-semibold text-foreground sm:text-[1.75rem]">{value}</div>
      {delta ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 font-medium", good ? "text-success" : "text-destructive")}>
            {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {positive ? "+" : ""}
            {delta.value}%
          </span>
          <span className="text-muted-foreground">vs {delta.period}</span>
        </div>
      ) : (
        hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}
