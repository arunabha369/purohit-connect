import type { Metadata } from "next";
import { getCatalogPurohit, getServicesForPurohit, purohits } from "@/lib/catalog";

/** Pre-render every catalog profile; purohits approved later render on demand. */
export function generateStaticParams() {
  return purohits.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const purohit = getCatalogPurohit(params.id);
  if (!purohit) return { title: "Purohit profile" };
  const description = `${purohit.name} in ${purohit.city}: ${purohit.experience} years of experience in ${purohit.specializations.join(", ")}. Rated ${purohit.rating}/5 by ${purohit.reviewCount} families.`;
  return {
    title: `${purohit.name} — ${purohit.city}`,
    description,
    alternates: { canonical: `/purohit/${purohit.id}` },
    openGraph: { title: `${purohit.name} · PurohitConnect`, description, type: "profile" },
  };
}

export default function PurohitLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const purohit = getCatalogPurohit(params.id);
  const jsonLd = purohit && {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${purohit.name} — Purohit services`,
    provider: { "@type": "Person", name: purohit.name, knowsLanguage: purohit.languages },
    areaServed: purohit.city,
    serviceType: purohit.specializations,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: purohit.rating,
      reviewCount: purohit.reviewCount,
    },
    offers: getServicesForPurohit(purohit).map((s) => ({
      "@type": "Offer",
      name: s.name,
      price: s.basePrice,
      priceCurrency: "INR",
    })),
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Catalog data only; serialised with JSON.stringify and "<" escaped.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      {children}
    </>
  );
}
