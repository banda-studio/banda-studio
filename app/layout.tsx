import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Banda Studio — Digital Creative Studio",
  description:
    "We bring technical precision to your creative vision. 3D, 2D Motion, VFX, Digital Design, Branding, UX/UI, Websites, Illustrations.",
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
      <body className="min-h-full flex flex-col bg-surface-primary text-ink-primary">
        {children}
      </body>
    </html>
  );
}
