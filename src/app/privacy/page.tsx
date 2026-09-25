import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PurohitConnect collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="25 September 2026">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: mobile number, name, email (optional) and city.</li>
          <li>Booking details: ceremony, date and time, venue address, notes you add, and payment method.</li>
          <li>Reviews you write and the purohits you save.</li>
          <li>For purohits: application details, qualifications and availability.</li>
        </ul>
      </section>
      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To create your account, process bookings and payments, and send booking updates.</li>
          <li>To share the details a purohit needs to perform your ceremony. Your full address is shared only after they confirm.</li>
          <li>To provide support, prevent fraud and improve the service.</li>
        </ul>
        <p>We don&apos;t sell your personal data.</p>
      </section>
      <section>
        <h2>Who we share it with</h2>
        <p>
          The purohit you book, payment processors that handle online payments, and service providers that help us run the platform,
          each only as much as they need. We may disclose information where required by law.
        </p>
      </section>
      <section>
        <h2>Storage on your device</h2>
        <p>
          We use your browser&apos;s local storage to keep you signed in and remember your preferences. You can clear it at any time from
          your browser settings.
        </p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>
          Under India&apos;s Digital Personal Data Protection Act, 2023 you can ask to access, correct or erase your personal data and
          withdraw consent. Write to <a href="mailto:privacy@purohitconnect.in">privacy@purohitconnect.in</a> and we&apos;ll respond
          within 30 days.
        </p>
      </section>
      <section>
        <h2>Retention and security</h2>
        <p>
          We keep booking records for as long as needed to provide the service and meet legal and tax obligations, then delete or
          anonymise them. Data is encrypted in transit and access is limited to staff who need it.
        </p>
      </section>
    </LegalPage>
  );
}
