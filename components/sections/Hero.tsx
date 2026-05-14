import { HeroBackground } from "@/components/sections/HeroBackground";
import { LiquidGlass } from "@/components/ui/LiquidGlass";
import { CONTACT_EMAIL } from "@/lib/services";

// `HeroForeground` (cubo de vidrio 3D) está pausado hasta una V2. Cuando
// se retome, importarlo y agregar `<HeroForeground />` antes del cierre
// de la `<section>`. El componente sigue existiendo en disco.
// import { HeroForeground } from "@/components/sections/HeroForeground";

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
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <HeroBackground />

      {/* Mismo container que el Header: max-w + padding adentro. Garantiza
          que el contenido del hero se alinee verticalmente con el logo y
          los nav links sin importar el ancho de la pantalla. */}
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-start gap-8 px-6 py-32 sm:px-10 lg:px-16">
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

        {/* CTA — solid center + gradient border (patrón del design system). */}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="rounded-pill border border-transparent px-7 py-2.5 text-caption font-medium text-ink-primary transition-opacity hover:opacity-90 [background:linear-gradient(var(--color-surface-primary),var(--color-surface-primary))_padding-box,linear-gradient(135deg,var(--color-accent),var(--color-border-fade))_border-box]"
        >
          Let&apos;s work together!
        </a>
      </div>
    </section>
  );
}

