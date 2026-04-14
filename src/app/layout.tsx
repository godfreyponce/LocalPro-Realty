import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ListingProvider } from "@/context/ListingContext";
import { SiteHeader } from "@/components/SiteHeader";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LocalPRO Pipeline",
  description:
    "Listing intake, automated marketing, and pipeline tracking for real-estate teams.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-navy antialiased">
        <ListingProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-6 md:px-8">
            {children}
          </main>
        </ListingProvider>
      </body>
    </html>
  );
}
