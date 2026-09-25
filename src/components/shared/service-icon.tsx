import {
  Baby,
  BookOpen,
  Compass,
  Droplets,
  Flame,
  Flower2,
  Heart,
  Home,
  Scissors,
  Star,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Home,
  Sun,
  Heart,
  Scissors,
  Baby,
  Flower2,
  Star,
  Compass,
  Flame,
  Droplets,
  BookOpen,
};

export function getServiceIcon(name: string | undefined): LucideIcon {
  return (name && iconMap[name]) || Flame;
}

export function ServiceIcon({
  name,
  size = "md",
  className,
}: {
  name: string | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = (name && iconMap[name]) || Flame;
  const box = { sm: "size-9 rounded-lg", md: "size-11 rounded-xl", lg: "size-14 rounded-2xl" }[size];
  const icon = { sm: "size-4", md: "size-5", lg: "size-6" }[size];
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-gold-900/80 to-gold-950 text-gold-300 ring-1 ring-gold-700/40 ring-inset",
        box,
        className
      )}
    >
      <Icon className={icon} />
    </span>
  );
}
