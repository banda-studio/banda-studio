"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background del hero: video de partículas en loop, full-bleed.
 *
 * Dos capas:
 * 1. **Poster `<img>`** — SIEMPRE en el HTML inicial, con `fetchpriority=high`.
 *    Es el LCP: pinta al instante, es descubrible sin JS, y no arrastra el mp4.
 * 2. **`<video>`** — se monta SOLO en el cliente, después de que `matchMedia`
 *    decide el viewport. Así se baja UNA sola versión (desktop 16:9 o mobile
 *    9:16), no las dos. Antes, renderizar el video en el SSR con `preload=auto`
 *    hacía que en mobile se bajara también el mp4 de desktop (~5 MB de más).
 *
 * `prefers-reduced-motion`: no monta el video — queda el poster estático.
 *
 * Todo es decoración → `aria-hidden`. Client Component (matchMedia + control
 * del elemento <video>).
 */
const SOURCES = {
  desktop: {
    src: "/hero/particles-desktop.mp4",
    poster: "/hero/particles-desktop.jpg",
  },
  mobile: {
    src: "/hero/particles-mobile.mp4",
    poster: "/hero/particles-mobile.jpg",
  },
} as const;

type Mode = keyof typeof SOURCES;

export function HeroBackground() {
  // `mounted` arranca en false → en el SSR y el primer render solo va el
  // poster. El <video> aparece tras el mount (cliente), con el mode ya resuelto.
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("desktop");
  const [reduced, setReduced] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setMode(mqMobile.matches ? "mobile" : "desktop");
      setReduced(mqReduce.matches);
    };
    update();
    setMounted(true);
    mqMobile.addEventListener("change", update);
    mqReduce.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqReduce.removeEventListener("change", update);
    };
  }, []);

  // `muted` por ref (React no siempre refleja el atributo, y sin muted el
  // autoplay se bloquea). Play explícito por si el browser no arranca solo.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    void v.play().catch(() => {});
  }, [mode, mounted]);

  const { src, poster } = SOURCES[mode];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden bg-surface-primary"
    >
      {/* Poster (LCP): en el HTML inicial, alta prioridad, sin lazy. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Video: solo en cliente y si no hay reduced-motion. Se baja una sola
          versión (la del viewport activo). */}
      {mounted && !reduced && (
        <video
          key={mode}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}

      {/* Overlay para el contraste del texto del hero. */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-primary/55 via-surface-primary/15 to-surface-primary/40" />
    </div>
  );
}
