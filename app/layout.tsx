import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { site } from "./lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),

  title: {
    default: `${site.name} | Apartments & Villas for Sale in Noida, Greater Noida & Gurgaon`,
    template: `%s | ${site.name}`,
  },

  description: site.description,

  alternates: {
    canonical: site.url,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Apartments & Villas for Sale`,
    description: site.description,
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Apartments & Villas for Sale`,
    description: site.description,
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}