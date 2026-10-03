import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Story House | A Life Worth Telling",
  description:
    "The Story House — spacious residences, wellness-oriented amenities and everyday convenience at Sector 89A, Gurugram.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
