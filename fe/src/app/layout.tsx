import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
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
        <ApolloWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
