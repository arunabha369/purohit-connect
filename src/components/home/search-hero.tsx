"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, CalendarCheck2, MapPin, Search, Star } from "lucide-react";
import { categories, cities } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow } from "@/components/shared/section-header";

const quickPicks = ["griha-pravesh", "satyanarayan", "rudrabhishek", "wedding"];

const stats = [
  { value: "340+", label: "Verified purohits" },
  { value: "4.8★", label: "Average rating" },
  { value: "50+", label: "Vedic ceremonies" },
];

export function SearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city !== "all") params.set("city", city);
    router.push(`/search${params.size ? `?${params}` : ""}`);
  };

  return (
    <section className="relative isolate overflow-hidden">
      {/* Atmosphere */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="container-page grid items-center gap-12 pt-8 pb-16 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-20 lg:pb-24">
        <div className="animate-fade-up">
          <Eyebrow>Trusted by 10,000+ families</Eyebrow>
          <h1 className="mt-5 text-[2.5rem] leading-[1.05] font-semibold text-foreground sm:text-6xl lg:text-[4.25rem]">
            Sacred ceremonies,{" "}
            <span className="text-gradient-gold">performed right.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Book verified, experienced purohits for every occasion — with transparent pricing,
            complete samagri and hassle-free scheduling.
          </p>

          <form
            onSubmit={submit}
            role="search"
            className="mt-8 flex flex-col gap-2 rounded-2xl border border-border-strong bg-card/90 p-2 shadow-elevated backdrop-blur sm:flex-row sm:items-center"
          >
            <label className="relative flex-1">
              <span className="sr-only">Puja or purohit name</span>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a puja or purohit"
                className="h-12 w-full rounded-xl bg-transparent pr-3 pl-11 text-base text-foreground outline-none placeholder:text-subtle-foreground focus-visible:bg-surface"
              />
            </label>
            <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
            <Select value={city} onValueChange={(v) => setCity(v ?? "all")}>
              <SelectTrigger
                aria-label="City"
                className="h-12 w-full border-transparent bg-transparent sm:w-44 sm:border-transparent"
              >
                <MapPin className="text-primary" />
                <SelectValue>{(v: string) => (v === "all" ? "Any city" : v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any city</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="lg" className="h-12 sm:px-7">
              Search
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Popular:</span>
            {quickPicks.map((id) => {
              const cat = categories.find((c) => c.id === id)!;
              return (
                <Link
                  key={id}
                  href={`/search?category=${id}`}
                  className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-muted-foreground transition-colors hover:border-gold-700/60 hover:text-foreground"
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative mx-auto hidden w-full max-w-md animate-fade-in lg:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border-strong shadow-elevated">
            <Image
              src="/hero-bg.png"
              alt="Brass kalash with coconut and mango leaves beside a puja bell"
              fill
              preload
              sizes="(min-width: 1024px) 28rem, 0px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          </div>

          <div className="absolute top-10 -left-10 flex items-center gap-3 rounded-2xl border border-border-strong bg-popover/90 p-3 pr-4 shadow-elevated backdrop-blur-xl">
            <span className="flex size-10 items-center justify-center rounded-xl bg-success/15 text-success">
              <CalendarCheck2 className="size-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">Booking confirmed</div>
              <div className="text-xs text-muted-foreground">Satyanarayan Puja · Sun, 6 PM</div>
            </div>
          </div>

          <div className="absolute -right-8 bottom-24 w-60 rounded-2xl border border-border-strong bg-popover/90 p-4 shadow-elevated backdrop-blur-xl">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-primary text-primary" />
              ))}
            </div>
            <p className="mt-2 text-sm leading-snug text-foreground">
              &ldquo;Every ritual was explained clearly. Highly recommended!&rdquo;
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Rajesh K. · Griha Pravesh</p>
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full border border-gold-700/50 bg-background/80 px-3 py-1.5 text-xs font-medium text-gold-200 backdrop-blur">
            <BadgeCheck className="size-4 text-primary" />
            Samagri included with every booking
          </div>
        </div>
      </div>
    </section>
  );
}
