"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Background del hero: video de partículas en loop, full-bleed.
 *
 * Reemplazó al campo de partículas Canvas2D + blobs. Se pre-hornean dos
 * recortes del mismo source (9:16) con ffmpeg (ver `/public/hero/`):
 * - **Desktop**: recorte 16:9 (`particles-desktop.mp4`).
 * - **Mobile**: rotado + recorte 4:5 (`particles-mobile.mp4`) — más liviano y
 *   con orientación acorde al hero portrait.
 *
 * Se sirve UNA sola versión según viewport (matchMedia), no las dos, para no
 * gastar ancho de banda de más en mobile. El `poster` pinta al instante (LCP)
 * mientras el video baja en segundo plano.
 *
 * `prefers-reduced-motion`: no reproduce video — muestra el poster estático.
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
    mqMobile.addEventListener("change", update);
    mqReduce.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqReduce.removeEventListener("change", update);
    };
  }, []);

  // `muted` seteado por ref: React tiene un bug conocido donde el atributo
  // `muted` en JSX no siempre se refleja, y sin muted el autoplay se bloquea.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    // Algunos browsers necesitan un play() explícito tras setear muted.
    void v.play().catch(() => {});
  }, [mode, reduced]);

  const { src, poster } = SOURCES[mode];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden bg-surface-primary"
    >
      {reduced ? (
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        />
      ) : (
        <video
          key={mode}
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}

      {/* Overlay para mantener el contraste del texto del hero sobre el
          video. Sutil: más oscuro arriba-izquierda (donde va el título). */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-primary/55 via-surface-primary/15 to-surface-primary/40" />
    </div>
  );
}
