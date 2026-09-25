"use client";

import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { loginHref } from "@/lib/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const { user, session, api } = useApp();
  const active = !!user?.favorites.includes(purohitId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${purohitName} from saved` : `Save ${purohitName}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          if (session) {
            toast.info("Saving purohits is available on family accounts");
            return;
          }
          toast.info("Sign in to save purohits", "We'll bring you right back here.");
          router.push(loginHref("user", pathname));
          return;
        }
        const res = api.toggleFavorite(purohitId);
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success(
          res.value ? "Saved to favourites" : "Removed from favourites",
          res.value ? `${purohitName} is now in your saved list.` : undefined
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
