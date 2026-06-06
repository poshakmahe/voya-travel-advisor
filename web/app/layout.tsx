import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { TripProvider } from "@/lib/store";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voya — Design your trip",
  description: "A playful way to share how you love to travel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <TripProvider>{children}</TripProvider>
      </body>
    </html>
  );
}
