"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { showcaseServices } from "@/lib/services";
import { YouTubeLoopVideo } from "@/components/ui/YouTubeLoopVideo";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sección "Services" estilo Lusion (lite).
 *
 * Layout: tarjeta negra (rounded-section) con título + descripción arriba y
 * video full-width abajo. En desktop, al llegar a la sección el contenido
 * queda pinneado y mientras scrolleás los servicios entran por abajo / salen
 * por arriba — sin fade, sin solapamiento (al cruzarse las dos cards ocupan
 * mitades distintas del slot).
 *
 * Timing por slide:
 * - 100vh por slide (3 slides → 300vh de scroll total).
 * - 75vh de "hold" (card centrada, video reproduciéndose) + 25vh de transición.
 *
 * Implementación:
 * - Grid 1×1 con todos los slides apilados ([grid-area:1/1]) — el container
 *   se dimensiona al slide más alto y los slides comparten posición exacta.
 * - GSAP timeline con scrub. Cards 2..N inician en yPercent: 100 (off-screen
 *   abajo). Cada transición traduce simultáneamente -100 la saliente y 0 la
 *   entrante.
 * - `gsap.matchMedia` solo monta el efecto en (lg:+) sin prefers-reduced-motion.
 *   En cualquier otro caso, Tailwind cae a una lista vertical normal.
 */
export function ServicesShowcase() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const items = gsap.utils.toArray<HTMLElement>(
            "[data-showcase-item]",
            root.current,
          );
          if (items.length < 2) return;

          // Initial state: first centered, resto off-screen abajo.
          gsap.set(items, { yPercent: 100 });
          gsap.set(items[0], { yPercent: 0 });

          const HOLD = 0.75; // 75% del slot es "hold"; 25% es transición.

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              // 100vh por slide. Más espacio = más tiempo de hold visible.
              end: () => `+=${items.length * window.innerHeight}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Transiciones entre slides consecutivos. Posición en timeline:
          // slide i empieza a entrar en (i - 0.25), llega a centro en i.
          for (let i = 1; i < items.length; i++) {
            const transitionStart = i - (1 - HOLD);
            tl.to(
              items[i - 1],
              {
                yPercent: -100,
                ease: "power2.inOut",
                duration: 1 - HOLD,
              },
              transitionStart,
            ).to(
              items[i],
              {
                yPercent: 0,
                ease: "power2.inOut",
                duration: 1 - HOLD,
              },
              transitionStart,
            );
          }

          // Extender la timeline hasta items.length para que la última card
          // tenga su hold final antes de unpinear.
          tl.to({}, { duration: HOLD }, items.length - HOLD);
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Featured services"
      className="bg-surface-primary"
    >
      {/* overflow-hidden es CRÍTICO: corta las cards que están off-screen. */}
      <div className="overflow-hidden rounded-section bg-surface-secondary">
        <div className="flex min-h-screen items-center py-8 lg:py-10">
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
            <div className="relative flex flex-col gap-12 motion-safe:lg:grid">
              {showcaseServices.map((service) => (
                <article
                  key={service.slug}
                  data-showcase-item
                  className="flex flex-col gap-6 motion-safe:lg:[grid-area:1/1] motion-safe:lg:will-change-transform"
                >
                  {/* Header: title | description + More Works */}
                  <header className="flex flex-wrap items-center gap-6 px-8 pt-8 lg:gap-10 lg:px-12 lg:pt-10">
                    <h2 className="text-tagline font-semibold whitespace-nowrap">
                      {service.name}
                    </h2>
                    <div
                      aria-hidden="true"
                      className="hidden h-12 w-px shrink-0 bg-white/20 lg:block"
                    />
                    <div className="flex max-w-xl flex-col items-start gap-1">
                      <p className="text-body text-white/80">
                        {service.description}
                      </p>
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center gap-1 text-caption font-medium text-accent transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none"
                      >
                        More Works
                        <ChevronRight />
                      </Link>
                    </div>
                  </header>

                  {/*
                    Video container. Pegado al borde IZQUIERDO de la tarjeta
                    (sin padding-left) y con padding a la derecha + abajo.
                    El video tiene rounded solo en las esquinas derechas — las
                    izquierdas hacen match con la curvatura del contenedor
                    exterior.
                  */}
                  <div className="px-8 pb-8 lg:px-12 lg:pb-12">
                    <YouTubeLoopVideo
                      videoId={service.videoId}
                      title={`${service.name} — featured work`}
                      // `cover` + `clip-path:inset(0_round_1rem)` matchea
                      // rounded-2xl (1rem). El cover escala el iframe 125%
                      // vertical para que un video 16:9 llene el wrapper
                      // 2.22:1 sin pillarbox; el clip-path fuerza al
                      // iframe a respetar los 4 corners redondeados
                      // (overflow-hidden + rounded solo no alcanza con
                      // iframes en Chrome/Safari).
                      cover
                      className="relative aspect-[1731/781] max-h-[70vh] w-full overflow-hidden rounded-2xl [clip-path:inset(0_round_1rem)]"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
