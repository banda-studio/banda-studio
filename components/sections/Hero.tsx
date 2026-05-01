import { CONTACT_EMAIL } from "@/lib/services";

/**
 * Hero de la home V1.
 *
 * Background: placeholder con tres blobs translúcidos (blanco / blanco sucio)
 * con blur fuerte y animaciones distintas. Sustituto temporal del humo
 * fluido reactivo al mouse que iba a hacerse en Spline. Cuando se reemplace,
 * solo cambia el contenido del componente HeroBackground; el resto queda igual.
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
      <div className="relative mx-auto flex w-full max-w-[1920px] flex-col items-start gap-8 px-6 py-32 sm:px-10">
        <h1
          id="hero-title"
          className="text-hero font-semibold leading-[1.05] max-w-4xl"
        >
          <span className="inline-block rounded-tag bg-glass-light backdrop-blur-md px-4 py-1 align-middle [transform:rotate(-3.82deg)]">
            High-End
          </span>{" "}
          Digital
          <br />
          Creative Studio
        </h1>

        <p className="text-body-lg text-white/80 max-w-xl">
          We bring technical precision to your creative vision.
        </p>

        {/* CTA — solid center + gradient border (patrón del design system). */}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="rounded-pill border border-transparent px-9 py-3 text-body font-medium text-ink-primary transition-opacity hover:opacity-90 [background:linear-gradient(var(--color-surface-primary),var(--color-surface-primary))_padding-box,linear-gradient(135deg,var(--color-accent),var(--color-border-fade))_border-box]"
        >
          Let&apos;s work together!
        </a>
      </div>
    </section>
  );
}

/**
 * Background placeholder. Tres blobs grandes con blur fuerte, animaciones
 * existentes (--animate-blob-1 / blob-2). Etereo, sugiere humo blanco
 * difuso sobre fondo casi negro.
 */
function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-1/3 -left-1/3 h-[60vmax] w-[60vmax] rounded-pill bg-white/15 blur-[150px] animate-blob-1" />
      <div className="absolute top-1/4 right-0 h-[50vmax] w-[50vmax] translate-x-1/4 rounded-pill bg-white/10 blur-[120px] animate-blob-2" />
      <div className="absolute -bottom-1/4 left-1/4 h-[55vmax] w-[55vmax] rounded-pill bg-[#e8e2d5]/12 blur-[140px] animate-blob-1" />
    </div>
  );
}
