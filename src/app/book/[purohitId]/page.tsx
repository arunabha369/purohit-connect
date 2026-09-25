"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Smartphone,
  CalendarPlus,
  Tag,
  UserX,
  Wallet,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { getService, getServicesForPurohit } from "@/lib/catalog";
import { useApp, usePurohit, type Booking, type PaymentMethod } from "@/lib/store";
import { slotState, type AvailabilityContext } from "@/lib/store/availability";
import { COUPONS, checkCoupon, normalizeCouponCode, priceBooking } from "@/lib/store/pricing";
import { isFirstBooking } from "@/lib/store/selectors";
import { buildIcs, downloadFile } from "@/lib/calendar";
import { formatDate, formatINR } from "@/lib/format";
import { RequireRole, PageLoader } from "@/components/auth/require-role";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { BackLink } from "@/components/shared/page-header";
import { DetailRow, Panel } from "@/components/shared/panel";
import { EmptyState } from "@/components/shared/empty-state";
import { PurohitAvatar } from "@/components/shared/purohit-avatar";
import { RatingBadge } from "@/components/shared/rating";
import { ServiceIcon } from "@/components/shared/service-icon";
import { DateStrip, SlotGrid } from "@/components/booking/slot-picker";

const steps = ["Ceremony", "Date & time", "Venue", "Payment"] as const;


const paymentMethods: {
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "UPI", label: "UPI", hint: "Google Pay, PhonePe, Paytm & more", icon: Smartphone },
  { id: "Card", label: "Credit or debit card", hint: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "Wallet", label: "PurohitConnect wallet", hint: "", icon: Wallet },
  { id: "Pay later", label: "Pay after the ceremony", hint: "Cash or UPI to the purohit", icon: Banknote },
];

/** "Flat 302, Sunrise Apts, Sector 62, Noida, UP 201301" → "Noida" */
function cityFromAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim());
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
}


function Stepper({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm sm:hidden">
        <span className="font-medium text-foreground">{steps[step]}</span>
        <span className="text-muted-foreground">
          Step {step + 1} of {steps.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface sm:hidden" aria-hidden>
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      <ol className="hidden items-center sm:flex" aria-label="Booking progress">
        {steps.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5" aria-current={current ? "step" : undefined}>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    done && "bg-primary text-primary-foreground",
                    current && "bg-primary/15 text-primary ring-2 ring-primary",
                    !done && !current && "bg-surface text-muted-foreground ring-1 ring-border-strong"
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    current || done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn("mx-4 h-px flex-1 transition-colors", done ? "bg-primary" : "bg-border-strong")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OptionCard({
  selected,
  disabled,
  onSelect,
  children,
  className,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative w-full rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-45",
        selected
          ? "border-primary bg-primary/[0.07] shadow-[0_0_0_1px_var(--primary)]"
          : "border-border bg-surface/40 hover:border-border-strong hover:bg-surface",
        className
      )}
    >
      {children}
    </button>
  );
}

function BookingFlow() {
  const { purohitId } = useParams<{ purohitId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { db, user, walletBalance, api } = useApp();
  const addresses = user?.addresses ?? [];

  const purohit = usePurohit(purohitId);
  const offered = purohit ? getServicesForPurohit(purohit) : [];
  const preselected = offered.find((s) => s.id === searchParams.get("service"))?.id;

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(preselected ?? "");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [addressId, setAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "new"
  );
  const [newAddress, setNewAddress] = useState({ line: "", city: "", pincode: "", label: "Home" });
  const [saveAddress, setSaveAddress] = useState(true);
  const [showAddressErrors, setShowAddressErrors] = useState(false);
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("UPI");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | undefined>();
  const [couponError, setCouponError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new step's heading for keyboard and screen-reader users.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  if (!purohit || !purohit.bookable) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={UserX}
          title={purohit ? `${purohit.name} isn't taking bookings` : "Purohit not found"}
          description="Browse other verified purohits who are available for your ceremony."
          action={
            <Link href="/search" className={buttonVariants()}>
              Browse purohits
            </Link>
          }
        />
      </div>
    );
  }

  const service = getService(serviceId);
  const now = new Date();
  const availability: AvailabilityContext = { bookings: db.bookings, blockedDates: purohit.blockedDates, now };
  const isOpen = (d: string, s: string) => slotState(purohit.id, d, s, availability) === "open";
  const selectedAddress = addresses.find((a) => a.id === addressId);
  const addressErrors = {
    line: newAddress.line.trim().length < 10 ? "Enter the full address, including house and street" : "",
    city: newAddress.city.trim().length < 2 ? "Enter a city" : "",
    pincode: /^\d{6}$/.test(newAddress.pincode) ? "" : "Enter a valid 6-digit PIN code",
  };
  const newAddressValid = !addressErrors.line && !addressErrors.city && !addressErrors.pincode;
  const venue =
    addressId === "new"
      ? {
          address: `${newAddress.line.trim()}, ${newAddress.city.trim()} ${newAddress.pincode}`.trim(),
          city: newAddress.city.trim(),
        }
      : selectedAddress
        ? { address: selectedAddress.address, city: cityFromAddress(selectedAddress.address) }
        : null;

  const firstBooking = user ? isFirstBooking(db, user.id) : false;
  const pricing = service ? priceBooking({ base: service.basePrice, couponCode: coupon, isFirstBooking: firstBooking }) : null;
  const total = pricing?.total ?? 0;
  const walletShort = walletBalance < total;

  const applyCoupon = (code = couponInput) => {
    if (!service) return;
    const check = checkCoupon(code, { base: service.basePrice, isFirstBooking: firstBooking });
    if (!check.ok) {
      setCouponError(check.error);
      return;
    }
    setCoupon(check.coupon.code);
    setCouponInput(check.coupon.code);
    setCouponError("");
    toast.success(`${check.coupon.code} applied`, `You save ${formatINR(check.discount)}.`);
  };

  const stepValid = [
    Boolean(service),
    Boolean(date && slot),
    addressId === "new" ? newAddressValid : Boolean(selectedAddress),
    Boolean(payment) && !(payment === "Wallet" && walletShort),
  ][step];

  const stepHint = [
    "Choose a ceremony to continue",
    !date ? "Pick a date to continue" : "Pick a time slot to continue",
    "Add a venue to continue",
    "Choose a payment method",
  ][step];

  const next = () => {
    if (step === 2 && addressId === "new" && !newAddressValid) {
      setShowAddressErrors(true);
      const firstInvalid = addressErrors.line ? "addr-line" : addressErrors.city ? "addr-city" : "addr-pin";
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    if (!stepValid) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    // Confirm
    setProcessing(true);
    window.setTimeout(() => {
      const res = api.createBooking({
        purohitId: purohit.id,
        serviceId,
        date,
        timeSlot: slot,
        address: venue!.address,
        city: venue!.city,
        notes,
        paymentMethod: payment,
        couponCode: coupon,
        saveAddressAs: addressId === "new" && saveAddress ? newAddress.label || "Home" : undefined,
      });
      setProcessing(false);
      if (!res.ok) {
        toast.error("Couldn't complete booking", res.error);
        if (/slot/i.test(res.error)) {
          setSlot("");
          setStep(1);
        }
        return;
      }
      setConfirmed(res.value);
      window.scrollTo({ top: 0 });
    }, 1200);
  };

  const back = () => (step === 0 ? router.push(`/purohit/${purohit.id}`) : setStep(step - 1));

  // ── Success ──────────────────────────────────────────────
  if (confirmed && service) {
    const confirmedId = confirmed.id;
    return (
      <div className="container-page max-w-xl py-10 sm:py-16">
        <div className="text-center">
          <div className="mx-auto flex size-20 animate-scale-in items-center justify-center rounded-full bg-success/15 ring-8 ring-success/5">
            <CheckCircle2 className="size-10 text-success" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">Booking request sent</h1>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            {purohit.name} usually confirms within {purohit.responseTime}. We&apos;ll notify you as soon
            as they do.
          </p>
        </div>

        <Panel className="mt-8">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3">
            <div>
              <div className="text-xs text-muted-foreground">Booking ID</div>
              <div className="font-mono text-sm font-semibold text-foreground">{confirmedId}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(confirmedId).then(
                  () => toast.success("Booking ID copied"),
                  () => undefined
                );
              }}
            >
              <Copy /> Copy
            </Button>
          </div>
          <dl className="mt-5 space-y-3">
            <DetailRow label="Ceremony">{service.name}</DetailRow>
            <DetailRow label="Purohit">{purohit.name}</DetailRow>
            <DetailRow label="When">
              {formatDate(confirmed.date, "weekday")} · {confirmed.timeSlot}
            </DetailRow>
            <DetailRow label="Venue">
              <span className="line-clamp-2">{confirmed.address}</span>
            </DetailRow>
            <DetailRow label="Payment">
              {confirmed.paymentMethod}
              {confirmed.paymentStatus === "due" && " · due after ceremony"}
            </DetailRow>
            <div className="border-t border-border pt-3">
              <DetailRow label={<span className="font-medium text-foreground">Total</span>}>
                <span className="font-heading text-lg">{formatINR(confirmed.pricing.total)}</span>
              </DetailRow>
            </div>
          </dl>
        </Panel>

        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={() =>
            downloadFile(
              `${confirmedId}.ics`,
              buildIcs({
                uid: confirmedId,
                title: `${service.name} with ${purohit.name}`,
                description: `Booking ${confirmedId}. Status: awaiting confirmation from the purohit.`,
                location: confirmed.address,
                date: confirmed.date,
                timeSlot: confirmed.timeSlot,
              }),
              "text/calendar"
            )
          }
        >
          <CalendarPlus /> Add to calendar
        </Button>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Link href={`/bookings/${confirmedId}`} className={cn(buttonVariants({ size: "lg" }), "sm:flex-1")}>
            Track booking
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "sm:flex-1")}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ── Flow ─────────────────────────────────────────────────
  return (
    <div className="container-page pt-4 pb-36 sm:pt-6 lg:pb-16">
      <BackLink href={`/purohit/${purohit.id}`} label={purohit.name} />
      <div className="mt-4 mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Book your ceremony</h1>
        <div className="mt-5">
          <Stepper step={step} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="min-w-0 animate-fade-in" key={step}>
          <h2 ref={headingRef} tabIndex={-1} className="sr-only">
            Step {step + 1}: {steps[step]}
          </h2>

          {step === 0 && (
            <Panel>
              <h3 className="text-lg font-semibold text-foreground">Which ceremony are you planning?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ceremonies {purohit.name.split(" ")[0]}ji specialises in. Prices include samagri.
              </p>
              <div role="radiogroup" aria-label="Ceremony" className="mt-5 space-y-3">
                {offered.map((s) => (
                  <OptionCard key={s.id} selected={serviceId === s.id} onSelect={() => setServiceId(s.id)}>
                    <div className="flex items-start gap-4">
                      <ServiceIcon name={s.icon} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-foreground">{s.name}</div>
                            <div lang="hi" className="text-sm text-gold-300/80">
                              {s.nameHindi}
                            </div>
                          </div>
                          <div className="font-heading text-lg font-semibold text-foreground">
                            {formatINR(s.basePrice)}
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          {s.duration}
                        </div>
                      </div>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </Panel>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <Panel>
                <h3 className="text-lg font-semibold text-foreground">Choose a date</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Consult your family pandit or panchang for the most auspicious muhurat.
                </p>
                <div className="-mx-5 mt-5 sm:-mx-6">
                  <DateStrip
                    purohitId={purohit.id}
                    value={date}
                    availability={availability}
                    className="px-5 sm:px-6"
                    onChange={(iso) => {
                      setDate(iso);
                      if (slot && !isOpen(iso, slot)) setSlot("");
                    }}
                  />
                </div>
              </Panel>

              <Panel>
                <h3 className="mb-5 text-lg font-semibold text-foreground">Choose a time</h3>
                <SlotGrid purohitId={purohit.id} date={date} value={slot} onChange={setSlot} availability={availability} />
              </Panel>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Panel>
                <h3 className="text-lg font-semibold text-foreground">Where will the ceremony take place?</h3>
                <div role="radiogroup" aria-label="Venue" className="mt-5 space-y-3">
                  {addresses.map((a) => (
                    <OptionCard key={a.id} selected={addressId === a.id} onSelect={() => setAddressId(a.id)}>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-strong text-primary">
                          {a.label === "Home" ? <Home className="size-4" /> : <MapPin className="size-4" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{a.label}</span>
                            {a.isDefault && (
                              <span className="rounded-md bg-surface-strong px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{a.address}</p>
                        </div>
                      </div>
                    </OptionCard>
                  ))}
                  <OptionCard selected={addressId === "new"} onSelect={() => setAddressId("new")}>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-border-strong text-muted-foreground">
                        <Plus className="size-4" />
                      </span>
                      <span className="font-medium text-foreground">Use a different address</span>
                    </div>
                  </OptionCard>
                </div>

                {addressId === "new" && (
                  <div className="mt-5 animate-fade-in space-y-4 rounded-2xl border border-border bg-surface/30 p-4 sm:p-5">
                    <div>
                      <Label htmlFor="addr-line">Full address</Label>
                      <Textarea
                        id="addr-line"
                        value={newAddress.line}
                        onChange={(e) => setNewAddress({ ...newAddress, line: e.target.value })}
                        placeholder="House / flat no., building, street, landmark"
                        autoComplete="street-address"
                        aria-invalid={showAddressErrors && !!addressErrors.line}
                        aria-describedby="addr-line-error"
                        className="mt-2 min-h-20"
                      />
                      {showAddressErrors && addressErrors.line && (
                        <p id="addr-line-error" className="mt-1.5 text-xs text-destructive">
                          {addressErrors.line}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="addr-city">City</Label>
                        <Input
                          id="addr-city"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          autoComplete="address-level2"
                          aria-invalid={showAddressErrors && !!addressErrors.city}
                          className="mt-2"
                        />
                        {showAddressErrors && addressErrors.city && (
                          <p className="mt-1.5 text-xs text-destructive">{addressErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="addr-pin">PIN code</Label>
                        <Input
                          id="addr-pin"
                          value={newAddress.pincode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                          }
                          inputMode="numeric"
                          autoComplete="postal-code"
                          aria-invalid={showAddressErrors && !!addressErrors.pincode}
                          className="mt-2"
                        />
                        {showAddressErrors && addressErrors.pincode && (
                          <p className="mt-1.5 text-xs text-destructive">{addressErrors.pincode}</p>
                        )}
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground/90">
                      <Checkbox checked={saveAddress} onCheckedChange={(v) => setSaveAddress(Boolean(v))} />
                      Save this address for future bookings
                    </label>
                  </div>
                )}
              </Panel>

              <Panel>
                <Label htmlFor="notes" className="text-base font-semibold text-foreground">
                  Notes for Panditji <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Number of guests, gotra, family traditions, parking directions…"
                  className="mt-3"
                />
                <p className="mt-1.5 text-right text-xs text-subtle-foreground">{notes.length}/500</p>
              </Panel>
            </div>
          )}

          {step === 3 && service && (
            <Panel>
              <h3 className="text-lg font-semibold text-foreground">How would you like to pay?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                If {purohit.name.split(" ")[0]}ji can&apos;t make it, you&apos;ll get a full refund within 3–5 days.
              </p>
              <div role="radiogroup" aria-label="Payment method" className="mt-5 space-y-3">
                {paymentMethods.map((m) => {
                  const disabled = m.id === "Wallet" && walletShort;
                  return (
                    <OptionCard
                      key={m.id}
                      selected={payment === m.id}
                      disabled={disabled}
                      onSelect={() => setPayment(m.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-primary">
                          <m.icon className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground">{m.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {m.id === "Wallet"
                              ? `Balance ${formatINR(walletBalance)}${walletShort ? " · insufficient" : ""}`
                              : m.hint}
                          </div>
                        </div>
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                            payment === m.id ? "border-primary" : "border-border-strong"
                          )}
                        >
                          {payment === m.id && <span className="size-2.5 rounded-full bg-primary" />}
                        </span>
                      </div>
                    </OptionCard>
                  );
                })}
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-success" />
                Payments are secured with 256-bit encryption.
              </p>

              <div className="mt-6 border-t border-border pt-5">
                <Label htmlFor="coupon" className="flex items-center gap-2">
                  <Tag className="size-4 text-primary" /> Have a coupon?
                </Label>
                {coupon ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/8 px-4 py-3">
                    <div className="text-sm">
                      <span className="font-mono font-semibold text-foreground">{coupon}</span>
                      <span className="text-muted-foreground"> · you save {formatINR(pricing?.discount ?? 0)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCoupon(undefined);
                        setCouponInput("");
                      }}
                      aria-label="Remove coupon"
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex gap-2">
                      <Input
                        id="coupon"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(normalizeCouponCode(e.target.value));
                          setCouponError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            applyCoupon();
                          }
                        }}
                        placeholder="Enter code"
                        aria-invalid={!!couponError}
                        aria-describedby="coupon-help"
                        className="font-mono uppercase"
                      />
                      <Button variant="outline" onClick={() => applyCoupon()} disabled={!couponInput.trim()}>
                        Apply
                      </Button>
                    </div>
                    <p id="coupon-help" className={cn("mt-1.5 text-xs", couponError ? "text-destructive" : "text-muted-foreground")}>
                      {couponError || "Available offers:"}
                    </p>
                    {!couponError && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {COUPONS.filter((c) => !c.firstBookingOnly || firstBooking).map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => applyCoupon(c.code)}
                            className="rounded-lg border border-dashed border-primary/50 px-3 py-1.5 text-left text-xs transition-colors hover:bg-primary/8"
                          >
                            <span className="font-mono font-semibold text-primary">{c.code}</span>
                            <span className="text-muted-foreground"> · {c.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Panel>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]" aria-label="Booking summary">
          <Panel className="p-5">
            <div className="flex items-center gap-3">
              <PurohitAvatar name={purohit.name} size="md" verified />
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{purohit.name}</div>
                <RatingBadge rating={purohit.rating} count={purohit.reviewCount} className="text-xs" />
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-border pt-5">
              <DetailRow label="Ceremony">{service?.name ?? <span className="text-subtle-foreground">—</span>}</DetailRow>
              <DetailRow label="Date">
                {date ? formatDate(date, "weekday") : <span className="text-subtle-foreground">—</span>}
              </DetailRow>
              <DetailRow label="Time">{slot || <span className="text-subtle-foreground">—</span>}</DetailRow>
              <DetailRow label="Venue">
                {venue?.city ? venue.city : <span className="text-subtle-foreground">—</span>}
              </DetailRow>
            </dl>
            {service && (
              <dl className="mt-5 space-y-2.5 border-t border-border pt-5">
                <DetailRow label="Ceremony fee">{formatINR(service.basePrice)}</DetailRow>
                <DetailRow label="Samagri kit">
                  <span className="text-success">Included</span>
                </DetailRow>
                <DetailRow label="Platform fee">{formatINR(pricing?.platformFee ?? 0)}</DetailRow>
                {!!pricing?.discount && (
                  <DetailRow label={`Coupon ${pricing.coupon}`}>
                    <span className="text-success">−{formatINR(pricing.discount)}</span>
                  </DetailRow>
                )}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <dt className="font-medium text-foreground">Total</dt>
                  <dd className="font-heading text-xl font-semibold text-foreground">{formatINR(total)}</dd>
                </div>
              </dl>
            )}
          </Panel>
        </aside>
      </div>

      {/* Action bar: fixed on mobile, inline on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-safe backdrop-blur-xl lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:pb-0 lg:backdrop-blur-none">
        <div className="container-page flex items-center gap-3 py-3 lg:grid lg:grid-cols-[1fr_22rem] lg:gap-6 lg:px-0 lg:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={back}
              disabled={processing}
              aria-label={step === 0 ? "Cancel and go back" : "Back to previous step"}
              className="px-4"
            >
              <ArrowLeft />
              <span className="hidden sm:inline">{step === 0 ? "Cancel" : "Back"}</span>
            </Button>
            <div className="min-w-0 flex-1 text-sm lg:hidden">
              {service ? (
                <>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="font-heading text-lg font-semibold text-foreground">{formatINR(total)}</div>
                </>
              ) : (
                <span className="text-muted-foreground">{stepHint}</span>
              )}
            </div>
            <p className="hidden text-sm text-muted-foreground lg:block" aria-live="polite">
              {!stepValid && stepHint}
            </p>
          </div>
          <Button
            size="lg"
            onClick={next}
            disabled={(!stepValid && !(step === 2 && addressId === "new")) || processing}
            className="min-w-36 lg:w-full"
          >
            {processing ? (
              <>
                <Loader2 className="animate-spin" /> Processing…
              </>
            ) : step === steps.length - 1 ? (
              <>
                {payment === "Pay later" ? "Request booking" : `Pay ${formatINR(total)}`}
              </>
            ) : (
              <>
                Continue <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <AppShell bottomNav={false}>
      <RequireRole role="user">
        <Suspense fallback={<PageLoader />}>
          <BookingFlow />
        </Suspense>
      </RequireRole>
    </AppShell>
  );
}
