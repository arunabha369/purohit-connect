"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronRight,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useApp } from "@/lib/booking-context";
import { cities, purohits } from "@/lib/mock-data";
import { isActiveBooking } from "@/lib/booking-status";
import { formatINR, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { Panel, PanelHeader } from "@/components/shared/panel";
import { EmptyState } from "@/components/shared/empty-state";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge } from "@/components/shared/rating";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}

function EditProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { profile, updateProfile } = useApp();
  const [form, setForm] = useState(profile);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    name: form.name.trim().length < 2 ? "Enter your full name" : undefined,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? undefined : "Enter a valid email address",
    phone: form.phone.replace(/\D/g, "").length >= 10 ? undefined : "Enter a valid 10-digit mobile number",
  };
  const valid = !errors.name && !errors.email && !errors.phone;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setForm(profile);
          setSubmitted(false);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Purohits see your name and phone number once a booking is confirmed.</DialogDescription>
        </DialogHeader>
        <form
          id="profile-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            if (!valid) return;
            updateProfile({ ...form, name: form.name.trim(), email: form.email.trim() });
            toast.success("Profile updated");
            onOpenChange(false);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="pf-name">Full name</Label>
            <Input
              id="pf-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
              aria-invalid={submitted && !!errors.name}
              aria-describedby="pf-name-err"
              className="mt-2"
            />
            {submitted && <FieldError id="pf-name-err" message={errors.name} />}
          </div>
          <div>
            <Label htmlFor="pf-email">Email</Label>
            <Input
              id="pf-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              aria-invalid={submitted && !!errors.email}
              aria-describedby="pf-email-err"
              className="mt-2"
            />
            {submitted && <FieldError id="pf-email-err" message={errors.email} />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-phone">Mobile number</Label>
              <Input
                id="pf-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
                aria-invalid={submitted && !!errors.phone}
                aria-describedby="pf-phone-err"
                className="mt-2"
              />
              {submitted && <FieldError id="pf-phone-err" message={errors.phone} />}
            </div>
            <div>
              <Label htmlFor="pf-city">City</Label>
              <Select value={form.city} onValueChange={(v) => v && setForm({ ...form, city: v })}>
                <SelectTrigger id="pf-city" className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="profile-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const topUpAmounts = [500, 1000, 2000, 5000];

function AddMoneyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addMoney } = useApp();
  const [amount, setAmount] = useState("1000");
  const value = parseInt(amount || "0", 10);
  const valid = value >= 100 && value <= 50000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add money to wallet</DialogTitle>
          <DialogDescription>Use your wallet balance for faster checkout.</DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="topup">Amount</Label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              id="topup"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 5))}
              aria-invalid={!valid}
              className="pl-8 font-heading text-lg"
            />
          </div>
          <p className={cn("mt-1.5 text-xs", valid ? "text-muted-foreground" : "text-destructive")}>
            Between {formatINR(100)} and {formatINR(50000)}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {topUpAmounts.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={value === a}
                onClick={() => setAmount(String(a))}
                className={cn(
                  "h-9 rounded-lg border text-sm transition-colors",
                  value === a
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border-strong text-muted-foreground hover:text-foreground"
                )}
              >
                ₹{a.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              addMoney(value);
              toast.success(`${formatINR(value)} added`, "Your wallet has been topped up.");
              onOpenChange(false);
            }}
          >
            Add {valid ? formatINR(value) : "money"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddAddressDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addAddress } = useApp();
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const error = address.trim().length < 10 ? "Enter the full address with city and PIN code" : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setLabel("Home");
          setAddress("");
          setSubmitted(false);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an address</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ad-label">Label</Label>
            <Input id="ad-label" value={label} onChange={(e) => setLabel(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="ad-address">Full address</Label>
            <Textarea
              id="ad-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House / flat no., street, area, city, PIN code"
              aria-invalid={submitted && !!error}
              aria-describedby="ad-address-err"
              className="mt-2"
            />
            {submitted && <FieldError id="ad-address-err" message={error} />}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setSubmitted(true);
              if (error) return;
              addAddress({ label: label.trim() || "Other", address: address.trim() });
              toast.success("Address saved");
              onOpenChange(false);
            }}
          >
            Save address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, bookings, favorites, addresses, setDefaultAddress, walletBalance, logout } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const saved = purohits.filter((p) => favorites.includes(p.id));
  const upcoming = bookings.filter((b) => isActiveBooking(b.status)).length;

  const stats = [
    { label: "Bookings", value: bookings.length, href: "/bookings" },
    { label: "Upcoming", value: upcoming, href: "/bookings" },
    { label: "Saved", value: saved.length, href: "#saved" },
  ];

  return (
    <AppShell>
      <div className="container-page max-w-3xl space-y-6 py-6 sm:py-10">
        {/* Identity */}
        <Panel className="relative overflow-hidden">
          <div aria-hidden className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gold-gradient font-heading text-2xl font-semibold text-primary-foreground shadow-glow">
              {getInitials(profile.name)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold text-foreground">{profile.name}</h1>
              <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-4" /> {profile.phone}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Mail className="size-4 shrink-0" /> <span className="truncate">{profile.email}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {profile.city}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)} className="self-start sm:self-center">
              <Pencil /> Edit
            </Button>
          </div>
          <div className="relative mt-6 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-surface/40">
            {stats.map((s) => (
              <Link key={s.label} href={s.href} className="px-3 py-3 text-center transition-colors hover:bg-surface">
                <span className="block font-heading text-2xl font-semibold text-foreground">{s.value}</span>
                <span className="block text-xs text-muted-foreground">{s.label}</span>
              </Link>
            ))}
          </div>
        </Panel>

        {/* Wallet */}
        <section
          aria-label="Wallet"
          className="relative overflow-hidden rounded-2xl border border-gold-700/50 bg-gradient-to-br from-gold-900/80 via-[#1a140b] to-card p-5 sm:p-6"
        >
          <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-50 [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gold-200/80">
                <Wallet className="size-4" /> Wallet balance
              </div>
              <div className="mt-1 font-heading text-3xl font-semibold text-gold-50">{formatINR(walletBalance)}</div>
            </div>
            <Button onClick={() => setTopUpOpen(true)}>
              <Plus /> Add money
            </Button>
          </div>
        </section>

        {/* Addresses */}
        <Panel>
          <PanelHeader
            title="Saved addresses"
            action={
              <Button variant="ghost" size="sm" onClick={() => setAddressOpen(true)}>
                <Plus /> Add
              </Button>
            }
          />
          <ul className="space-y-3">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface/40 p-4">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-primary">
                  {a.label === "Home" ? <Home className="size-4" /> : <MapPin className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{a.label}</span>
                    {a.isDefault && (
                      <span className="rounded-md bg-primary/12 px-1.5 py-0.5 text-[0.6875rem] font-medium text-primary">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.address}</p>
                </div>
                {!a.isDefault && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setDefaultAddress(a.id);
                      toast.success(`${a.label} set as default address`);
                    }}
                  >
                    Make default
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        {/* Saved purohits */}
        <Panel id="saved" className="scroll-mt-24">
          <PanelHeader title="Saved purohits" icon={Heart} />
          {saved.length ? (
            <ul className="divide-y divide-border">
              {saved.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Link href={`/purohit/${p.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                    <PurohitAvatar name={p.name} size="md" />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground group-hover:text-primary">{p.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RatingBadge rating={p.rating} className="text-xs" />
                        <span aria-hidden>·</span>
                        <span className="truncate">{p.city}</span>
                      </div>
                    </div>
                  </Link>
                  <FavoriteButton purohitId={p.id} purohitName={p.name} size="sm" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Heart}
              title="No saved purohits"
              description="Tap the heart on any purohit to find them here later."
              className="py-10"
              action={
                <Link href="/search" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Browse purohits
                </Link>
              }
            />
          )}
        </Panel>

        {/* Workspaces */}
        <Panel className="p-2 sm:p-2">
          <p className="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Demo workspaces
          </p>
          {[
            { href: "/purohit-dashboard", label: "Purohit dashboard", icon: LayoutDashboard },
            { href: "/admin", label: "Admin console", icon: ShieldCheck },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              <item.icon className="size-5 text-primary" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="size-4 text-subtle-foreground" />
            </Link>
          ))}
        </Panel>

        <Button variant="destructive" size="lg" className="w-full" onClick={() => setConfirmLogout(true)}>
          <LogOut /> Log out
        </Button>
      </div>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
      <AddMoneyDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
      <AddAddressDialog open={addressOpen} onOpenChange={setAddressOpen} />
      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Log out of PurohitConnect?"
        description="You'll need to verify your phone number again to manage your bookings."
        confirmLabel="Log out"
        tone="destructive"
        icon={<LogOut className="size-5" />}
        onConfirm={() => {
          logout();
          toast.info("You've been logged out");
          router.push("/login");
        }}
      />
    </AppShell>
  );
}
