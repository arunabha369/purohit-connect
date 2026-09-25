import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const iconSize = { xs: "size-3", sm: "size-3.5", md: "size-5" }[size];
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            iconSize,
            i < Math.round(value) ? "fill-primary text-primary" : "fill-transparent text-border-strong"
          )}
        />
      ))}
    </span>
  );
}

export function RatingBadge({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  if (count === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary",
          className
        )}
      >
        New
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star aria-hidden className="size-3.5 fill-primary text-primary" />
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-muted-foreground">
          ({count.toLocaleString("en-IN")}
          <span className="sr-only"> reviews</span>)
        </span>
      )}
    </span>
  );
}
