"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

  // Elegimos la fuente de video según viewport (lg = 1024px): desktop 16:9
  // (YouTube o self-hosted), mobile 9:16 (self-hosted). Renderizamos SOLO la
  // versión activa — así no se baja el video del breakpoint que no se ve.
  // Arranca en `false` (desktop) para el SSR; se corrige en el mount.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

          // Estado inicial: la primera card centrada y full; el resto
          // abajo (yPercent 100), un poco más chicas (scale 0.92) y
          // transparentes (opacity 0). El scale + opacity dan la sensación
          // de profundidad/capas en la transición.
          const SCALE_OUT = 0.92;
          gsap.set(items, {
            yPercent: 100,
            scale: SCALE_OUT,
            opacity: 0,
            transformOrigin: "50% 50%",
          });
          gsap.set(items[0], { yPercent: 0, scale: 1, opacity: 1 });

          // Distribución del scroll en "unidades de timeline" (proporciones;
          // el largo real lo fija `end` vía SLIDE_VH). LEAD_HOLD es más corto
          // que HOLD a propósito: la card 1 ya se ve durante el approach al
          // pin, así que si su hold fuera igual al resto, "del 1 al 2" se
          // sentiría más largo que las demás transiciones.
          const TRANS = 0.4; // duración de cada transición entre slides.
          const HOLD = 1.0; // descanso de cada slide intermedio (centrado).
          const LEAD_HOLD = 0.6; // descanso del primer slide (corto).
          const TRAIL_HOLD = 1.0; // descanso del último slide antes de salir.

          // Alto de scroll por slide (1 = 100vh = una pantalla). Subirlo hace
          // que cada servicio dure más scroll. Bajarlo lo acelera.
          const SLIDE_VH = 1.5;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              // SLIDE_VH * 100vh por slide. Más espacio = más hold visible.
              end: () =>
                `+=${items.length * window.innerHeight * SLIDE_VH}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Transiciones entre slides, posicionadas de forma acumulativa:
          // cada slide descansa y luego transiciona al siguiente. El primer
          // slide arranca tras LEAD_HOLD (corto); los demás tras HOLD.
          // - Saliente: sube (yPercent -100), se achica y se desvanece.
          // - Entrante: sube a centro (yPercent 0), crece y aparece.
          let pos = LEAD_HOLD;
          for (let i = 1; i < items.length; i++) {
            tl.to(
              items[i - 1],
              {
                yPercent: -100,
                scale: SCALE_OUT,
                opacity: 0,
                ease: "power2.inOut",
                duration: TRANS,
              },
              pos,
            ).to(
              items[i],
              {
                yPercent: 0,
                scale: 1,
                opacity: 1,
                ease: "power2.inOut",
                duration: TRANS,
              },
              pos,
            );
            pos += TRANS + HOLD;
          }

          // Descanso final del último slide antes de despinear.
          tl.to({}, { duration: TRAIL_HOLD });
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Featured services"
      className="flex min-h-screen items-center bg-surface-primary py-8 lg:py-10"
    >
      {/*
        Card negra FULL-WIDTH (w-full = 100vw, punta a punta). El contenido
        (los 3 servicios) va centrado en el max-w-[1440px] de adentro.

        overflow-hidden CRÍTICO: clipea las cards off-screen al borde de
        ESTA card (altura del contenido), no a 100vh. Con la card centrada
        en la section (min-h-screen), trasladar una slide `yPercent: 100`
        la saca exactamente un alto-de-card → 100% afuera y clippeada, sin
        asomar por abajo en pantallas altas.
      */}
      <div className="w-full overflow-hidden rounded-section bg-surface-secondary">
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
                    {isMobile ? (
                      // Mobile: recorte vertical 9:16 self-hosted.
                      <LoopVideo
                        src={service.mobile.src}
                        poster={service.mobile.poster}
                        title={`${service.name} — featured work`}
                        className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl"
                      />
                    ) : service.desktop.kind === "youtube" ? (
                      // Desktop 3D / 2D: embed de YouTube en 16:9. El
                      // clip-path fuerza al iframe a respetar los corners
                      // redondeados (overflow-hidden solo no alcanza con
                      // iframes en Chrome/Safari).
                      <YouTubeLoopVideo
                        videoId={service.desktop.videoId}
                        title={`${service.name} — featured work`}
                        className="relative aspect-video w-full overflow-hidden rounded-2xl [clip-path:inset(0_round_1rem)]"
                      />
                    ) : (
                      // Desktop VFX: video self-hosted en 16:9.
                      <LoopVideo
                        src={service.desktop.src}
                        poster={service.desktop.poster}
                        title={`${service.name} — featured work`}
                        className="relative aspect-video w-full overflow-hidden rounded-2xl"
                      />
                    )}
                  </div>
                </article>
              ))}
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

/**
 * Video self-hosted en loop para el showcase. Muteado, y con
 * IntersectionObserver para reproducir SOLO cuando está en viewport — evita
 * que en mobile los 3 videos bajen/reproduzcan a la vez. `muted` se setea por
 * ref (el atributo JSX no siempre lo refleja, y sin muted el autoplay se
 * bloquea). `preload="none"` → no baja bytes hasta que entra en viewport.
 */
function LoopVideo({
  src,
  poster,
  title,
  className,
}: {
  src: string;
  poster: string;
  title: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    const w = wrapRef.current;
    if (!v || !w) return;
    v.muted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(w);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={title}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
      />
    </div>
  );
}
