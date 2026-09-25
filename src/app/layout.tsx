import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/booking-context";
import { ToastProvider } from "@/components/ui/toast";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "PurohitConnect — Book trusted purohits for every occasion",
    template: "%s · PurohitConnect",
  },
  description:
    "Find and book verified purohits for Griha Pravesh, weddings, Satyanarayan Puja and 50+ Vedic ceremonies. Transparent pricing, complete samagri, trusted by 10,000+ families across India.",
  applicationName: "PurohitConnect",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "PurohitConnect — Book trusted purohits",
    description: "Verified purohits, transparent pricing and complete samagri for every Vedic ceremony.",
    images: ["/hero-bg.png"],
    type: "website",
    locale: "en_IN",
  },
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
    <html lang="en-IN" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <AppProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
