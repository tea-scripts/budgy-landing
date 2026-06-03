import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Finby — Stop tracking. Start talking.",
    template: "%s | Finby",
  },
  description:
    "The AI finance companion that logs your expenses, tracks your budget, " +
    "and gives you real advice — all through conversation. No forms. No dashboards. Just chat.",
  keywords: [
    "personal finance app",
    "AI budget tracker",
    "conversational finance",
    "multi-currency budget",
    "money management",
    "AI financial assistant",
  ],
  authors: [{ name: "Finby" }],
  creator: "Finby",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Finby",
    title: "Finby — Stop tracking. Start talking.",
    description:
      "The AI finance companion that logs, tracks, and advises through conversation.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Finby" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finby — Stop tracking. Start talking.",
    description:
      "The AI finance companion that logs, tracks, and advises through conversation.",
    images: ["/og-image.png"],
    creator: "@finbyapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d6ef5",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Finby",
      description: "AI-powered conversational personal finance app",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/?s={query}`,
        },
        "query-input": "required name=query",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#app`,
      name: "Finby",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web, iOS, Android",
      description: "Conversational AI personal finance companion",
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
        { "@type": "Offer", price: "4.99", priceCurrency: "USD", name: "Pro" },
        { "@type": "Offer", price: "9.99", priceCurrency: "USD", name: "Premium" },
        { "@type": "Offer", price: "14.99", priceCurrency: "USD", name: "Family" },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // JSON-LD is a static, fully-controlled object (no user input). Rendered as
  // script text children — avoids dangerouslySetInnerHTML. The payload contains
  // no `<`, `>` or `&`, so React's text escaping cannot corrupt it.
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
