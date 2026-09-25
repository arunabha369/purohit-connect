"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { OTPField } from "@base-ui/react/otp-field";
import { ArrowLeft, ArrowRight, BadgeCheck, Loader2, Star } from "lucide-react";
import { useApp, type UserRole } from "@/lib/booking-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { Logo } from "@/components/shared/logo";

const roles: { id: UserRole; label: string; destination: string; blurb: string }[] = [
  { id: "user", label: "Family", destination: "/", blurb: "Book and track ceremonies" },
  { id: "purohit", label: "Purohit", destination: "/purohit-dashboard", blurb: "Manage requests & schedule" },
  { id: "admin", label: "Admin", destination: "/admin", blurb: "Operate the platform" },
];

const OTP_LENGTH = 6;

function formatPhone(digits: string) {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const phoneId = useId();
  const otpId = useId();

  const [role, setRole] = useState<UserRole>("user");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const sendOtp = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setPhoneError("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setOtp("");
      setResendIn(30);
      toast.success("OTP sent", `We've sent a 6-digit code to +91 ${formatPhone(phone)}.`);
    }, 800);
  };

  const verify = (code = otp) => {
    if (code.length !== OTP_LENGTH || loading) return;
    setLoading(true);
    window.setTimeout(() => {
      login(role);
      const target = roles.find((r) => r.id === role)!;
      toast.success("Welcome to PurohitConnect", "You're signed in.");
      router.push(target.destination);
    }, 900);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-border lg:block">
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          preload
          sizes="50vw"
          className="object-cover opacity-70"
        />
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

      {/* Form */}
      <main className="relative flex flex-col px-4 py-6 sm:px-8">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,rgb(217_178_95/0.12),transparent_70%)]" />
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Continue as guest
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          {step === "phone" ? (
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
                      onClick={() => setRole(r.id)}
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
                <p className="mt-2 text-xs text-muted-foreground">{roles.find((r) => r.id === role)!.blurb}</p>
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

              <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                By continuing you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  );
}
