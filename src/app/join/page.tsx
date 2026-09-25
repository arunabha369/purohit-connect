"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeIndianRupee, CalendarCheck, CheckCircle2, FileCheck2, Loader2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { categories, cities } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import { validateApplication, type ApplicationInput } from "@/lib/store/actions";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Eyebrow } from "@/components/shared/section-header";
import { Panel } from "@/components/shared/panel";

const LANGUAGES = [
  "Hindi",
  "Sanskrit",
  "English",
  "Bengali",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Odia",
  "Punjabi",
  "Rajasthani",
  "Tamil",
  "Telugu",
  "Urdu",
];

const benefits = [
  { icon: CalendarCheck, title: "Steady bookings", body: "Families across your city find and book you directly." },
  { icon: BadgeIndianRupee, title: "Fair, on-time payouts", body: "You keep the full ceremony fee. Payouts every week." },
  { icon: FileCheck2, title: "No paperwork", body: "We handle scheduling, payments, reminders and support." },
  { icon: ShieldCheck, title: "Verified families", body: "Every booking comes with a verified phone number and address." },
];

type Errors = Partial<Record<keyof ApplicationInput, string>>;

const fieldOrder: (keyof ApplicationInput)[] = [
  "name",
  "phone",
  "email",
  "city",
  "experience",
  "startingPrice",
  "specializations",
  "languages",
  "bio",
];

function ChipSelect({
  id,
  options,
  value,
  onChange,
  invalid,
}: {
  id: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  invalid?: boolean;
}) {
  return (
    <div id={id} tabIndex={-1} className={cn("flex flex-wrap gap-2 rounded-xl outline-none", invalid && "ring-1 ring-destructive/60 ring-offset-4 ring-offset-card")}>
      {options.map((o) => {
        const active = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== o) : [...value, o])}
            className={cn(
              "h-9 rounded-full border px-3.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary/12 font-medium text-primary"
                : "border-border-strong text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}

export default function JoinPage() {
  const { api } = useApp();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    experience: "",
    startingPrice: "",
    specializations: [] as string[],
    languages: [] as string[],
    bio: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);

  const input = (): ApplicationInput => ({
    name: form.name,
    phone: form.phone,
    email: form.email,
    city: form.city,
    experience: Number(form.experience),
    startingPrice: Number(form.startingPrice),
    specializations: form.specializations,
    languages: form.languages,
    bio: form.bio,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as keyof ApplicationInput]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = input();
    const found = validateApplication(data);
    setErrors(found);
    const first = fieldOrder.find((k) => found[k]);
    if (first) {
      document.getElementById(`join-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      const res = api.submitApplication(data);
      setSubmitting(false);
      if (!res.ok) {
        toast.error("Couldn't submit application", res.error);
        return;
      }
      setSubmittedPhone(data.phone);
      window.scrollTo({ top: 0 });
    }, 800);
  };

  if (submittedPhone) {
    return (
      <AppShell footer>
        <div className="container-page max-w-xl py-16 text-center">
          <div className="mx-auto flex size-20 animate-scale-in items-center justify-center rounded-full bg-success/15 ring-8 ring-success/5">
            <CheckCircle2 className="size-10 text-success" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">Application received</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Our partner team will call you on +91 {submittedPhone.slice(0, 5)} {submittedPhone.slice(5)} within 2 working
            days to verify your credentials. Once approved, sign in as a purohit with this number.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Back to home
            </Link>
            <Link href="/help#purohits" className={buttonVariants({ size: "lg" })}>
              Read the partner FAQ
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell footer>
      <div className="container-page py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
            <Eyebrow>For purohits</Eyebrow>
            <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">Grow your practice with PurohitConnect</h1>
            <p className="mt-4 text-muted-foreground">
              Join 340+ verified purohits serving families across India. Apply in five minutes — we&apos;ll verify your
              credentials and have your profile live within a week.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {benefits.map((b) => (
                <li key={b.title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <b.icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-foreground">{b.title}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted-foreground">
              Already a partner?{" "}
              <Link href="/login?role=purohit" className="font-medium text-primary hover:text-primary-hover">
                Sign in to your dashboard
              </Link>
            </p>
          </div>

          <Panel>
            <form onSubmit={submit} noValidate className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your application</h2>
                <p className="mt-1 text-sm text-muted-foreground">All fields are required unless marked optional.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="join-name">Full name</Label>
                  <Input
                    id="join-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoComplete="name"
                    placeholder="e.g. Pandit Ramesh Shastri"
                    aria-invalid={!!errors.name}
                    aria-describedby="join-name-err"
                    className="mt-2"
                  />
                  <FieldError id="join-name-err" message={errors.name} />
                </div>
                <div>
                  <Label htmlFor="join-phone">Mobile number</Label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                    <Input
                      id="join-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      aria-invalid={!!errors.phone}
                      aria-describedby="join-phone-err"
                      className="pl-12"
                    />
                  </div>
                  <FieldError id="join-phone-err" message={errors.phone} />
                </div>
                <div>
                  <Label htmlFor="join-email">
                    Email <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="join-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby="join-email-err"
                    className="mt-2"
                  />
                  <FieldError id="join-email-err" message={errors.email} />
                </div>
                <div>
                  <Label htmlFor="join-city">City</Label>
                  <Select value={form.city || null} onValueChange={(v) => v && set("city", v)}>
                    <SelectTrigger
                      id="join-city"
                      aria-invalid={!!errors.city}
                      aria-describedby="join-city-err"
                      className="mt-2 w-full"
                    >
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
                  <FieldError id="join-city-err" message={errors.city} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="join-experience">Experience</Label>
                    <div className="relative mt-2">
                      <Input
                        id="join-experience"
                        inputMode="numeric"
                        value={form.experience}
                        onChange={(e) => set("experience", e.target.value.replace(/\D/g, "").slice(0, 2))}
                        aria-invalid={!!errors.experience}
                        aria-describedby="join-experience-err"
                        className="pr-12"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-muted-foreground">yrs</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="join-startingPrice">Starting fee</Label>
                    <div className="relative mt-2">
                      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                      <Input
                        id="join-startingPrice"
                        inputMode="numeric"
                        value={form.startingPrice}
                        onChange={(e) => set("startingPrice", e.target.value.replace(/\D/g, "").slice(0, 6))}
                        aria-invalid={!!errors.startingPrice}
                        aria-describedby="join-startingPrice-err"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 -mt-1.5">
                    <FieldError id="join-experience-err" message={errors.experience} />
                    <FieldError id="join-startingPrice-err" message={errors.startingPrice} />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-3">Ceremonies you perform</Label>
                <ChipSelect
                  id="join-specializations"
                  options={categories.map((c) => c.specialization)}
                  value={form.specializations}
                  onChange={(v) => set("specializations", v)}
                  invalid={!!errors.specializations}
                />
                <FieldError id="join-specializations-err" message={errors.specializations} />
              </div>

              <div>
                <Label className="mb-3">Languages</Label>
                <ChipSelect
                  id="join-languages"
                  options={LANGUAGES}
                  value={form.languages}
                  onChange={(v) => set("languages", v)}
                  invalid={!!errors.languages}
                />
                <FieldError id="join-languages-err" message={errors.languages} />
              </div>

              <div>
                <Label htmlFor="join-bio">About you</Label>
                <Textarea
                  id="join-bio"
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value.slice(0, 600))}
                  placeholder="Where you trained, your lineage or tradition, and the ceremonies you're known for."
                  aria-invalid={!!errors.bio}
                  aria-describedby="join-bio-err"
                  className="mt-2 min-h-28"
                />
                <div className="mt-1.5 flex justify-between gap-3">
                  <FieldError id="join-bio-err" message={errors.bio} />
                  <span className="ml-auto text-xs text-subtle-foreground">{form.bio.length}/600</span>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" /> Submitting…
                    </>
                  ) : (
                    "Submit application"
                  )}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  By applying you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                    Terms of Service
                  </Link>{" "}
                  and consent to a background verification.
                </p>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
