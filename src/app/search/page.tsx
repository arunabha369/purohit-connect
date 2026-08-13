"use client";

import { AppShell } from "@/components/layout/app-shell";
import { purohits, cities } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,

  IndianRupee,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const avatarColors = [
  "from-maroon-700 to-maroon-900",
  "from-saffron-400 to-saffron-600",
  "from-gold-400 to-gold-600",
  "from-emerald-500 to-emerald-700",
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-rose-500 to-rose-700",
  "from-cyan-500 to-cyan-700",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [priceMax, setPriceMax] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    purohits.forEach((p) => p.languages.forEach((l) => langs.add(l)));
    return Array.from(langs).sort();
  }, []);

  const filtered = useMemo(() => {
    return purohits.filter((p) => {
      if (query) {
        const q = query.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.specializations.some((s) => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (selectedCity !== "all" && p.city !== selectedCity) return false;
      if (selectedRating !== "all" && p.rating < parseFloat(selectedRating))
        return false;
      if (
        selectedLanguage !== "all" &&
        !p.languages.includes(selectedLanguage)
      )
        return false;
      if (priceMax !== "all" && p.priceRange.min > parseInt(priceMax))
        return false;
      return true;
    });
  }, [query, selectedCity, selectedRating, selectedLanguage, priceMax]);

  const hasFilters =
    selectedCity !== "all" ||
    selectedRating !== "all" ||
    selectedLanguage !== "all" ||
    priceMax !== "all";

  const clearFilters = () => {
    setSelectedCity("all");
    setSelectedRating("all");
    setSelectedLanguage("all");
    setPriceMax("all");
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">City</Label>
        <Select value={selectedCity} onValueChange={(val) => setSelectedCity(val || "all")}>
          <SelectTrigger>
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">Minimum Rating</Label>
        <Select value={selectedRating} onValueChange={(val) => setSelectedRating(val || "0")}>
          <SelectTrigger>
            <SelectValue placeholder="Any Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            <SelectItem value="4.5">4.5+ ⭐</SelectItem>
            <SelectItem value="4.0">4.0+ ⭐</SelectItem>
            <SelectItem value="3.5">3.5+ ⭐</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">Language</Label>
        <Select value={selectedLanguage} onValueChange={(val) => setSelectedLanguage(val || "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Any Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Language</SelectItem>
            {allLanguages.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">Max Starting Price</Label>
        <Select value={priceMax} onValueChange={(val) => setPriceMax(val || "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Any Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Price</SelectItem>
            <SelectItem value="2000">Under ₹2,000</SelectItem>
            <SelectItem value="3000">Under ₹3,000</SelectItem>
            <SelectItem value="5000">Under ₹5,000</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, city, or puja type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 bg-cream-200 rounded-xl border-cream-300"
            />
          </div>

          {/* Mobile filter trigger */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger className={cn(
              "md:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-cream-300 bg-cream-100 hover:bg-cream-200",
              hasFilters && "border-maroon-800 text-maroon-800"
            )}>
              <SlidersHorizontal className="w-4 h-4" />
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl bg-cream-100 border-cream-200">
              <SheetTitle className="font-heading text-lg mb-4">Filters</SheetTitle>
              <FilterContent />
              <Button
                className="w-full mt-6 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl"
                onClick={() => setFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCity !== "all" && (
              <Badge
                variant="secondary"
                className="bg-maroon-50 text-maroon-800 gap-1"
              >
                {selectedCity}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedCity("all")}
                />
              </Badge>
            )}
            {selectedRating !== "all" && (
              <Badge
                variant="secondary"
                className="bg-maroon-50 text-maroon-800 gap-1"
              >
                {selectedRating}+ ⭐
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedRating("all")}
                />
              </Badge>
            )}
            {selectedLanguage !== "all" && (
              <Badge
                variant="secondary"
                className="bg-maroon-50 text-maroon-800 gap-1"
              >
                {selectedLanguage}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedLanguage("all")}
                />
              </Badge>
            )}
            {priceMax !== "all" && (
              <Badge
                variant="secondary"
                className="bg-maroon-50 text-maroon-800 gap-1"
              >
                Under ₹{parseInt(priceMax).toLocaleString("en-IN")}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setPriceMax("all")}
                />
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-cream-100 rounded-2xl shadow-card p-5 sticky top-24">
              <h3 className="font-heading font-semibold text-base mb-4">
                Filters
              </h3>
              <FilterContent />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-4">
              {filtered.length} purohit{filtered.length !== 1 && "s"} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  className="bg-cream-100 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-white font-heading font-bold text-lg">
                          {getInitials(p.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/purohit/${p.id}`}>
                          <h3 className="font-heading font-semibold text-base text-charcoal group-hover:text-maroon-800 transition-colors">
                            {p.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Star className="w-3.5 h-3.5 fill-saffron-400 text-saffron-400" />
                          <span className="text-sm font-semibold">
                            {p.rating}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({p.reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {p.city}
                          </span>
                          <span>{p.experience} yrs</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.specializations.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-[10px] border-cream-300 text-gray-500"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream-200">
                      <span className="text-sm font-semibold flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />
                        {p.priceRange.min.toLocaleString("en-IN")}
                        <span className="font-normal text-xs text-gray-400 ml-1">
                          onwards
                        </span>
                      </span>
                      <Link href={`/book/${p.id}`}>
                        <Button
                          size="sm"
                          className="bg-maroon-800 hover:bg-maroon-900 text-white rounded-lg text-xs h-8"
                        >
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🔍</p>
                <h3 className="font-heading font-semibold text-lg text-charcoal">
                  No purohits found
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
