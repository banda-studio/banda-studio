import Link from "next/link";

import { LiquidGlass } from "@/components/ui/LiquidGlass";
import { YouTubeLoopVideo } from "@/components/ui/YouTubeLoopVideo";

interface ServicePageHeroProps {
  name: string;
  description: string;
  /**
   * Video que va de fondo en el hero. Loopea, sin sonido, en HD. Por
   * convención mando el primer proyecto del servicio (mismo que aparece en
   * el showcase de la home), que suele ser el "hero piece".
   */
  heroVideoId: string;
}

/**
 * Hero de las páginas internas `/services/[slug]`.
 *
 * Layout (matchea el frame "Interna" del Figma):
 * - **Desktop (lg+)**: aspect ratio `1920/826` (≈2.32:1, cinematográfico).
 *   Video full-bleed de fondo con técnica de cover: iframe a 115% width
 *   centrado verticalmente, cropea la rama del player de YouTube en los
 *   costados y extiende top/bottom para llenar el slot 2.32:1 con un video
 *   16:9. Overlay oscuro suave para mantener la card legible.
 * - **Mobile (< lg)**: 80vh con gradient placeholder. El cover en portrait
 *   no funciona bien con un video 16:9 (quedan barras grandes), así que
 *   degrada a gradient — más rápido y limpio.
 *
 * Card centrada con título grande, descripción de 2 líneas y CTA pill con
 * border gradient (mismo patrón que el hero de la home).
 *
 * Server Component.
 */
export function ServicePageHero({
  name,
  description,
  heroVideoId,
}: ServicePageHeroProps) {
  return (
    <section
      aria-labelledby="service-title"
      className="relative min-h-[80vh] overflow-hidden lg:aspect-[1920/826] lg:min-h-0"
    >
      {/* Desktop: video background — solo lg:+ porque en mobile el cover no
          funciona bien con 16:9 en un container portrait. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block"
      >
        <YouTubeLoopVideo
          videoId={heroVideoId}
          title=""
          // Cover: 130% width + aspect 16:9 + centro vertical. El extra de
          // oversize cropea agresivamente el branding de YouTube (título y
          // watermark en los corners) y a la vez extiende el video para
          // llenar el slot 2.32:1 sin franjas pillarboxed.
          className="pointer-events-none absolute top-1/2 left-[-15%] aspect-video w-[130%] -translate-y-1/2 border-0"
        />
        {/* Overlay oscuro suave para que la card destaque sobre el video. */}
        <div className="absolute inset-0 bg-surface-primary/45" />
      </div>

      {/* Mobile: gradient placeholder */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(112,190,250,0.18),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(232,226,213,0.12),transparent_55%),linear-gradient(180deg,var(--color-surface-primary),var(--color-surface-secondary))] lg:hidden"
      />

      {/*
        Service info — una SOLA box LiquidGlass envuelve título, bajada y CTA.
        `tone="subtle"` la oscurece para mejor lectura sobre el video y
        atenúa los highlights "curvos" que en una caja rectangular grande
        quedaban raros (ahí donde aparecía el reflejo celeste).
      */}
      <div className="relative flex h-full items-center justify-center px-6 py-16 sm:px-10 lg:px-16 lg:py-0">
        <LiquidGlass
          tone="subtle"
          layout="block"
          className="mx-auto w-full max-w-xl flex-col items-center gap-5 rounded-[2rem] px-8 py-10 text-center lg:max-w-2xl lg:px-12 lg:py-12"
        >
          <h1
            id="service-title"
            className="text-hero font-semibold leading-[1.05]"
          >
            {name}
          </h1>
          <p className="text-body-lg text-white/85">{description}</p>
          <Link
            href="/contact"
            className="mt-2 rounded-pill border border-transparent px-6 py-2 text-caption font-medium text-ink-primary transition-opacity hover:opacity-90 [background:linear-gradient(var(--color-surface-secondary),var(--color-surface-secondary))_padding-box,linear-gradient(135deg,var(--color-accent),var(--color-border-fade))_border-box]"
          >
            Let&apos;s work together
          </Link>
        </LiquidGlass>
      </div>
    </section>
  );
}
