import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PublicHeader } from "@/components/layout/PublicHeader";
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
  title: "Watchloom",
  description: "Discover movies and series, build watchlists, and track what to watch next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
        <PublicHeader />
        <div className="flex min-h-[calc(100vh-129px)] flex-col">{children}</div>
      </body>
    </html>
  );
}
