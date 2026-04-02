import type { Metadata } from "next";
import { Geist_Mono, Inter, Manrope } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const bodySans = Inter({
  variable: "--font-body-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const displaySans = Manrope({
  variable: "--font-display-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShoeClean",
  description: "Website order, pelacakan, dan dashboard outlet untuk bisnis perawatan sepatu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${bodySans.variable} ${geistMono.variable} ${displaySans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
