import Link from "next/link";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { COUPONS } from "@/lib/store/pricing";
import { PLATFORM_FEE } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";

const sections: { id: string; title: string; faqs: { q: string; a: React.ReactNode }[] }[] = [
  {
    id: "booking",
    title: "Booking a ceremony",
    faqs: [
      {
        q: "How do I book a purohit?",
        a: (
          <>
            Find a purohit on the <Link href="/search">search page</Link>, open their profile and tap <strong>Book now</strong>. Choose the
            ceremony, a date and time, your venue and a payment method. The purohit confirms your request, usually within a few hours.
          </>
        ),
      },
      {
        q: "What does “Pending” mean?",
        a: "Your request has been sent and is waiting for the purohit to confirm. We'll notify you the moment they do. If they can't make it, you'll be refunded in full and can book someone else.",
      },
      {
        q: "Is samagri included?",
        a: "Yes. Every ceremony price includes the samagri kit the ritual needs. The purohit brings it with them.",
      },
      {
        q: "Can I book for today?",
        a: "Yes, for slots that start at least 3 hours from now, so the purohit has time to prepare and travel.",
      },
    ],
  },
  {
    id: "changes",
    title: "Rescheduling & cancellations",
    faqs: [
      {
        q: "Can I change the date or time?",
        a: "Yes. Open the booking and tap Reschedule. You can move it any time until the purohit sets off. If the booking was already confirmed, the purohit is asked to confirm the new time.",
      },
      {
        q: "How do I cancel, and will I get a refund?",
        a: "Open the booking and tap Cancel booking. You can cancel free of charge until the purohit is on the way, and you get a full refund. After that, please call support.",
      },
      {
        q: "What if the purohit cancels?",
        a: "You'll be notified with the reason and refunded in full. You can book another purohit straight away.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & refunds",
    faqs: [
      {
        q: "Which payment methods do you accept?",
        a: `UPI, credit and debit cards, your PurohitConnect wallet, or paying the purohit after the ceremony. A platform fee of ${formatINR(PLATFORM_FEE)} is added to each booking.`,
      },
      {
        q: "How long do refunds take?",
        a: "Wallet payments are refunded to your wallet instantly. UPI and card refunds reach your account within 3–5 working days. Pay-after-ceremony bookings are never charged if they're cancelled.",
      },
      {
        q: "Do you have any offers?",
        a: (
          <>
            Enter a coupon on the payment step:{" "}
            {COUPONS.map((c, i) => (
              <span key={c.code}>
                <strong>{c.code}</strong> — {c.description}
                {i < COUPONS.length - 1 ? "; " : "."}
              </span>
            ))}{" "}
            Discounts apply to the ceremony fee.
          </>
        ),
      },
      {
        q: "Can I get a receipt?",
        a: "Yes. Open any booking and tap View receipt. You can print it or save it as a PDF.",
      },
    ],
  },
  {
    id: "purohits",
    title: "For purohits",
    faqs: [
      {
        q: "How do I join?",
        a: (
          <>
            Fill in the <Link href="/join">application form</Link>. Our partner team verifies your credentials and, once approved, you
            can sign in as a purohit with the same phone number.
          </>
        ),
      },
      {
        q: "How much do I earn?",
        a: "You keep the full ceremony fee. The platform fee and any coupon discounts are covered by PurohitConnect.",
      },
      {
        q: "Can I take days off?",
        a: "Yes. In your dashboard, open Availability to mark days off or pause new bookings entirely. Confirmed ceremonies are not affected.",
      },
    ],
  },
  {
    id: "account",
    title: "Your account",
    faqs: [
      {
        q: "How do I sign in?",
        a: "With your mobile number and a one-time code. There's no password to remember.",
      },
      {
        q: "Can I change my phone number?",
        a: "Your phone number is your sign-in, so it can't be edited in the app. Call support and we'll move your account to a new number after verifying it's you.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <AppShell footer>
      <div className="container-page max-w-3xl py-8 sm:py-12">
        <PageHeader title="Help & FAQs" description="Quick answers to common questions. Can't find what you need? We're a call away." />

        <nav aria-label="FAQ sections" className="-mx-4 mb-8 sm:-mx-6">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-6">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  className="inline-flex h-9 items-center rounded-full border border-border-strong bg-card px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24">
              <h2 id={`${s.id}-title`} className="mb-4 text-xl font-semibold text-foreground">
                {s.title}
              </h2>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {s.faqs.map((f) => (
                  <details key={f.q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium text-foreground transition-colors hover:bg-surface/60 [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-foreground">
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section aria-labelledby="contact-title" className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 id="contact-title" className="text-lg font-semibold text-foreground">
            Still need help?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Our team is available every day, 6 AM – 10 PM IST.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:+918001234567"
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              <Phone className="size-4 text-primary" /> 1800-123-4567
            </a>
            <a
              href="mailto:namaste@purohitconnect.in"
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              <Mail className="size-4 text-primary" /> namaste@purohitconnect.in
            </a>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
