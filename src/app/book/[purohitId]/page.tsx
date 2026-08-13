"use client";

import { AppShell } from "@/components/layout/app-shell";
import { purohits, services, timeSlots, mockUser } from "@/lib/mock-data";
import { useApp } from "@/lib/booking-context";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Check,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CreditCard,
  Smartphone,
  Wallet,
  Upload,
  IndianRupee,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const steps = [
  { label: "Service & Time", icon: CalendarIcon },
  { label: "Address", icon: MapPin },
  { label: "Payment", icon: CreditCard },
  { label: "Confirmation", icon: Check },
];

export default function BookingPage() {
  const { purohitId } = useParams();
  const router = useRouter();
  const { addBooking } = useApp();
  const purohit = purohits.find((p) => p.id === purohitId);

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState(mockUser.addresses[0]?.address || "");
  const [city, setCity] = useState(mockUser.city);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingId, setBookingId] = useState("");

  if (!purohit) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-4xl mb-3">😕</p>
          <h2 className="font-heading font-semibold text-xl">
            Purohit not found
          </h2>
          <Link href="/search" className="text-maroon-800 text-sm mt-2 block">
            ← Back to Search
          </Link>
        </div>
      </AppShell>
    );
  }

  const purohitServices = services.filter(
    (s) =>
      purohit.specializations.some(
        (spec) =>
          s.name.toLowerCase().includes(spec.toLowerCase()) ||
          spec.toLowerCase().includes(s.category)
      ) || true
  );

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleConfirm = () => {
    const booking = addBooking({
      purohitId: purohit.id,
      serviceId: selectedService,
      date: selectedDate?.toISOString().split("T")[0] || "",
      timeSlot: selectedTime,
      address,
      city,
      notes,
      paymentMethod,
    });
    setBookingId(booking.id);
    setStep(3);
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return selectedService && selectedDate && selectedTime;
      case 1:
        return address.trim().length > 5;
      case 2:
        return paymentMethod;
      default:
        return true;
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back */}
        {step < 3 && (
          <button
            onClick={step === 0 ? () => router.back() : handleBack}
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-charcoal mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Back" : "Previous Step"}
          </button>
        )}

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                        ? "bg-maroon-800 text-white shadow-lg shadow-maroon-800/25"
                        : "bg-cream-200 text-gray-400"
                  )}
                >
                  {i < step ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-1.5 font-medium",
                    i <= step ? "text-charcoal" : "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 rounded",
                    i < step ? "bg-emerald-500" : "bg-cream-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Service & Time */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-lg mb-4">
                Select Service
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {purohitServices.slice(0, 6).map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                      selectedService === service.id
                        ? "border-maroon-800 bg-maroon-50"
                        : "border-cream-200 hover:border-cream-300"
                    )}
                  >
                    <div>
                      <div className="font-medium text-sm">{service.name}</div>
                      <div className="text-xs text-saffron-600">
                        {service.nameHindi}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {service.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />
                        {service.basePrice.toLocaleString("en-IN")}
                      </div>
                      {selectedService === service.id && (
                        <CheckCircle2 className="w-5 h-5 text-maroon-800 mt-1 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-lg mb-4">
                Select Date
              </h2>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-lg mb-4">
                Select Time Slot
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                      selectedTime === slot
                        ? "border-maroon-800 bg-maroon-50 text-maroon-800"
                        : "border-cream-200 text-gray-600 hover:border-cream-300"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-lg mb-4">
                Ceremony Address
              </h2>

              {/* Saved addresses */}
              <div className="space-y-2 mb-4">
                {mockUser.addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setAddress(addr.address)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                      address === addr.address
                        ? "border-maroon-800 bg-maroon-50"
                        : "border-cream-200 hover:border-cream-300"
                    )}
                  >
                    <MapPin className="w-4 h-4 text-maroon-800 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{addr.label}</div>
                      <div className="text-xs text-gray-500">
                        {addr.address}
                      </div>
                    </div>
                    {addr.isDefault && (
                      <Badge className="bg-saffron-200 text-saffron-400 border-0 text-[10px] ml-auto">
                        Default
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              <Separator className="my-4" />

              <Label className="text-sm font-medium">Or enter new address</Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address with landmarks..."
                className="mt-2 rounded-xl border-cream-200"
                rows={3}
              />

              <div className="mt-4">
                <Label className="text-sm font-medium">City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 rounded-xl border-cream-200"
                />
              </div>
            </div>

            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-lg mb-4">
                Special Instructions
              </h2>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests, dietary restrictions, number of guests..."
                className="rounded-xl border-cream-200"
                rows={3}
              />

              <div className="mt-4">
                <Label className="text-sm font-medium">
                  Upload Documents (optional)
                </Label>
                <div className="mt-2 border-2 border-dashed border-cream-300 rounded-xl p-6 text-center hover:border-maroon-300 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Tap to upload kundli, photos, etc.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, JPG, PNG (max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Order Summary */}
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-lg mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Purohit</span>
                  <span className="font-medium">{purohit.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-medium">
                    {selectedServiceData?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {address}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Fee</span>
                  <span className="font-medium">
                    ₹{selectedServiceData?.basePrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform Fee</span>
                  <span className="font-medium">₹99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Samagri (included)</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-maroon-800">
                    ₹
                    {(
                      (selectedServiceData?.basePrice || 0) + 99
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-cream-100 rounded-2xl shadow-card p-5">
              <h2 className="font-heading font-semibold text-lg mb-4">
                Payment Method
              </h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <label
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    paymentMethod === "upi"
                      ? "border-maroon-800 bg-maroon-50"
                      : "border-cream-200"
                  )}
                >
                  <RadioGroupItem value="upi" />
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">UPI</div>
                    <div className="text-xs text-gray-400">
                      Google Pay, PhonePe, Paytm
                    </div>
                  </div>
                </label>
                <label
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    paymentMethod === "card"
                      ? "border-maroon-800 bg-maroon-50"
                      : "border-cream-200"
                  )}
                >
                  <RadioGroupItem value="card" />
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">
                      Credit / Debit Card
                    </div>
                    <div className="text-xs text-gray-400">
                      Visa, Mastercard, RuPay
                    </div>
                  </div>
                </label>
                <label
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    paymentMethod === "wallet"
                      ? "border-maroon-800 bg-maroon-50"
                      : "border-cream-200"
                  )}
                >
                  <RadioGroupItem value="wallet" />
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-medium text-sm">Wallet</div>
                    <div className="text-xs text-gray-400">
                      Balance: ₹{mockUser.walletBalance.toLocaleString("en-IN")}
                    </div>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 3 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-charcoal mb-2">
              Booking Confirmed! 🎉
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your puja has been booked successfully
            </p>

            <div className="bg-cream-100 rounded-2xl shadow-card p-6 max-w-sm mx-auto text-left">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-mono font-semibold text-maroon-800">
                    {bookingId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge className="bg-amber-900/40 text-amber-400 border-0">
                    Pending
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Purohit</span>
                  <span className="font-medium">{purohit.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-medium">
                    {selectedServiceData?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-maroon-800">
                    ₹
                    {(
                      (selectedServiceData?.basePrice || 0) + 99
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8 max-w-sm mx-auto">
              <Link href="/bookings">
                <Button className="w-full bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl h-12">
                  View My Bookings
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-12 border-cream-300"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Next Button */}
        {step < 3 && (
          <div className="mt-6">
            <Button
              onClick={step === 2 ? handleConfirm : handleNext}
              disabled={!canProceed()}
              className="w-full h-14 bg-maroon-800 hover:bg-maroon-900 text-white rounded-2xl font-semibold text-base disabled:opacity-50"
            >
              {step === 2 ? "Confirm & Pay" : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
