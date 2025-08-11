import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GlobeNormad - Your Personal Travel Dashboard",
  description: "Plan trips, explore destinations, and manage your travel adventures with GlobeNormad",
  keywords: ["travel planning", "trip management", "destination explorer", "travel dashboard"],
  openGraph: {
    title: "GlobeNormad - Your Personal Travel Dashboard",
    description: "Plan trips, explore destinations, and manage your travel adventures with GlobeNormad",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobeNormad - Your Personal Travel Dashboard",
    description: "Plan trips, explore destinations, and manage your travel adventures with GlobeNormad",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
