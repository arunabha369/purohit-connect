"use client";

import { AppShell } from "@/components/layout/app-shell";
import { mockUser, purohits } from "@/lib/mock-data";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Heart,
  Star,
  Edit2,
  Save,
  LogOut,
  ChevronRight,
  IndianRupee,
} from "lucide-react";


const avatarColors = [
  "from-maroon-700 to-maroon-900",
  "from-saffron-400 to-saffron-600",
  "from-gold-400 to-gold-600",
  "from-emerald-500 to-emerald-700",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const [phone, setPhone] = useState(mockUser.phone);

  const favPurohits = purohits.filter((p) =>
    mockUser.favorites.includes(p.id)
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-cream-100 rounded-2xl shadow-card p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-maroon-700 to-saffron-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-heading font-bold text-2xl">
              {getInitials(name)}
            </span>
          </div>
          <h1 className="font-heading font-bold text-xl text-charcoal">
            {name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{mockUser.city}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-lg border-cream-300"
            onClick={() => setEditing(!editing)}
          >
            {editing ? (
              <>
                <Save className="w-3 h-3 mr-1" />
                Save
              </>
            ) : (
              <>
                <Edit2 className="w-3 h-3 mr-1" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="bg-cream-100 rounded-2xl shadow-card p-5 mt-4 animate-fade-in">
            <h2 className="font-heading font-semibold text-lg mb-4">
              Edit Profile
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 rounded-xl border-cream-200"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl border-cream-200"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Phone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 rounded-xl border-cream-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet */}
        <div className="bg-gradient-to-r from-maroon-800 to-saffron-500 rounded-2xl shadow-card p-5 mt-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-white/70 mb-1">
                <Wallet className="w-4 h-4" />
                Wallet Balance
              </div>
              <div className="font-heading font-bold text-3xl flex items-center gap-1">
                <IndianRupee className="w-6 h-6" />
                {mockUser.walletBalance.toLocaleString("en-IN")}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur rounded-lg"
            >
              Add Money
            </Button>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-cream-100 rounded-2xl shadow-card p-5 mt-4">
          <h2 className="font-heading font-semibold text-lg mb-4">
            Saved Addresses
          </h2>
          <div className="space-y-3">
            {mockUser.addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-cream-200"
              >
                <MapPin className="w-4 h-4 text-maroon-800 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <Badge className="bg-saffron-200 text-saffron-400 border-0 text-[10px]">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {addr.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className="bg-cream-100 rounded-2xl shadow-card p-5 mt-4">
          <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            Favorite Purohits
          </h2>
          <div className="space-y-3">
            {favPurohits.map((p, i) => (
              <Link
                key={p.id}
                href={`/purohit/${p.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-cream-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-sm">
                      {getInitials(p.name)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Star className="w-3 h-3 fill-saffron-400 text-saffron-400" />
                      {p.rating} • {p.city}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-maroon-800" />
              </Link>
            ))}
          </div>
        </div>

        {/* Logout */}
        <Link href="/login">
          <Button
            variant="outline"
            className="w-full mt-4 rounded-xl border-red-800 text-red-400 hover:bg-red-900/30 h-12"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
