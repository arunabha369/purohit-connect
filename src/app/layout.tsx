import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/booking-context";

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
  title: "PurohitConnect — Book Trusted Purohits for Every Occasion",
  description:
    "Find and book verified purohits for Griha Pravesh, Weddings, Satyanarayan Puja, and 50+ Vedic ceremonies. Trusted by 10,000+ families across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-cream-50 text-charcoal min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
