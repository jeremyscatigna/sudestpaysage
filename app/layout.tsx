import type { Metadata, Viewport } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";

import { Analytics } from "@/components/analytics";
import { CallButton } from "@/components/call-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/json-ld";
import { localBusinessSchema } from "@/lib/schema";
import { site } from "@/lib/site";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – ${site.tagline} | Nice, Cannes, Antibes`,
    template: `%s | ${site.name}`,
  },
  description:
    "Élagage, abattage, débroussaillage (OLD), aménagement paysager et traitement des palmiers sur toute la Côte d'Azur. Devis gratuit sous 24h.",
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.founder,
  publisher: site.name,
  formatDetection: { telephone: true, address: true, email: true },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    images: [
      {
        url: site.ogImage,
        width: 1200,
        height: 630,
        alt: `${site.name} – élagueur et paysagiste sur la Côte d'Azur`,
      },
    ],
  },
  twitter: { card: "summary_large_image", images: [site.ogImage] },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#182720",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} className={`${playfair.variable} ${workSans.variable}`}>
      <body className="min-h-screen bg-forest-900 text-sage-100 antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-sm focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-forest-900"
        >
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />
        <CallButton />
        <JsonLd data={localBusinessSchema()} />
        <Analytics />
      </body>
    </html>
  );
}
