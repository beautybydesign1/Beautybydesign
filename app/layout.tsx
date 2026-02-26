import type { Metadata } from "next";
import { Playfair_Display, Inter, DM_Mono } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading-loaded",
  display: "swap",
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-loaded",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Beauty by Design | Book Your Appointment",
  description:
    "A luxury home beauty booking experience with instant pricing, transparent travel fees, and secure deposit — all in under 2 minutes.",
  keywords: [
    "beauty",
    "makeup",
    "booking",
    "Middletown",
    "Delaware",
    "mobile salon",
    "home service",
  ],
  openGraph: {
    title: "Beauty by Design | Book Your Appointment",
    description:
      "Book your personalized beauty service with transparent pricing and instant confirmation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${inter.variable} ${dmMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
