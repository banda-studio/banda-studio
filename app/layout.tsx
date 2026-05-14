import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import { LiquidGlassFilter } from "@/components/ui/LiquidGlassFilter";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Banda Studio — Coming Soon",
  description:
    "Digital Creative Studio. We bring technical precision to your creative vision. New site under construction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${monaSans.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-surface-primary text-ink-primary"
        suppressHydrationWarning
      >
        {/* SVG filter usado por todos los <LiquidGlass>. Una sola instancia. */}
        <LiquidGlassFilter />
        {children}
      </body>
    </html>
  );
}
