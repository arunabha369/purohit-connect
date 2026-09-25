import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials, hashString } from "@/lib/format";

// Tonal variations within the brand palette — no rainbow avatars.
const tones = [
  "from-[#3a2b17] to-[#1f170c] text-gold-300",
  "from-[#2b2440] to-[#15121f] text-[#c9b8ff]",
  "from-[#1d3330] to-[#0f1a18] text-[#8fe0c4]",
  "from-[#3b2024] to-[#1d0f12] text-[#f2a7a7]",
  "from-[#1f2b40] to-[#0f1520] text-[#a8c8f5]",
  "from-[#3a3017] to-[#1c170b] text-[#f0d58c]",
];

const sizes = {
  sm: "size-9 rounded-lg text-xs",
  md: "size-12 rounded-xl text-sm",
  lg: "size-14 rounded-2xl text-base",
  xl: "size-24 rounded-3xl text-2xl",
};

export function PurohitAvatar({
  name,
  size = "md",
  verified = false,
  className,
  frameClassName,
}: {
  name: string;
  size?: keyof typeof sizes;
  verified?: boolean;
  className?: string;
  /** Classes for the tile itself (e.g. a ring), as opposed to the positioning wrapper. */
  frameClassName?: string;
}) {
  const tone = tones[hashString(name) % tones.length];
  return (
    <span className={cn("relative inline-flex h-fit w-fit shrink-0 self-start", className)}>
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center bg-gradient-to-br font-heading font-semibold tracking-wide ring-1 ring-white/10 ring-inset",
          sizes[size],
          tone,
          frameClassName
        )}
      >
        {getInitials(name)}
      </span>
      {verified && (
        <span
          title="Verified purohit"
          className={cn(
            "absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-background",
            size === "xl" ? "p-1" : "p-0.5"
          )}
        >
          <BadgeCheck className={cn("fill-primary text-background", size === "xl" ? "size-6" : "size-4")} />
          <span className="sr-only">Verified</span>
        </span>
      )}
    </span>
  );
}
