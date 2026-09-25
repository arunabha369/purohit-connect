import Link from "next/link";
import { Clock, Languages, MapPin } from "lucide-react";
import type { PurohitView } from "@/lib/store";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { PurohitAvatar } from "./purohit-avatar";
import { RatingBadge } from "./rating";
import { FavoriteButton } from "./favorite-button";

export function PurohitCard({ purohit, className }: { purohit: PurohitView; className?: string }) {
  const extraSpecs = purohit.specializations.length - 2;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-gold-700/60 hover:shadow-elevated",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <PurohitAvatar name={purohit.name} size="lg" verified />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">
            <Link
              href={`/purohit/${purohit.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring"
            >
              {purohit.name}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <RatingBadge rating={purohit.rating} count={purohit.reviewCount} />
            <span aria-hidden className="text-subtle-foreground">·</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin aria-hidden className="size-3.5" />
              {purohit.city}
            </span>
          </div>
        </div>
        <FavoriteButton purohitId={purohit.id} purohitName={purohit.name} size="sm" />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock aria-hidden className="size-3.5 text-subtle-foreground" />
          <dt className="sr-only">Experience</dt>
          <dd>{purohit.experience} {purohit.experience === 1 ? "yr" : "yrs"} experience</dd>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <Languages aria-hidden className="size-3.5 shrink-0 text-subtle-foreground" />
          <dt className="sr-only">Languages</dt>
          <dd className="truncate">{purohit.languages.join(", ")}</dd>
        </div>
      </dl>

      <ul className="mt-4 mb-5 flex flex-wrap gap-1.5" aria-label="Specializations">
        {purohit.specializations.slice(0, 2).map((s) => (
          <li
            key={s}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground"
          >
            {s}
          </li>
        ))}
        {extraSpecs > 0 && (
          <li className="rounded-full border border-border px-2.5 py-1 text-xs text-subtle-foreground">
            +{extraSpecs} more
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <div className="text-xs text-muted-foreground">Starting from</div>
          <div className="font-heading text-lg font-semibold text-foreground">
            {formatINR(purohit.priceRange.min)}
          </div>
        </div>
        {purohit.available ? (
          <Link
            href={`/book/${purohit.id}`}
            className={cn(buttonVariants({ size: "sm" }), "relative z-10 px-4")}
          >
            Book now
          </Link>
        ) : (
          <span className="relative z-10 rounded-lg bg-surface px-3 py-2 text-xs font-medium text-muted-foreground">
            Currently unavailable
          </span>
        )}
      </div>
    </article>
  );
}
