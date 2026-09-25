import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use PurohitConnect to book or provide Vedic ceremonies.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="25 September 2026">
      <section>
        <h2>1. About PurohitConnect</h2>
        <p>
          PurohitConnect is an online marketplace that connects families (&ldquo;you&rdquo;) with independent purohits who perform
          Vedic ceremonies. Purohits are independent service providers, not employees of PurohitConnect. By creating an account or
          making a booking you agree to these terms.
        </p>
      </section>
      <section>
        <h2>2. Your account</h2>
        <ul>
          <li>You sign in with your Indian mobile number and a one-time code. Keep access to your phone secure.</li>
          <li>The information you give us, including your name and ceremony address, must be accurate.</li>
          <li>We may suspend accounts that are used fraudulently or abusively.</li>
        </ul>
      </section>
      <section>
        <h2>3. Bookings</h2>
        <ul>
          <li>A booking is a request until the purohit confirms it. Prices shown include the samagri kit and exclude the platform fee, which is shown before you pay.</li>
          <li>You can reschedule or cancel free of charge until the purohit sets off for your venue.</li>
          <li>If a purohit declines or cancels, you receive a full refund.</li>
        </ul>
      </section>
      <section>
        <h2>4. Payments and refunds</h2>
        <p>
          You can pay online (UPI, card or wallet) or after the ceremony. Refunds to your PurohitConnect wallet are immediate; refunds
          to UPI or cards are initiated immediately and usually arrive within 3–5 working days, depending on your bank. Coupons apply
          to the ceremony fee and are subject to the conditions shown with each code.
        </p>
      </section>
      <section>
        <h2>5. Purohits</h2>
        <p>
          Purohits must provide accurate information about their qualifications, perform ceremonies as described, arrive on time and
          treat families with respect. We verify purohits before their profiles go live and may suspend profiles that breach these
          standards.
        </p>
      </section>
      <section>
        <h2>6. Acceptable use</h2>
        <p>
          Don&apos;t misuse the service: no false bookings, harassment, attempts to take payments off-platform for bookings made here, or
          interference with the site&apos;s security.
        </p>
      </section>
      <section>
        <h2>7. Liability</h2>
        <p>
          We work hard to connect you with reliable purohits, but ceremonies are performed by independent providers. To the extent
          permitted by law, our liability for any booking is limited to the amount you paid for it.
        </p>
      </section>
      <section>
        <h2>8. Governing law and contact</h2>
        <p>
          These terms are governed by the laws of India. Questions or complaints: <a href="mailto:namaste@purohitconnect.in">namaste@purohitconnect.in</a>{" "}
          or 1800-123-4567. See also our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
