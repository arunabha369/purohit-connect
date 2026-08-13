"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [role, setRole] = useState("user");

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setStep("otp");
    }
  };

  const handleVerify = () => {
    switch (role) {
      case "purohit":
        router.push("/purohit-dashboard");
        break;
      case "admin":
        router.push("/admin");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-cream-50 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-saffron-400/10 blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gold-300/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-saffron-400 to-gold-300 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-3xl">🙏</span>
          </div>
          <h1 className="font-heading font-bold text-3xl text-white">
            Purohit<span className="text-saffron-400">Connect</span>
          </h1>
          <p className="text-cream-300 text-sm mt-2">
            Sign in to book trusted purohits
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-cream-100 rounded-3xl shadow-2xl p-6 md:p-8">
          <Tabs value={role} onValueChange={setRole} className="mb-6">
            <TabsList className="w-full bg-cream-100 rounded-xl p-1 h-auto">
              <TabsTrigger
                value="user"
                className="flex-1 rounded-lg py-2 text-xs data-[state=active]:bg-cream-200 data-[state=active]:shadow-sm"
              >
                User
              </TabsTrigger>
              <TabsTrigger
                value="purohit"
                className="flex-1 rounded-lg py-2 text-xs data-[state=active]:bg-cream-200 data-[state=active]:shadow-sm"
              >
                Purohit
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="flex-1 rounded-lg py-2 text-xs data-[state=active]:bg-cream-200 data-[state=active]:shadow-sm"
              >
                Admin
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {step === "phone" ? (
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-charcoal">
                  Mobile Number
                </Label>
                <div className="relative mt-2">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                    +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-20 h-12 rounded-xl border-cream-200 text-lg tracking-wider"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={phone.length < 10}
                className="w-full h-12 bg-maroon-800 hover:bg-maroon-900 text-cream-50 rounded-xl font-semibold disabled:opacity-50"
              >
                Send OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center text-xs text-gray-400">
                By continuing, you agree to our Terms of Service & Privacy
                Policy
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Enter the OTP sent to{" "}
                  <span className="font-medium text-charcoal">
                    +91 {phone}
                  </span>
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-charcoal">
                  OTP Code
                </Label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-2 h-12 rounded-xl border-cream-200 text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleVerify}
                className="w-full h-12 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl font-semibold"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verify & Login
              </Button>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep("phone")}
                  className="text-sm text-maroon-800 hover:underline"
                >
                  ← Change Number
                </button>
                <button className="text-sm text-gray-400 hover:text-gray-600">
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-cream-300 hover:text-white transition-colors"
          >
            Skip for now →
          </Link>
        </div>
      </div>
    </div>
  );
}
