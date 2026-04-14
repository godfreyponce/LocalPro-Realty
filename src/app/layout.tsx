import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ListingProvider } from "@/context/ListingContext";
import { SiteHeader } from "@/components/SiteHeader";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LocalPRO Realty — Listing Pipeline",
  description:
    "Listing intake, automated marketing, and pipeline tracking for LocalPRO Realty.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
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
