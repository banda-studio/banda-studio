import { Reveal } from "@/components/ui/Reveal";

/**
 * Frase grande de transición entre el showcase y el CTA final. Texto
 * centrado, regular, dos líneas. Sirve como "respiro" visual antes del
 * cierre de la home.
 *
 * El texto entra con un reveal (fade + blur + slide) al scrollear hasta él.
 */
export function Tagline() {
  return (
    <section
      aria-label="Studio philosophy"
      // Padding ajustado para unificar los gaps de esta zona: el marquee
      // "Our services" queda pegado arriba (~mismo aire que videos↔marquee) y
      // la frase no deja un hueco enorme antes del ContactCTA.
      className="bg-surface-primary pt-8 pb-16 lg:pt-10 lg:pb-20"
    >
      <div className="mx-auto flex w-full max-w-[1440px] justify-center px-6 sm:px-10 lg:px-16">
        <Reveal
          as="h2"
          className="mx-auto max-w-4xl text-center text-tagline font-normal text-ink-primary"
        >
          Whatever you&apos;re building,
          <br />
          we&apos;d love to be part of it.
        </Reveal>
      </div>
    </section>
  );
}
