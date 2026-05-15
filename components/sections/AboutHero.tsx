import { LiquidGlass } from "@/components/ui/LiquidGlass";

/**
 * Hero del /about. Layout asimétrico editorial:
 *
 * - Eyebrow chico "About Us" arriba (uppercase + tracking).
 * - Statement / claim grande (text-hero) en la columna izquierda (7/12).
 *   Funciona como h1 y como gancho — pensado para que el ojo siga a la
 *   columna de al lado para enterarse "quiénes" y "qué hacen".
 * - Columna derecha (5/12): 3 párrafos de detalle. El chip LiquidGlass de
 *   "Argentina" vive acá (mismo gesto visual que "High-End" en el hero
 *   de home y "idea?" en el ContactCTA — atadura entre páginas).
 *
 * En mobile las columnas se apilan (grid-cols-1 por default) y el
 * statement baja a `text-tagline` para que no rompa.
 *
 * Server Component.
 */
export function AboutHero() {
  return (
    <section
      aria-labelledby="about-title"
      className="bg-surface-primary px-6 pt-24 pb-8 sm:px-10 lg:px-16 lg:pt-32 lg:pb-12"
    >
      <div className="mx-auto max-w-[1440px]">
        <p className="text-caption font-medium uppercase tracking-[0.18em] text-white/50">
          About Us
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <h1
            id="about-title"
            className="text-tagline font-semibold leading-[1.1] lg:col-span-7 lg:text-hero lg:leading-[1.05]"
          >
            Visuals that pop, flow, and leave a mark.
          </h1>

          <div className="flex max-w-md flex-col gap-6 lg:col-span-5 lg:pt-4">
            <p className="text-body text-white/85">
              We&apos;re a post-production studio based in{" "}
              <LiquidGlass className="rounded-tag px-3 py-0.5 align-middle italic [transform:rotate(-3deg)]">
                Argentina
              </LiquidGlass>
              , creating cool stuff for clients all over the world.
            </p>
            <p className="text-body text-white/70">
              We do 2D &amp; 3D animation, design, modeling, and VFX — everything
              from motion graphics and character animation to CGI, texturing,
              lighting, and compositing. Basically, if it moves (or should), we
              can bring it to life.
            </p>
            <p className="text-body text-white/70">
              We&apos;ve had the chance to work with amazing brands like
              Coca-Cola, DoorDash, Netflix, Revolut, Cartoon Network, Cabify,
              etc.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
