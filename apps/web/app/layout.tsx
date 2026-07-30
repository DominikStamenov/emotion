import type { Metadata } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@repo/motion";

import { AiConcierge } from "../components/ai-concierge";
import { ConsentManager } from "../components/consent-manager";
import { publicContactEmail, siteUrl } from "../lib/site";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  ...(publicContactEmail ? { email: publicContactEmail } : {}),
  logo: siteUrl + "/brand/emotion-mark-transparent-1024.png",
  name: "eMotion",
  url: siteUrl,
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  description:
    "Strategy, branding, digital design, development, motion and applied AI.",
  name: "eMotion",
  url: siteUrl,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "eMotion — Digital Agency",
    template: "%s | eMotion",
  },
  description:
    "eMotion is a digital agency combining strategy, branding, design, development, motion and AI.",
  applicationName: "eMotion",
  alternates: { canonical: "/" },
  openGraph: {
    description:
      "Strategy, branding, digital design, development, motion and applied AI — built as one connected agency.",
    locale: "en_US",
    siteName: "eMotion",
    title: "eMotion — Digital Agency",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Strategy, design, technology and motion for ambitious digital products.",
    title: "eMotion — Digital Agency",
  },
  icons: {
    icon: [
      {
        url: "/brand/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/brand/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    shortcut: "/brand/favicon.svg",
    apple: [
      {
        url: "/brand/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              organizationStructuredData,
              websiteStructuredData,
            ]),
          }}
        />
        <MotionProvider>
          {children}
          <AiConcierge />
          <ConsentManager />
        </MotionProvider>
      </body>
    </html>
  );
}
