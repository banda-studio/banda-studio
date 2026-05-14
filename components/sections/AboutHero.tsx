/**
 * Hero del /about. Más calmo que el de la home — texto sobre `surface-primary`,
 * título grande + bloque de copy en 4 párrafos.
 *
 * Mismo container que el resto del sitio (`max-w-[1440px]` + paddings
 * estándar). Sin partículas ni background animado para que el contenido
 * respire y se lea.
 *
 * Server Component.
 */
export function AboutHero() {
  return (
    <section
      aria-labelledby="about-title"
      className="bg-surface-primary px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px]">
        <h1
          id="about-title"
          className="text-hero font-semibold leading-[1.05]"
        >
          About Us
        </h1>

        <div className="mt-12 flex max-w-3xl flex-col gap-6">
          <p className="text-body-lg text-white/85">
            We&apos;re a post-production studio based in Argentina, creating
            cool stuff for clients all over the world.
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
          <p className="text-body text-white/70">
            Wherever you are, we&apos;re here to make visuals that pop, flow,
            and leave a mark.
          </p>
        </div>
      </div>
    </section>
  );
}
