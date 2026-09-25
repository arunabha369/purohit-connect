"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/booking-context";
import { toast } from "@/components/ui/toast";

export function FavoriteButton({
  purohitId,
  purohitName,
  className,
  size = "md",
}: {
  purohitId: string;
  purohitName: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { isFavorite, toggleFavorite } = useApp();
  const active = isFavorite(purohitId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${purohitName} from saved` : `Save ${purohitName}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const saved = toggleFavorite(purohitId);
        toast.success(
          saved ? "Saved to favourites" : "Removed from favourites",
          saved ? `${purohitName} is now in your saved list.` : undefined
        );
      }}
      className={cn(
        "relative z-10 flex shrink-0 items-center justify-center rounded-full border transition-all active:scale-90",
        size === "sm" ? "size-8" : "size-10",
        active
          ? "border-destructive/30 bg-destructive/12 text-destructive"
          : "border-border-strong bg-background/60 text-muted-foreground backdrop-blur hover:border-muted-foreground/40 hover:text-foreground",
        className
      )}
    >
      <Heart className={cn(size === "sm" ? "size-4" : "size-[1.125rem]", active && "fill-current")} />
    </button>
  );
}
