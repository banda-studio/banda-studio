"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { showcaseServices } from "@/lib/services";
import { YouTubeLoopVideo } from "@/components/ui/YouTubeLoopVideo";

/**
 * Sección "Featured services": los 3 servicios destacados (3D, 2D Motion, VFX)
 * apilados uno debajo del otro con **scroll normal**. Cada uno: header (título
 * + divider + descripción + "More Works") y un video full-width.
 *
 * Antes era un scroll-pin estilo Lusion (GSAP ScrollTrigger con crossfade);
 * se simplificó a un stack normal a pedido del diseño (frame Figma "1920w
 * dark"). Ya no usa GSAP.
 *
 * Video **responsive** (misma estrategia que el hero): 16:9 en desktop, 9:16
 * en mobile. Se renderiza SOLO la versión del viewport activo, y recién en
 * cliente (`mounted`), así en mobile no se baja el thumbnail de YouTube del
 * modo desktop. Client Component por el matchMedia + control de los <video>.
 */
export function ServicesShowcase() {
  // Fuente de video según viewport (lg = 1024px): desktop 16:9 (YouTube o
  // self-hosted), mobile 9:16 (self-hosted). `mounted` gatea el render para
  // que el SSR no emita ninguna fuente (el wrapper con aspect por CSS reserva
  // el espacio → sin CLS).
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    setMounted(true);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      aria-label="Featured services"
      // Sin padding-top: el espacio arriba de la card lo da el pb de la
      // sección de logos. Si sumáramos ambos, los logos quedarían con más
      // aire abajo que arriba (arriba solo aporta el pt de su sección).
      className="bg-surface-primary pb-8 lg:pb-10"
    >
      {/* Card negra full-width (rounded-section). El contenido va centrado en
          el max-w-[1440px] de adentro. */}
      <div className="w-full overflow-hidden rounded-section bg-surface-secondary">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-6 py-10 sm:px-10 lg:gap-24 lg:px-16 lg:py-14">
          {showcaseServices.map((service) => (
            <article key={service.slug} className="flex flex-col gap-6">
              {/* Header: título | divider | descripción + More Works */}
              <header className="flex flex-wrap items-center gap-6 lg:gap-10">
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
                    // Los 3 "More Works" comparten texto pero van a servicios
                    // distintos: el aria-label los distingue.
                    aria-label={`More Works — ${service.name}`}
                    className="inline-flex items-center gap-1 text-caption font-medium text-accent transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none"
                  >
                    More Works
                    <ChevronRight />
                  </Link>
                </div>
              </header>

              {/* Video. Wrapper con aspect responsive por CSS (9:16 mobile /
                  16:9 desktop): reserva el espacio desde el SSR → sin CLS. El
                  media se monta adentro (absolute inset-0) recién en cliente. */}
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl lg:aspect-video">
                {mounted &&
                  (isMobile ? (
                    // Mobile: recorte vertical 9:16 self-hosted.
                    <LoopVideo
                      src={service.mobile.src}
                      poster={service.mobile.poster}
                      title={`${service.name} — featured work`}
                      className="absolute inset-0"
                    />
                  ) : service.desktop.kind === "youtube" ? (
                    // Desktop 3D / 2D: embed de YouTube 16:9. El clip-path
                    // fuerza al iframe a respetar los corners redondeados.
                    <YouTubeLoopVideo
                      videoId={service.desktop.videoId}
                      title={`${service.name} — featured work`}
                      className="absolute inset-0 [clip-path:inset(0_round_1rem)]"
                    />
                  ) : (
                    // Desktop VFX: video self-hosted 16:9.
                    <LoopVideo
                      src={service.desktop.src}
                      poster={service.desktop.poster}
                      title={`${service.name} — featured work`}
                      className="absolute inset-0"
                    />
                  ))}
              </div>
            </article>
          ))}
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
 * Video self-hosted en loop. Muteado, y con IntersectionObserver para
 * reproducir SOLO cuando está en viewport — evita que en mobile los 3 videos
 * bajen/reproduzcan a la vez. `muted` por ref (el atributo JSX no siempre lo
 * refleja). `preload="none"` → no baja bytes hasta entrar en viewport.
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
