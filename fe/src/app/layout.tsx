import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Globenomad - Your Personal Travel Dashboard",
  description: "Plan trips, explore destinations, and manage your travel adventures with Globenomad",
  keywords: ["travel planning", "trip management", "destination explorer", "travel dashboard"],
  openGraph: {
    title: "Globenomad - Your Personal Travel Dashboard",
    description: "Plan trips, explore destinations, and manage your travel adventures with Globenomad",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Globenomad - Your Personal Travel Dashboard",
    description: "Plan trips, explore destinations, and manage your travel adventures with Globenomad",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
