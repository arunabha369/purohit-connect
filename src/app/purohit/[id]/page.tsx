"use client";

import { AppShell } from "@/components/layout/app-shell";
import { purohits, reviews } from "@/lib/mock-data";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MapPin,
  Languages,

  Phone,
  MessageCircle,
  Award,
  ChevronLeft,
  IndianRupee,
} from "lucide-react";
import { useState } from "react";

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

export default function PurohitProfilePage() {
  const { id } = useParams();
  const purohit = purohits.find((p) => p.id === id);
  const purohitReviews = reviews.filter((r) => r.purohitId === id);
  const [date, setDate] = useState<Date | undefined>(new Date());

  if (!purohit) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-4xl mb-3">😕</p>
          <h2 className="font-heading font-semibold text-xl">Purohit not found</h2>
          <Link href="/search" className="text-maroon-800 text-sm mt-2 block">
            ← Back to Search
          </Link>
        </div>
      </AppShell>
    );
  }

  const colorIndex = purohits.findIndex((p) => p.id === id);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back button */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-charcoal mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Search
        </Link>

        {/* Profile Header */}
        <div className="bg-cream-100 rounded-2xl shadow-card overflow-hidden">
          {/* Banner */}
          <div className="h-32 md:h-40 bg-gradient-to-r from-maroon-800 via-maroon-700 to-saffron-500 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
          </div>

          <div className="px-5 md:px-8 pb-6 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Avatar */}
              <div
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarColors[colorIndex % avatarColors.length]} flex items-center justify-center border-4 border-white shadow-lg`}
              >
                <span className="text-white font-heading font-bold text-3xl">
                  {getInitials(purohit.name)}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h1 className="font-heading font-bold text-2xl text-charcoal">
                      {purohit.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-saffron-400 text-saffron-400" />
                        <span className="font-semibold">{purohit.rating}</span>
                        <span className="text-sm text-gray-400">
                          ({purohit.reviewCount} reviews)
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {purohit.city}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-cream-300"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-cream-300"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-cream-200 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-charcoal">
                  {purohit.experience}
                </div>
                <div className="text-xs text-gray-500">Years Exp.</div>
              </div>
              <div className="bg-cream-200 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-charcoal">
                  {purohit.reviewCount}
                </div>
                <div className="text-xs text-gray-500">Reviews</div>
              </div>
              <div className="bg-cream-200 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-charcoal flex items-center justify-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {purohit.priceRange.min.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-gray-500">Starting Price</div>
              </div>
              <div className="bg-cream-200 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-charcoal">
                  {purohit.languages.length}
                </div>
                <div className="text-xs text-gray-500">Languages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-cream-100 rounded-2xl shadow-card p-5 md:p-8 mt-4">
          <h2 className="font-heading font-semibold text-lg mb-3">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {purohit.bio}
          </p>

          <Separator className="my-5" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4 text-maroon-800" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {purohit.languages.map((l) => (
                  <Badge
                    key={l}
                    variant="secondary"
                    className="bg-cream-100 text-charcoal"
                  >
                    {l}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-maroon-800" />
                Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {purohit.specializations.map((s) => (
                  <Badge
                    key={s}
                    className="bg-maroon-50 text-maroon-800 border-0"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-maroon-800" />
                Certificates
              </h3>
              <div className="flex flex-wrap gap-2">
                {purohit.certificates.map((c) => (
                  <Badge
                    key={c}
                    variant="outline"
                    className="border-gold-300 text-gold-700"
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="bg-cream-100 rounded-2xl shadow-card p-5 md:p-8 mt-4">
          <h2 className="font-heading font-semibold text-lg mb-3">
            Availability
          </h2>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-xl"
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Green dates indicate availability (visual demo only)
          </p>
        </div>

        {/* Reviews */}
        <div className="bg-cream-100 rounded-2xl shadow-card p-5 md:p-8 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg">
              Reviews ({purohitReviews.length})
            </h2>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-saffron-400 text-saffron-400" />
              <span className="font-bold text-lg">{purohit.rating}</span>
            </div>
          </div>
          <div className="space-y-4">
            {purohitReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-cream-100 pb-4 last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-xs font-semibold text-charcoal">
                      {review.userName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {review.userName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {review.serviceName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? "fill-saffron-400 text-saffron-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{review.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40">
          <Link href={`/book/${purohit.id}`}>
            <Button className="w-full h-14 bg-maroon-800 hover:bg-maroon-900 text-white rounded-2xl shadow-lg shadow-maroon-800/25 font-semibold text-base">
              Book {purohit.name.split(" ").pop()}
              <span className="ml-2 text-sm font-normal opacity-75">
                from ₹{purohit.priceRange.min.toLocaleString("en-IN")}
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
