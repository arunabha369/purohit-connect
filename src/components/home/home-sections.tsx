import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Headphones,
  IndianRupee,
  Package,
  Quote,
  Search,
  Sparkles,
} from "lucide-react";
import { getPurohit, reviews } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow, SectionHeader } from "@/components/shared/section-header";
import { RatingStars } from "@/components/shared/rating";
import { ServiceIcon } from "@/components/shared/service-icon";

const steps = [
  {
    icon: Search,
    title: "Choose your ceremony",
    body: "Browse verified purohits by puja, city, language and budget. Compare reviews and pricing upfront.",
  },
  {
    icon: CalendarClock,
    title: "Pick a muhurat & venue",
    body: "Select a date and time slot that suits your family, and tell us where the ceremony will be held.",
  },
  {
    icon: Sparkles,
    title: "Panditji arrives prepared",
    body: "Your purohit arrives on time with complete samagri. Track every step live from your phone.",
  },
];

export function HowItWorks() {
  return (
    <section className="container-page py-14 sm:py-20" aria-labelledby="how-heading">
      <SectionHeader
        id="how-heading"
        eyebrow="How it works"
        title="Book a puja in three simple steps"
      />
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
          >
            <span
              aria-hidden
              className="absolute -top-4 -right-1 font-heading text-[6rem] leading-none font-bold text-foreground/[0.04]"
            >
              {i + 1}
            </span>
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <step.icon className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const offers = [
  {
    category: "griha-pravesh",
    icon: "Home",
    kicker: "New home?",
    title: "Complete Griha Pravesh",
    body: "Ganesh Puja, Vastu Shanti and Havan — performed together in a single booking.",
    cta: "Find Griha Pravesh purohits",
  },
  {
    category: "wedding",
    icon: "Heart",
    kicker: "Wedding season",
    title: "Vivah Sanskar specialists",
    body: "Experienced purohits for every ritual from Ganesh Puja to Saptapadi. Book early.",
    cta: "Explore wedding purohits",
  },
  {
    category: "satyanarayan",
    icon: "Sun",
    kicker: "Most booked",
    title: "Satyanarayan Puja from ₹3,100",
    body: "Katha, aarti and prasad guidance included. Perfect for any auspicious beginning.",
    cta: "Book Satyanarayan Puja",
  },
];

export function Offers() {
  return (
    <section className="container-page py-6" aria-label="Featured ceremonies">
      <ul className="grid gap-4 md:grid-cols-3">
        {offers.map((o, i) => (
          <li key={o.category}>
            <Link
              href={`/search?category=${o.category}`}
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5",
                i === 0
                  ? "border-gold-700/60 bg-gradient-to-br from-gold-900/70 via-card to-card"
                  : "border-border bg-card hover:border-gold-700/60"
              )}
            >
              <div
                aria-hidden
                className="absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl"
              />
              <ServiceIcon name={o.icon} size="lg" />
              <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{o.kicker}</p>
              <h3 className="mt-1.5 text-xl font-semibold text-foreground">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.body}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-primary">
                {o.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const guarantees = [
  {
    icon: BadgeCheck,
    title: "Verified purohits",
    body: "Credentials, lineage and references checked before anyone joins.",
  },
  {
    icon: IndianRupee,
    title: "Transparent pricing",
    body: "Know the full cost upfront. No haggling, no surprise dakshina demands.",
  },
  {
    icon: Package,
    title: "Samagri included",
    body: "Every item the ritual needs, sourced and brought by your purohit.",
  },
  {
    icon: Headphones,
    title: "Support, every day",
    body: "Our team is a call away from 6 AM to 10 PM if anything goes wrong.",
  },
];

export function WhyUs() {
  return (
    <section className="border-y border-border bg-card/40 py-14 sm:py-20" aria-labelledby="why-heading">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>Why PurohitConnect</Eyebrow>
          <h2 id="why-heading" className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            Tradition you can trust, convenience you&apos;ll love
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We handle the logistics so your family can focus on what matters — the ceremony itself.
          </p>
          <Link href="/search" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
            Find your purohit
            <ArrowRight />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {guarantees.map((g) => (
            <li key={g.title} className="rounded-2xl border border-border bg-background/60 p-5">
              <g.icon className="size-6 text-primary" />
              <h3 className="mt-4 text-base font-semibold text-foreground">{g.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Testimonials() {
  const featured = ["r2", "r6", "r16"]
    .map((id) => reviews.find((r) => r.id === id))
    .filter((r): r is (typeof reviews)[number] => Boolean(r));

  return (
    <section className="container-page py-14 sm:py-20" aria-labelledby="stories-heading">
      <SectionHeader id="stories-heading" eyebrow="Family stories" title="Ceremonies remembered for a lifetime" />
      <ul className="grid gap-4 md:grid-cols-3">
        {featured.map((r) => (
          <li key={r.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <Quote aria-hidden className="size-7 text-gold-700" />
            <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-foreground/90">
              {r.comment}
            </blockquote>
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
              <div>
                <div className="text-sm font-semibold text-foreground">{r.userName}</div>
                <div className="text-xs text-muted-foreground">
                  {r.serviceName} with {getPurohit(r.purohitId)?.name.split(" ").slice(1).join(" ")}
                </div>
              </div>
              <RatingStars value={r.rating} size="xs" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function JoinCta() {
  return (
    <section className="container-page pb-6" aria-labelledby="join-heading">
      <div className="relative overflow-hidden rounded-3xl border border-gold-700/50 bg-gradient-to-br from-gold-900/60 via-card to-background p-8 sm:p-12">
        <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-60 [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 id="join-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
              Are you a purohit?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Join 340+ verified purohits who grow their practice with PurohitConnect — steady
              bookings, on-time payouts and zero paperwork.
            </p>
          </div>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "shrink-0")}>
            Join as a purohit
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
