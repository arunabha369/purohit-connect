import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PurohitConnect — Book trusted purohits for every occasion",
    template: "%s · PurohitConnect",
  },
  description:
    "Find and book verified purohits for Griha Pravesh, weddings, Satyanarayan Puja and 50+ Vedic ceremonies. Transparent pricing, complete samagri, trusted by 10,000+ families across India.",
  applicationName: "PurohitConnect",
  openGraph: {
    title: "PurohitConnect — Book trusted purohits",
    description: "Verified purohits, transparent pricing and complete samagri for every Vedic ceremony.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Brass kalash and puja bell" }],
    type: "website",
    locale: "en_IN",
    siteName: "PurohitConnect",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#09090d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
