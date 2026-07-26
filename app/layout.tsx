import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { LiquidGlassFilter } from "@/components/ui/LiquidGlassFilter";
import { SITE_URL, CONTACT_EMAIL } from "@/lib/services";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_DESCRIPTION =
  "Independent creative studio bringing technical precision to your creative vision — 3D, 2D Motion, VFX, and design.";

export const metadata: Metadata = {
  // Base para resolver URLs relativas (canonical, OG image, etc.) a absolutas.
  // Sin esto, Next emite un warning y las OG images no resuelven bien.
  metadataBase: new URL(SITE_URL),
  title: {
    // `default` para la home; `template` para que las páginas hijas que setean
    // solo `title: "About"` queden como "About — Banda Studio" sin repetir el
    // sufijo a mano. Las que ya incluyen "— Banda Studio" usan `absolute`.
    default: "Banda Studio — Digital Creative Studio",
    template: "%s — Banda Studio",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Banda Studio",
  authors: [{ name: "Banda Studio" }],
  creator: "Banda Studio",
  // OG + Twitter base. NO seteamos title/description acá a propósito: así
  // Next los hereda del title/description resuelto de cada página (con el
  // template "%s — Banda Studio"), y el og:title de /about queda "About —
  // Banda Studio" en vez del genérico. El resto (siteName, tipo, imagen) sí
  // se comparte. La OG image la inyecta Next desde `app/opengraph-image`.
  openGraph: {
    type: "website",
    siteName: "Banda Studio",
    locale: "en_US",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

// `themeColor` va en el export `viewport` (no en `metadata`) — Next lo pide así
// desde v14. Pinta la barra del browser en mobile del color del fondo.
export const viewport: Viewport = {
  themeColor: "#0A0A0A",
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
          Hints para los dominios de YouTube. YouTube solo se usa
          below-the-fold (showcase desktop + service pages) y lazy, así que
          preconnectar muchos orígenes al load deja conexiones sin usar y
          Lighthouse lo marca ("más de 4 preconnect").

          - Solo los 2 críticos como `preconnect` (handshake completo):
            youtube-nocookie.com (iframe) e i.ytimg.com (thumbnails), que son
            lo primero que pide el player.
          - El resto como `dns-prefetch` (solo resuelve DNS, mucho más barato):
            s.ytimg.com (scripts) y googlevideo.com (CDN del video).
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
        <link rel="dns-prefetch" href="https://s.ytimg.com" />
        <link rel="dns-prefetch" href="https://googlevideo.com" />
      </head>
      <body
        className="min-h-full flex flex-col bg-surface-primary text-ink-primary"
        suppressHydrationWarning
      >
        {/*
          JSON-LD structured data (schema.org Organization). Ayuda a Google a
          armar el knowledge panel / rich results con el nombre, logo y datos
          del estudio. `sameAs` (redes sociales) queda vacío por ahora —
          agregar los links de Instagram/LinkedIn/etc. cuando estén.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Banda Studio",
              alternateName: "Banda",
              url: SITE_URL,
              logo: `${SITE_URL}/icon.svg`,
              email: CONTACT_EMAIL,
              description:
                "Independent creative studio bringing technical precision to your creative vision — 3D, 2D Motion, VFX, design, and websites.",
              foundingLocation: { "@type": "Place", name: "Argentina" },
              sameAs: [],
            }),
          }}
        />

        {/* SVG filter usado por todos los <LiquidGlass>. Una sola instancia. */}
        <LiquidGlassFilter />
        {children}
        {/*
          Vercel Analytics (visitas / page views) + Speed Insights (Core Web
          Vitals reales de usuarios). Solo envían datos en el deploy de Vercel;
          en dev y en otros hosts son no-ops. Van al final del body para no
          bloquear el render del contenido.
        */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
