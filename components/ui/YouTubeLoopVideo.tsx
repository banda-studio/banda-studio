"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Embed de YouTube decorativo con loop "limpio" + lazy loading + pause
 * cuando está fuera del viewport.
 *
 * **Por qué lazy + pause-off-screen:**
 * - Sin esto, una página con 6-8 videos lanza 6-8 iframes en paralelo. Cada
 *   uno baja ~3-5 Mbps de HD → la red se satura, YouTube tira de quality, y
 *   aparecen los spinners de buffering.
 * - Con IntersectionObserver: el iframe NO se monta hasta que el tile entra
 *   al viewport (con `rootMargin: 300px`). Antes, mostramos un thumbnail.
 * - Cuando el tile sale del viewport, llamamos `pauseVideo()` para que el
 *   player deje de bajar bytes y libere CPU. Al reentrar, `playVideo()`.
 *
 * **Por qué loop vía IFrame API** (en vez de `loop=1&playlist=...`):
 * - El truco `loop=1 + playlist=videoId` hace que YouTube trate el embed
 *   como una playlist → muestra los controles ⏮ ⏸ ⏭ sobre el video.
 * - Acá usamos la API para reiniciar manualmente cuando el video termina,
 *   sin disparar el modo playlist. Resultado: cero controles visibles.
 */

interface YTPlayer {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setPlaybackQuality?: (quality: string) => void;
}

interface YTPlayerCtorOptions {
  events: {
    onStateChange?: (event: { data: number; target: YTPlayer }) => void;
    onReady?: (event: { target: YTPlayer }) => void;
  };
}

interface YTAPI {
  Player: new (
    element: HTMLIFrameElement | string,
    options: YTPlayerCtorOptions,
  ) => YTPlayer;
  PlayerState: { ENDED: number };
}

declare global {
  interface Window {
    YT?: YTAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTAPI> | null = null;

function loadYouTubeAPI(): Promise<YTAPI> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SSR"));
  }
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const prevHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevHandler?.();
      if (window.YT) resolve(window.YT);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });

  return apiPromise;
}

interface YouTubeLoopVideoProps {
  videoId: string;
  title: string;
  className?: string;
}

export function YouTubeLoopVideo({
  videoId,
  title,
  className,
}: YouTubeLoopVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  // `hasMounted` → true una vez que el tile entró por primera vez al
  // viewport. A partir de ahí el iframe queda montado (no lo desmontamos
  // al volver a salir; solo pausamos para ahorrar red sin reload).
  const [hasMounted, setHasMounted] = useState(false);
  // `inViewport` → true cuando el tile está actualmente visible. Drive
  // del play/pause.
  const [inViewport, setInViewport] = useState(false);

  // IntersectionObserver para detectar entrada/salida del viewport.
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasMounted(true);
        }
      },
      // `rootMargin: 300px` → empezamos a cargar 300px antes de que entre
      // al viewport. Cuando el usuario lo ve, ya está listo (sin spinner).
      { rootMargin: "300px" },
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Inicializar el YT.Player después de que el iframe esté montado.
  useEffect(() => {
    if (!hasMounted || !iframeRef.current || playerRef.current) return;

    let cancelled = false;
    loadYouTubeAPI()
      .then((YT) => {
        if (cancelled || !iframeRef.current) return;
        playerRef.current = new YT.Player(iframeRef.current, {
          events: {
            onReady: (e) => {
              // Sugerencia de calidad. YouTube puede ignorarla pero no
              // cuesta nada pedirla.
              try {
                e.target.setPlaybackQuality?.("hd1080");
              } catch {}
            },
            onStateChange: (e) => {
              // Loop manual: cuando termina, reiniciar. Sin playlist
              // controls.
              if (e.data === YT.PlayerState.ENDED) {
                e.target.seekTo(0, true);
                e.target.playVideo();
              }
            },
          },
        });
      })
      .catch(() => {
        // Si la API no carga (bloqueador, offline), el iframe igual va a
        // reproducir el video — solo no va a hacer loop. Aceptable.
      });

    return () => {
      cancelled = true;
    };
  }, [hasMounted]);

  // Play/pause según visibilidad. La API tira si el player aún no está
  // listo — wrapeamos en try/catch.
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (inViewport) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {
      // Ignorable: ocurre durante la transición ready/destroy.
    }
  }, [inViewport]);

  // Cleanup del player al desmontar todo el componente.
  useEffect(() => {
    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {}
    };
  }, []);

  const params = new URLSearchParams({
    enablejsapi: "1",
    autoplay: "1",
    mute: "1",
    controls: "0",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    vq: "hd1080",
    cc_load_policy: "0",
  });
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;

  // Thumbnail placeholder mientras el iframe no se monta. `maxresdefault`
  // suele ser 1280×720 pero algunos videos lo sirven en source-aspect.
  // Usamos `object-cover` para llenar el slot sin franjas negras.
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div ref={wrapperRef} className={className}>
      {hasMounted ? (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
