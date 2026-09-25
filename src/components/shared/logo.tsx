import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative block size-9 shrink-0 overflow-hidden rounded-xl border border-gold-700/50 bg-black shadow-[0_0_0_1px_rgb(0_0_0/0.4)]",
        className
      )}
    >
      <Image src="/logo-mark.png" alt="" fill sizes="48px" className="object-cover" priority />
    </span>
  );
}

export function Logo({
  href = "/",
  className,
  showWordmark = true,
  suffix,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
  suffix?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="PurohitConnect home"
      className={cn("group flex items-center gap-2.5 rounded-xl", className)}
    >
      <LogoMark className="transition-transform duration-300 group-hover:scale-105" />
      {showWordmark && (
        <span className="font-heading text-[1.0625rem] font-semibold tracking-tight text-foreground">
          Purohit<span className="text-primary">Connect</span>
          {suffix && (
            <span className="ml-2 rounded-md border border-border-strong px-1.5 py-0.5 align-middle font-sans text-[0.6875rem] font-medium tracking-normal text-muted-foreground">
              {suffix}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
