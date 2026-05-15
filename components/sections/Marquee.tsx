import { Fragment } from "react";

import { marqueeSpecialties } from "@/lib/services";

/**
 * Sección "Our services" con marquee.
 *
 * Layout: título a la izquierda alineado con la grilla del sitio (max-w-1920
 * + padding). Lista de specialties full-bleed dentro del espacio restante;
 * los chips se salen del container max-w cuando hace falta y se cortan con
 * fades en ambos extremos.
 *
 * Loop infinito: la lista de specialties se duplica en el track y la
 * animación traduce el track de 0 a -50%, así cuando termina el primer set
 * está visualmente en la misma posición que el inicio del segundo set, y el
 * loop es seamless.
 *
 * Pause on hover (`hover:pause-marquee` que aplica
 * animation-play-state: paused). prefers-reduced-motion lo detiene también
 * (regla global en globals.css).
 */
export function Marquee() {
  return (
    <section
      aria-labelledby="marquee-title"
      className="overflow-hidden bg-surface-primary py-8"
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-10 px-6 sm:px-10 lg:px-16">
        <h2
          id="marquee-title"
          className="shrink-0 text-body font-normal leading-[1.15] sm:text-subtitle"
        >
          Our
          <br />
          services
        </h2>

        <div className="relative flex-1 overflow-hidden">
          {/* Edge fades para que los chips parezcan disolverse en los bordes. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface-primary to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface-primary to-transparent"
          />

          {/*
            Track. w-max para que sea tan ancho como su contenido (ambos sets
            duplicados juntos). animate-marquee desplaza -50% en loop.
            La lista se duplica para que el wrap-around sea seamless.
          */}
          <ul
            role="list"
            aria-label="Specialties"
            className="flex w-max items-center gap-6 animate-marquee [&:hover]:[animation-play-state:paused]"
          >
            {[...marqueeSpecialties, ...marqueeSpecialties].map(
              (specialty, i) => (
                <Fragment key={i}>
                  <li className="rounded-tag bg-[#f7f7f7]/[0.73] px-3 py-1 text-caption font-medium whitespace-nowrap text-ink-on-chip sm:px-5 sm:py-1.5 sm:text-body-lg">
                    {specialty}
                  </li>
                  {/* Separador: punto chico entre items. aria-hidden porque
                      es decoración pura — los items son la información. */}
                  <li
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-pill bg-white/40"
                  />
                </Fragment>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
