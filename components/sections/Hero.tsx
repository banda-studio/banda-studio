import Link from "next/link";

import { HeroBackground } from "@/components/sections/HeroBackground";
import { LiquidGlass } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/ui/Reveal";

// `HeroForeground` (cubo de vidrio 3D con Three.js) está pausado hasta una
// V2. Se removió del código junto con three/@react-three para aligerar el
// bundle. Para retomarlo, recuperar los archivos del historial:
//   git show a39c4ca:components/sections/HeroForeground.tsx
//   git show a39c4ca:components/sections/GlassCube.tsx
// y reinstalar `three @react-three/fiber @react-three/drei @types/three`.

/**
 * Hero de la home V1.
 *
 * Dos capas:
 * - `HeroBackground` (`-z-10`) — ambient: blobs CSS + partículas Canvas2D
 *   reactivas al mouse.
 * - Contenido (default z) — título, subheader, CTA. Texto HTML normal, full
 *   SEO + a11y.
 *
 * Contenido alineado a la izquierda (igual que el Figma): badge "High-End"
 * inline con la primera palabra del título, subheader chico, CTA con border
 * gradient.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[80vh] items-center overflow-hidden rounded-b-section bg-surface-secondary md:min-h-screen"
    >
      <HeroBackground />

      {/* Mismo container que el Header: max-w + padding adentro. Garantiza
          que el contenido del hero se alinee verticalmente con el logo y
          los nav links sin importar el ancho de la pantalla. */}
      <Reveal
        stagger={0.12}
        className="relative mx-auto flex w-full max-w-[1440px] flex-col items-start gap-8 px-6 py-32 sm:px-10 lg:px-16"
      >
        <h1
          id="hero-title"
          className="text-hero font-semibold leading-[1.05] max-w-4xl"
        >
          <LiquidGlass className="rounded-tag px-4 py-1 align-middle [transform:rotate(-3.82deg)]">
            High-End
          </LiquidGlass>{" "}
          Digital
          <br />
          Creative Studio
        </h1>

        <p className="max-w-xl text-body-lg text-white/80">
          We bring technical precision to your creative vision.
        </p>

        {/* CTA glass — translúcido para que el video del fondo se vea a
            través (backdrop-blur suaviza), con hover notorio: el fondo se
            aclara, el borde pasa a accent y aparece un glow celeste. */}
        <Link
          href="/contact"
          className="rounded-pill border border-white/25 bg-white/10 px-7 py-2.5 text-caption font-medium text-ink-primary backdrop-blur-md transition-all duration-200 hover:border-accent/70 hover:bg-white/20 hover:shadow-[0_0_28px_rgba(112,190,250,0.4)] focus-visible:border-accent focus-visible:bg-white/20 focus-visible:outline-none"
        >
          Let&apos;s work together!
        </Link>
      </Reveal>
    </section>
  );
}

