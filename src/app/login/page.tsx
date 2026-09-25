"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";
import { OTPField } from "@base-ui/react/otp-field";
import { ArrowLeft, ArrowRight, BadgeCheck, Loader2, LogOut, Star } from "lucide-react";
import { cities } from "@/lib/catalog";
import { useApp, type Role } from "@/lib/store";
import { DEMO_ADMIN_PHONE, DEMO_PUROHIT_PHONE, DEMO_USER_PHONE } from "@/lib/store/seed";
import { roleHome, safeNext } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { PageLoader } from "@/components/auth/require-role";
import { Logo } from "@/components/shared/logo";

const roles: { id: Role; label: string; blurb: string; demo: { phone: string; note: string } }[] = [
  {
    id: "user",
    label: "Family",
    blurb: "Book and track ceremonies",
    demo: { phone: DEMO_USER_PHONE, note: "sample account with bookings — or use any number to create a new one" },
  },
  {
    id: "purohit",
    label: "Purohit",
    blurb: "Manage requests & schedule",
    demo: { phone: DEMO_PUROHIT_PHONE, note: "Pandit Ramesh Shastri" },
  },
  {
    id: "admin",
    label: "Admin",
    blurb: "Operate the platform",
    demo: { phone: DEMO_ADMIN_PHONE, note: "platform admin" },
  },
];

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function formatPhone(digits: string) {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

type Step = "phone" | "otp" | "profile";

function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const { hydrated, session, user, api } = useApp();
  const phoneId = useId();
  const otpId = useId();

  const initialRole = (["user", "purohit", "admin"] as const).find((r) => r === params.get("role")) ?? "user";
  const [role, setRole] = useState<Role>(initialRole);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [profile, setProfile] = useState({ name: "", email: "", city: "" });
  const [profileError, setProfileError] = useState("");
  const [finishing, setFinishing] = useState(false);

  const destination = (r: Role) => safeNext(params.get("next"), roleHome[r]);
  const profileIncomplete = session?.role === "user" && !!user && !user.name;

  // Signed in but never finished onboarding: resume at the profile step.
  const currentStep: Step = profileIncomplete ? "profile" : step;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const finish = (r: Role, name?: string) => {
    setFinishing(true);
    toast.success(name ? `Welcome, ${name.split(" ")[0]}` : "Welcome back", "You're signed in.");
    router.replace(destination(r));
  };

  const sendOtp = (e?: React.FormEvent) => {
    e?.preventDefault();
    const check = api.checkSignIn({ phone, role });
    if (!check.ok) {
      setPhoneError(check.error);
      return;
    }
    setPhoneError("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setOtp("");
      setResendIn(RESEND_SECONDS);
      toast.success("OTP sent", `We've sent a 6-digit code to +91 ${formatPhone(phone)}.`);
    }, 700);
  };

  const verify = (code = otp) => {
    if (code.length !== OTP_LENGTH || loading) return;
    setLoading(true);
    window.setTimeout(() => {
      const res = api.signIn({ phone, role });
      setLoading(false);
      if (!res.ok) {
        setStep("phone");
        setPhoneError(res.error);
        return;
      }
      if (res.value.needsProfile) {
        setStep("profile");
        return;
      }
      finish(role);
    }, 700);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = api.updateProfile(profile);
    if (!res.ok) {
      setProfileError(res.error);
      return;
    }
    finish("user", res.value.name);
  };

  if (!hydrated || finishing) return <PageLoader />;

  // Already signed in (and not mid-onboarding): offer to continue or switch.
  if (session && currentStep === "phone") {
    const name = session.role === "user" ? user?.name : session.role === "admin" ? "Admin" : "Purohit account";
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-semibold text-foreground">You&apos;re signed in</h1>
        <p className="mt-2 text-muted-foreground">
          {name} · +91 {formatPhone(session.phone)}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" onClick={() => router.replace(destination(session.role))}>
            Continue <ArrowRight />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              api.signOut();
              setPhone("");
            }}
          >
            <LogOut /> Use a different account
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === "profile") {
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-semibold text-foreground">Tell us about you</h1>
        <p className="mt-2 text-muted-foreground">Purohits see your name once they confirm a booking.</p>
        <form onSubmit={saveProfile} noValidate className="mt-8 space-y-4">
          <div>
            <Label htmlFor="ob-name">Full name</Label>
            <Input
              id="ob-name"
              autoFocus
              autoComplete="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="ob-email">
              Email <span className="font-normal text-muted-foreground">(optional, for receipts)</span>
            </Label>
            <Input
              id="ob-email"
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="ob-city">City</Label>
            <Select value={profile.city || null} onValueChange={(v) => v && setProfile({ ...profile, city: v })}>
              <SelectTrigger id="ob-city" className="mt-2 w-full">
                <SelectValue placeholder="Choose your city" />
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
          {profileError && (
            <p role="alert" className="text-sm text-destructive">
              {profileError}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full">
            Continue <ArrowRight />
          </Button>
        </form>
      </div>
    );
  }

  if (currentStep === "otp") {
    return (
      <div className="animate-fade-in">
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="-ml-1 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Change number
        </button>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Enter the code</h1>
        <p className="mt-2 text-muted-foreground">
          Sent to <span className="font-medium text-foreground">+91 {formatPhone(phone)}</span>
        </p>

        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
        >
          <label htmlFor={otpId} className="sr-only">
            One-time code
          </label>
          <OTPField.Root
            id={otpId}
            length={OTP_LENGTH}
            value={otp}
            onValueChange={setOtp}
            onValueComplete={(v) => verify(v)}
            disabled={loading}
            aria-describedby={`${otpId}-hint`}
            className="grid grid-cols-6 gap-2"
          >
            {Array.from({ length: OTP_LENGTH }, (_, i) => (
              <OTPField.Input
                key={i}
                autoFocus={i === 0}
                aria-label={i === 0 ? undefined : `Digit ${i + 1} of ${OTP_LENGTH}`}
                className="h-14 w-full min-w-0 rounded-xl border border-input bg-surface text-center font-heading text-2xl font-semibold text-foreground caret-primary transition-[border-color,box-shadow] outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 disabled:opacity-60"
              />
            ))}
          </OTPField.Root>
          <p id={`${otpId}-hint`} className="mt-3 text-xs text-muted-foreground">
            Demo mode: any 6 digits will work.
          </p>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading || otp.length !== OTP_LENGTH}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Verifying…
              </>
            ) : (
              <>
                <BadgeCheck /> Verify & continue
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Didn&apos;t get it?{" "}
          {resendIn > 0 ? (
            <span className="tabular-nums">Resend in 0:{String(resendIn).padStart(2, "0")}</span>
          ) : (
            <button type="button" onClick={() => sendOtp()} className="font-medium text-primary hover:text-primary-hover">
              Resend code
            </button>
          )}
        </div>
      </div>
    );
  }

  const current = roles.find((r) => r.id === role)!;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-semibold text-foreground">Sign in</h1>
      <p className="mt-2 text-muted-foreground">We&apos;ll send a one-time code to verify your number.</p>

      <fieldset className="mt-8">
        <legend className="mb-2.5 text-[0.8125rem] font-medium text-foreground/90">I&apos;m signing in as</legend>
        <div role="radiogroup" className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card p-1">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={role === r.id}
              onClick={() => {
                setRole(r.id);
                setPhoneError("");
              }}
              className={cn(
                "h-9 rounded-lg text-sm font-medium transition-colors",
                role === r.id
                  ? "bg-surface-strong text-foreground shadow-sm ring-1 ring-border-strong"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{current.blurb}</p>
      </fieldset>

      <form onSubmit={sendOtp} noValidate className="mt-6">
        <Label htmlFor={phoneId}>Mobile number</Label>
        <div
          className={cn(
            "mt-2 flex h-12 items-center rounded-xl border bg-surface transition-[border-color,box-shadow] focus-within:border-primary/70 focus-within:ring-3 focus-within:ring-primary/15",
            phoneError ? "border-destructive/70" : "border-input hover:border-border-strong"
          )}
        >
          <span className="flex h-full items-center border-r border-border px-3.5 text-sm font-medium text-muted-foreground">
            +91
          </span>
          <input
            id={phoneId}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            autoFocus
            placeholder="98765 43210"
            value={formatPhone(phone)}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
              if (phoneError) setPhoneError("");
            }}
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? `${phoneId}-error` : undefined}
            className="h-full flex-1 bg-transparent px-3.5 text-lg tracking-wide text-foreground outline-none placeholder:text-subtle-foreground"
          />
        </div>
        {phoneError && (
          <p id={`${phoneId}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
            {phoneError}
            {role === "purohit" && phoneError.includes("Apply") && (
              <>
                {" "}
                <Link href="/join" className="font-medium underline underline-offset-2">
                  Apply now
                </Link>
              </>
            )}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading || phone.length < 10}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Sending code…
            </>
          ) : (
            <>
              Get OTP <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-border-strong p-3.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Demo:</span>{" "}
        <button
          type="button"
          onClick={() => {
            setPhone(current.demo.phone);
            setPhoneError("");
          }}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          +91 {formatPhone(current.demo.phone)}
        </button>{" "}
        — {current.demo.note}.
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-border lg:block">
        <Image src="/hero-bg.png" alt="" fill preload sizes="50vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo />
          <figure className="max-w-md rounded-3xl border border-border-strong bg-popover/80 p-6 backdrop-blur-xl">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="mt-3 text-lg leading-relaxed text-foreground">
              &ldquo;Our wedding ceremony was conducted with such grace and precision. Pandit Ramesh ji made it
              truly special.&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-muted-foreground">Priya Agarwal · Vivah Sanskar, Varanasi</figcaption>
          </figure>
        </div>
      </aside>

      <main className="relative flex flex-col px-4 py-6 sm:px-8">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,rgb(217_178_95/0.12),transparent_70%)]"
        />
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Continue as guest
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <Suspense fallback={<PageLoader />}>
            <LoginFlow />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
