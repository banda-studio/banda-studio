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
  title: "Banda Studio — Digital Creative Studio",
  description:
    "Independent creative studio bringing technical precision to your creative vision. 3D Works, 2D Motion, VFX, Graphic Design and Website.",
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
      <head>
        {/*
          Preconnect a los dominios de YouTube. Sin esto, el browser hace
          DNS lookup + TLS handshake en el momento que monta el primer
          <iframe>, agregando ~200-500ms de latencia antes de que llegue
          el primer byte del video. Con preconnect, esos round-trips se
          hacen en paralelo con el resto del HTML/CSS.

          - youtube-nocookie.com: origen del iframe (HTML del player).
          - i.ytimg.com: thumbnails que usamos como placeholder.
          - s.ytimg.com: assets/scripts del player (IFrame API).
          - googlevideo.com: CDN real donde vive el .mp4/.m4s del video.
        */}
        <link
          rel="preconnect"
          href="https://www.youtube-nocookie.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://i.ytimg.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://s.ytimg.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.google.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://googlevideo.com" />
      </head>
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
