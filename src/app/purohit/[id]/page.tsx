"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
  Award,
  BadgeCheck,
  CalendarX2,
  Clock,
  Languages,
  MapPin,
  MessageSquareQuote,
  Package,
  Share2,
  ShieldCheck,
  Undo2,
  UserX,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import {
  getPurohit,
  getReviewsForPurohit,
  getServicesForPurohit,
} from "@/lib/mock-data";
import { availableSlotCount, upcomingDays } from "@/lib/availability";
import { formatDate, formatINR, formatNumber, toISODate } from "@/lib/format";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { BackLink } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { Panel, PanelHeader } from "@/components/shared/panel";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingStars } from "@/components/shared/rating";
import { ServiceIcon } from "@/components/shared/service-icon";
import { ToneBadge } from "@/components/shared/status-badge";

function AvailabilityStrip({ purohitId, enabled }: { purohitId: string; enabled: boolean }) {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }
  const days = upcomingDays(7);
  return (
    <ul className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {days.map((d) => {
        const iso = toISODate(d);
        const slots = enabled ? availableSlotCount(purohitId, iso) : 0;
        const open = slots > 0;
        return (
          <li
            key={iso}
            className={cn(
              "flex flex-col items-center rounded-xl border px-1 py-2.5 text-center",
              open ? "border-border bg-surface/60" : "border-dashed border-border opacity-50"
            )}
          >
            <span className="text-[0.6875rem] font-medium text-muted-foreground uppercase">
              {format(d, "EEE")}
            </span>
            <span className="mt-0.5 font-heading text-lg font-semibold text-foreground">{format(d, "d")}</span>
            <span className={cn("mt-0.5 text-[0.625rem] font-medium", open ? "text-success" : "text-subtle-foreground")}>
              {open ? (
                <>
                  {slots}
                  <span className="hidden sm:inline"> {slots === 1 ? "slot" : "slots"}</span>
                  <span className="sr-only sm:hidden"> {slots === 1 ? "slot" : "slots"} open</span>
                </>
              ) : (
                "Full"
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function PurohitProfilePage() {
  const { id } = useParams<{ id: string }>();
  const purohit = getPurohit(id);

  if (!purohit) {
    return (
      <AppShell>
        <div className="container-page py-16">
          <EmptyState
            icon={UserX}
            title="Purohit not found"
            description="This profile may have been removed or the link is incorrect."
            action={
              <Link href="/search" className={buttonVariants()}>
                Browse purohits
              </Link>
            }
          />
        </div>
      </AppShell>
    );
  }

  const offered = getServicesForPurohit(purohit);
  const purohitReviews = getReviewsForPurohit(purohit.id);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: purohit.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", "Share it with your family.");
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const stats = [
    { label: "Experience", value: `${purohit.experience} yrs` },
    { label: "Pujas performed", value: `${formatNumber(purohit.completedPujas)}+` },
    { label: "Rating", value: purohit.rating.toFixed(1) },
    { label: "Replies in", value: purohit.responseTime },
  ];

  const bookHref = `/book/${purohit.id}`;

  return (
    <AppShell bottomNav={false}>
      <div className="container-page pt-4 pb-32 sm:pt-6 lg:pb-12">
        <BackLink href="/search" label="All purohits" />

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="min-w-0 space-y-6">
            {/* Identity */}
            <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <div className="relative h-28 overflow-hidden bg-gradient-to-br from-gold-900 via-[#1c150c] to-card sm:h-36">
                <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-70" />
                <div aria-hidden className="absolute -top-20 right-10 size-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    type="button"
                    onClick={share}
                    aria-label="Share profile"
                    className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-background/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
                  >
                    <Share2 className="size-[1.125rem]" />
                  </button>
                  <FavoriteButton purohitId={purohit.id} purohitName={purohit.name} />
                </div>
              </div>

              <div className="relative px-5 pb-6 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <PurohitAvatar
                    name={purohit.name}
                    size="xl"
                    verified
                    className="-mt-12"
                    frameClassName="shadow-[0_0_0_4px_var(--card)]"
                  />
                  <div className="min-w-0 flex-1 sm:pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{purohit.name}</h1>
                      {purohit.available ? (
                        <ToneBadge tone="success" pulse>
                          Accepting bookings
                        </ToneBadge>
                      ) : (
                        <ToneBadge tone="neutral">Unavailable</ToneBadge>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <RatingStars value={purohit.rating} size="xs" />
                        <span className="font-semibold text-foreground">{purohit.rating}</span>
                        <span>({formatNumber(purohit.reviewCount)} reviews)</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {purohit.city}
                      </span>
                    </div>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-border bg-surface/50 px-4 py-3">
                      <dt className="text-xs text-muted-foreground">{s.label}</dt>
                      <dd className="mt-1 font-heading text-lg font-semibold text-foreground">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* About */}
            <Panel>
              <PanelHeader title="About" />
              <p className="text-[0.9375rem] leading-relaxed text-foreground/85">{purohit.bio}</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Languages className="size-4 text-primary" /> Languages
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {purohit.languages.map((l) => (
                      <li key={l} className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground/90">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Award className="size-4 text-primary" /> Qualifications
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {purohit.certificates.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-sm text-foreground/90">
                        <BadgeCheck className="size-4 shrink-0 text-success" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>

            {/* Services */}
            <Panel>
              <PanelHeader
                title="Ceremonies & pricing"
                description="All-inclusive prices. Samagri is brought by the purohit."
              />
              <ul className="divide-y divide-border">
                {offered.map((s) => (
                  <li key={s.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <ServiceIcon name={s.icon} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {s.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-heading font-semibold text-foreground">{formatINR(s.basePrice)}</div>
                      {purohit.available && (
                        <Link
                          href={`${bookHref}?service=${s.id}`}
                          className="text-sm font-medium text-primary hover:text-primary-hover"
                        >
                          Book
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Availability */}
            <Panel>
              <PanelHeader
                title="Availability"
                description="Open slots over the next 7 days."
                action={
                  purohit.available && (
                    <Link href={bookHref} className="text-sm font-medium text-primary hover:text-primary-hover">
                      Choose a slot
                    </Link>
                  )
                }
              />
              {purohit.available ? (
                <AvailabilityStrip purohitId={purohit.id} enabled />
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border-strong p-4 text-sm text-muted-foreground">
                  <CalendarX2 className="size-5 shrink-0" />
                  {purohit.name.split(" ")[0]}ji isn&apos;t taking new bookings right now. Save the
                  profile to find them again later.
                </div>
              )}
            </Panel>

            {/* Reviews */}
            <Panel>
              <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-end gap-2">
                  <span className="font-heading text-5xl leading-none font-semibold text-foreground">
                    {purohit.rating.toFixed(1)}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">/ 5</span>
                </div>
                <div>
                  <RatingStars value={purohit.rating} size="md" />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on {formatNumber(purohit.reviewCount)} verified reviews
                  </p>
                </div>
              </div>
              <h2 className="mb-4 text-base font-semibold text-foreground">Recent reviews</h2>
              {purohitReviews.length ? (
                <ul className="space-y-3">
                  {purohitReviews.map((review) => (
                    <li key={review.id} className="rounded-2xl border border-border bg-surface/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-full bg-surface-strong text-sm font-semibold text-foreground">
                            {review.userName[0]}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-foreground">{review.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {review.serviceName} · {formatDate(review.date)}
                            </div>
                          </div>
                        </div>
                        <RatingStars value={review.rating} size="xs" />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-foreground/85">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={MessageSquareQuote} title="No reviews yet" className="py-10" />
              )}
            </Panel>
          </div>

          {/* Booking sidebar (desktop) */}
          <aside className="hidden lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:block">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="text-sm text-muted-foreground">Ceremonies from</div>
              <div className="mt-1 font-heading text-3xl font-semibold text-foreground">
                {formatINR(purohit.priceRange.min)}
              </div>
              {purohit.available ? (
                <Link href={bookHref} className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}>
                  Book now
                </Link>
              ) : (
                <div className="mt-5 rounded-xl bg-surface p-3 text-center text-sm text-muted-foreground">
                  Not accepting bookings
                </div>
              )}
              <ul className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Package className="mt-0.5 size-4 shrink-0 text-primary" />
                  Complete samagri included
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Undo2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  Free cancellation until the purohit confirms
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  Verified identity & qualifications
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky booking bar (mobile/tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-safe backdrop-blur-xl lg:hidden">
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <div>
            <div className="text-xs text-muted-foreground">Ceremonies from</div>
            <div className="font-heading text-xl font-semibold text-foreground">
              {formatINR(purohit.priceRange.min)}
            </div>
          </div>
          {purohit.available ? (
            <Link href={bookHref} className={cn(buttonVariants({ size: "lg" }), "px-8")}>
              Book now
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Not accepting bookings</span>
          )}
        </div>
      </div>
    </AppShell>
  );
}
