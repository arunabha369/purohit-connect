"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Heart,
  Home,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cities } from "@/lib/catalog";
import { useApp, usePublicPurohits, type Address } from "@/lib/store";
import { WALLET_TOP_UP } from "@/lib/store/actions";
import { walletHistory } from "@/lib/store/selectors";
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
import { RequireRole } from "@/components/auth/require-role";
import { Panel, PanelHeader } from "@/components/shared/panel";
import { EmptyState } from "@/components/shared/empty-state";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge } from "@/components/shared/rating";

function formatPhone(phone: string) {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

function EditProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user, api } = useApp();
  const [form, setForm] = useState({ name: "", email: "", city: "" });
  const [error, setError] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o && user) {
          setForm({ name: user.name, email: user.email, city: user.city });
          setError("");
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
            const res = api.updateProfile(form);
            if (!res.ok) {
              setError(res.error);
              return;
            }
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
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="pf-email">Email</Label>
            <Input
              id="pf-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              placeholder="For booking receipts"
              className="mt-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-phone">Mobile number</Label>
              <Input id="pf-phone" value={user ? formatPhone(user.phone) : ""} disabled className="mt-2" />
              <p className="mt-1.5 text-xs text-muted-foreground">Your sign-in number can&apos;t be changed.</p>
            </div>
            <div>
              <Label htmlFor="pf-city">City</Label>
              <Select value={form.city || null} onValueChange={(v) => v && setForm({ ...form, city: v })}>
                <SelectTrigger id="pf-city" className="mt-2 w-full">
                  <SelectValue placeholder="Choose city" />
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
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
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
  const { api } = useApp();
  const [amount, setAmount] = useState("1000");
  const value = parseInt(amount || "0", 10);
  const valid = value >= WALLET_TOP_UP.min && value <= WALLET_TOP_UP.max;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setAmount("1000");
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add money to wallet</DialogTitle>
          <DialogDescription>Pay for ceremonies instantly. Refunds for wallet payments come back here.</DialogDescription>
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
              aria-describedby="topup-help"
              className="pl-8 font-heading text-lg"
            />
          </div>
          <p id="topup-help" className={cn("mt-1.5 text-xs", valid ? "text-muted-foreground" : "text-destructive")}>
            Between {formatINR(WALLET_TOP_UP.min)} and {formatINR(WALLET_TOP_UP.max)}
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
              const res = api.addMoney(value);
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              toast.success(`${formatINR(value)} added`, `New balance ${formatINR(res.value)}.`);
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
  const { api } = useApp();
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setLabel("Home");
          setAddress("");
          setError("");
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
            <Input id="ad-label" value={label} onChange={(e) => setLabel(e.target.value.slice(0, 30))} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="ad-address">Full address</Label>
            <Textarea
              id="ad-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House / flat no., street, area, city, PIN code"
              autoComplete="street-address"
              aria-invalid={!!error}
              aria-describedby="ad-address-err"
              className="mt-2"
            />
            {error && (
              <p id="ad-address-err" className="mt-1.5 text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const res = api.addAddress({ label, address });
              if (!res.ok) {
                setError(res.error);
                return;
              }
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

function ProfileContent() {
  const router = useRouter();
  const { db, user, walletBalance, api } = useApp();
  const purohits = usePublicPurohits();
  const [editOpen, setEditOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Address | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showAllTxns, setShowAllTxns] = useState(false);

  const bookings = useMemo(() => db.bookings.filter((b) => b.userId === user?.id), [db.bookings, user?.id]);
  const txns = useMemo(() => (user ? walletHistory(db, user.id) : []), [db, user]);
  if (!user) return null;

  const saved = purohits.filter((p) => user.favorites.includes(p.id));
  const upcoming = bookings.filter((b) => isActiveBooking(b.status)).length;

  const stats = [
    { label: "Bookings", value: bookings.length, href: "/bookings" },
    { label: "Upcoming", value: upcoming, href: "/bookings" },
    { label: "Saved", value: saved.length, href: "#saved" },
  ];

  return (
    <div className="container-page max-w-3xl space-y-6 py-6 sm:py-10">
      <Panel className="relative overflow-hidden">
        <div aria-hidden className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gold-gradient font-heading text-2xl font-semibold text-primary-foreground shadow-glow">
            {getInitials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold text-foreground">{user.name}</h1>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-4" /> {formatPhone(user.phone)}
              </span>
              {user.email && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Mail className="size-4 shrink-0" /> <span className="truncate">{user.email}</span>
                </span>
              )}
              {user.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {user.city}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-subtle-foreground">Member since {format(parseISO(user.joinedAt), "MMMM yyyy")}</p>
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
        {txns.length > 0 && (
          <div className="relative mt-5 rounded-xl border border-gold-800/60 bg-background/40">
            <h2 className="border-b border-gold-900/60 px-4 py-2.5 text-xs font-medium tracking-wide text-gold-200/70 uppercase">
              Recent activity
            </h2>
            <ul className="divide-y divide-gold-900/50">
              {(showAllTxns ? txns : txns.slice(0, 3)).map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      t.amount > 0 ? "bg-success/15 text-success" : "bg-surface text-muted-foreground"
                    )}
                  >
                    {t.amount > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-foreground">
                      {t.bookingId ? (
                        <Link href={`/bookings/${t.bookingId}`} className="hover:underline">
                          {t.description}
                        </Link>
                      ) : (
                        t.description
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{format(parseISO(t.at), "d MMM yyyy, h:mm a")}</div>
                  </div>
                  <span className={cn("font-medium tabular-nums", t.amount > 0 ? "text-success" : "text-foreground")}>
                    {t.amount > 0 ? "+" : "−"}
                    {formatINR(Math.abs(t.amount))}
                  </span>
                </li>
              ))}
            </ul>
            {txns.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllTxns((v) => !v)}
                className="w-full border-t border-gold-900/60 px-4 py-2.5 text-sm font-medium text-primary hover:text-primary-hover"
              >
                {showAllTxns ? "Show less" : `Show all ${txns.length} transactions`}
              </button>
            )}
          </div>
        )}
      </section>

      <Panel>
        <PanelHeader
          title="Saved addresses"
          action={
            <Button variant="ghost" size="sm" onClick={() => setAddressOpen(true)}>
              <Plus /> Add
            </Button>
          }
        />
        {user.addresses.length ? (
          <ul className="space-y-3">
            {user.addresses.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface/40 p-4">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-primary">
                  {a.label === "Home" ? <Home className="size-4" /> : <MapPin className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{a.label}</span>
                    {a.isDefault && (
                      <span className="rounded-md bg-primary/12 px-1.5 py-0.5 text-[0.6875rem] font-medium text-primary">Default</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.address}</p>
                  {!a.isDefault && (
                    <button
                      type="button"
                      onClick={() => {
                        api.setDefaultAddress(a.id);
                        toast.success(`${a.label} set as default address`);
                      }}
                      className="mt-2 text-xs font-medium text-primary hover:text-primary-hover"
                    >
                      Make default
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setRemoveTarget(a)}
                  aria-label={`Remove ${a.label} address`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-strong hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={MapPin}
            title="No saved addresses"
            description="Save your home or your family's address to book faster."
            className="py-10"
          />
        )}
      </Panel>

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
                      <RatingBadge rating={p.rating} count={p.reviewCount} className="text-xs" />
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

      <Button variant="destructive" size="lg" className="w-full" onClick={() => setConfirmLogout(true)}>
        <LogOut /> Log out
      </Button>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
      <AddMoneyDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
      <AddAddressDialog open={addressOpen} onOpenChange={setAddressOpen} />
      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title={`Remove ${removeTarget?.label ?? "this"} address?`}
        description={removeTarget?.address}
        confirmLabel="Remove"
        tone="destructive"
        icon={<Trash2 className="size-5" />}
        onConfirm={() => {
          if (!removeTarget) return;
          api.removeAddress(removeTarget.id);
          toast.success("Address removed");
        }}
      />
      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Log out of PurohitConnect?"
        description="You'll need to verify your phone number again to manage your bookings."
        confirmLabel="Log out"
        tone="destructive"
        icon={<LogOut className="size-5" />}
        onConfirm={() => {
          api.signOut();
          toast.info("You've been logged out");
          router.push("/");
        }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <RequireRole role="user">
        <ProfileContent />
      </RequireRole>
    </AppShell>
  );
}
