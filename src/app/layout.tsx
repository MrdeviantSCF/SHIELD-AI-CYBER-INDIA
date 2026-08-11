import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "Shield Cyber Forensic Investigation | Digital Forensics & Cyber Crime Investigation",
    template: "%s | Shield Cyber Forensic Investigation",
  },
  description:
    "Advanced cyber crime investigation, digital forensics and intelligence-driven evidence analysis for complex digital investigations.",
  metadataBase: new URL(process.env.APP_BASE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-shield-navy-950 text-shield-text">{children}</body>
    </html>
  );
}
