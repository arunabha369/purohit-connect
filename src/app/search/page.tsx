"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { categories, cities, getCategory } from "@/lib/catalog";
import { usePublicPurohits, type PurohitView } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatINR, pluralize } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PurohitCard } from "@/components/shared/purohit-card";
import { EmptyState } from "@/components/shared/empty-state";

const sortOptions = {
  recommended: "Recommended",
  rating: "Highest rated",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  experience: "Most experienced",
} as const;
type SortKey = keyof typeof sortOptions;

const ratingOptions = [
  { value: "all", label: "Any" },
  { value: "4.5", label: "4.5+" },
  { value: "4.7", label: "4.7+" },
  { value: "4.8", label: "4.8+" },
];

const priceOptions = [
  { value: "all", label: "Any" },
  { value: "2000", label: formatINR(2000) },
  { value: "2500", label: formatINR(2500) },
  { value: "3000", label: formatINR(3000) },
];

interface Filters {
  city: string;
  category: string;
  rating: string;
  language: string;
  price: string;
  availableOnly: boolean;
}

const defaultFilters: Filters = {
  city: "all",
  category: "all",
  rating: "all",
  language: "all",
  price: "all",
  availableOnly: false,
};

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[0.8125rem] font-medium text-foreground/90">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "h-9 rounded-full border px-3 text-sm transition-colors",
                active
                  ? "border-primary bg-primary/12 font-medium text-primary"
                  : "border-border-strong text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function FilterPanel({
  filters,
  onChange,
  languages,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  languages: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="filter-city" className="mb-2.5">
          City
        </Label>
        <Select value={filters.city} onValueChange={(v) => onChange({ city: v ?? "all" })}>
          <SelectTrigger id="filter-city" className="w-full">
            <SelectValue>{(v: string) => (v === "all" ? "All cities" : v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-surface/50 p-3.5">
        <span>
          <span className="block text-sm font-medium text-foreground">Available now</span>
          <span className="block text-xs text-muted-foreground">Accepting new bookings</span>
        </span>
        <Switch
          checked={filters.availableOnly}
          onCheckedChange={(checked) => onChange({ availableOnly: checked })}
        />
      </label>

      <ChipGroup
        label="Minimum rating"
        options={ratingOptions}
        value={filters.rating}
        onChange={(rating) => onChange({ rating })}
      />

      <ChipGroup
        label="Max starting price"
        options={priceOptions}
        value={filters.price}
        onChange={(price) => onChange({ price })}
      />

      <ChipGroup
        label="Language"
        options={[{ value: "all", label: "Any" }, ...languages.map((l) => ({ value: l, label: l }))]}
        value={filters.language}
        onChange={(language) => onChange({ language })}
      />
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<SortKey>(
    (params.get("sort") as SortKey) in sortOptions ? (params.get("sort") as SortKey) : "recommended"
  );
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    city: params.get("city") ?? "all",
    category: getCategory(params.get("category") ?? undefined) ? params.get("category")! : "all",
    availableOnly: params.get("available") === "1",
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const purohits = usePublicPurohits();
  const languages = useMemo(() => Array.from(new Set(purohits.flatMap((p) => p.languages))).sort(), [purohits]);

  const updateFilters = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  // Keep the URL shareable without adding history entries on every keystroke.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (filters.city !== "all") next.set("city", filters.city);
    if (filters.category !== "all") next.set("category", filters.category);
    if (filters.availableOnly) next.set("available", "1");
    if (sort !== "recommended") next.set("sort", sort);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [query, filters.city, filters.category, filters.availableOnly, sort, pathname, router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const category = getCategory(filters.category);
    const list = purohits.filter((p) => {
      if (
        q &&
        ![p.name, p.city, ...p.specializations, ...p.languages].some((f) => f.toLowerCase().includes(q))
      )
        return false;
      if (filters.city !== "all" && p.city !== filters.city) return false;
      if (category && !p.specializations.includes(category.specialization)) return false;
      if (filters.rating !== "all" && p.rating < parseFloat(filters.rating)) return false;
      if (filters.language !== "all" && !p.languages.includes(filters.language)) return false;
      if (filters.price !== "all" && p.priceRange.min > parseInt(filters.price, 10)) return false;
      if (filters.availableOnly && !p.bookable) return false;
      return true;
    });

    const score = (p: PurohitView) => (p.bookable ? 1 : 0) * 10 + p.rating * Math.log10(p.reviewCount + 10);
    return [...list].sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        case "price-asc":
          return a.priceRange.min - b.priceRange.min;
        case "price-desc":
          return b.priceRange.min - a.priceRange.min;
        case "experience":
          return b.experience - a.experience;
        default:
          return score(b) - score(a);
      }
    });
  }, [query, filters, sort, purohits]);

  const activeChips: { key: keyof Filters; label: string }[] = [];
  if (filters.city !== "all") activeChips.push({ key: "city", label: filters.city });
  if (filters.rating !== "all") activeChips.push({ key: "rating", label: `${filters.rating}+ rating` });
  if (filters.price !== "all")
    activeChips.push({ key: "price", label: `Up to ${formatINR(parseInt(filters.price, 10))}` });
  if (filters.language !== "all") activeChips.push({ key: "language", label: filters.language });
  if (filters.availableOnly) activeChips.push({ key: "availableOnly", label: "Available now" });

  const sidebarFilterCount = activeChips.length;
  const hasAnyFilter = sidebarFilterCount > 0 || filters.category !== "all" || query.trim() !== "";

  const clearAll = () => {
    setFilters(defaultFilters);
    setQuery("");
  };

  const activeCategory = getCategory(filters.category);

  return (
    <div className="container-page py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {activeCategory ? `${activeCategory.name} purohits` : "Find a purohit"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
          Verified purohits with transparent pricing and samagri included.
        </p>
      </div>

      {/* Search + controls */}
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search purohits</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-[1.125rem] -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, city or puja"
            className="h-12 w-full rounded-xl border border-input bg-surface pr-10 pl-11 text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-subtle-foreground hover:border-border-strong focus-visible:border-primary/70 focus-visible:ring-3 focus-visible:ring-primary/15 md:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-strong hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            aria-label={`Filters${sidebarFilterCount ? `, ${sidebarFilterCount} applied` : ""}`}
            className={cn(
              "relative flex h-12 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors lg:hidden",
              sidebarFilterCount
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-input bg-surface text-foreground hover:border-border-strong"
            )}
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filters</span>
            {sidebarFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-bold text-primary-foreground">
                {sidebarFilterCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="gap-0 p-0">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border-strong" aria-hidden />
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <SheetTitle>Filters</SheetTitle>
              {sidebarFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...defaultFilters, category: f.category }))}
                  className="mr-10 text-sm font-medium text-primary"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <FilterPanel filters={filters} onChange={updateFilters} languages={languages} />
            </div>
            <div className="border-t border-border p-4">
              <Button size="lg" className="w-full" onClick={() => setSheetOpen(false)}>
                Show {pluralize(results.length, "purohit")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Select value={sort} onValueChange={(v) => v && setSort(v as SortKey)}>
          <SelectTrigger aria-label="Sort results" className="hidden h-12 w-52 sm:flex">
            <span className="text-muted-foreground">Sort:</span>
            <SelectValue>{(v: SortKey) => sortOptions[v]}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end" alignItemWithTrigger={false}>
            {Object.entries(sortOptions).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ceremony chips */}
      <div className="-mx-4 mt-4 sm:-mx-6">
        <ul
          aria-label="Filter by ceremony"
          className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)] sm:px-6"
        >
          {[{ id: "all", name: "All ceremonies" }, ...categories].map((c) => {
            const active = filters.category === c.id;
            return (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateFilters({ category: c.id })}
                  className={cn(
                    "h-9 rounded-full border px-4 text-sm whitespace-nowrap transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground font-medium"
                      : "border-border-strong bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[calc(var(--header-height)+1.5rem)] rounded-2xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Filters</h2>
              {sidebarFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...defaultFilters, category: f.category }))}
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Reset
                </button>
              )}
            </div>
            <FilterPanel filters={filters} onChange={updateFilters} languages={languages} />
          </div>
        </aside>

        <section aria-labelledby="results-heading" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 id="results-heading" className="mr-2 text-sm text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">{results.length}</span>{" "}
              {results.length === 1 ? "purohit" : "purohits"} found
            </h2>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => updateFilters({ [chip.key]: defaultFilters[chip.key] } as Partial<Filters>)}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 pr-2 pl-3 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {chip.label}
                <X className="size-3.5" aria-hidden />
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
          </div>

          {results.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((p) => (
                <PurohitCard key={p.id} purohit={p} className="animate-fade-in" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              title="No purohits match your search"
              description="Try a different ceremony or city, or remove a few filters to see more results."
              action={
                hasAnyFilter && (
                  <Button variant="outline" onClick={clearAll}>
                    Clear all filters
                  </Button>
                )
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="container-page py-6 sm:py-10">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      <Skeleton className="mt-6 h-12 w-full rounded-xl" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell footer>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent />
      </Suspense>
    </AppShell>
  );
}
