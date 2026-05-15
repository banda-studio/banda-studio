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
  getCurrentTime?: () => number;
  getDuration?: () => number;
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
  // `hasPlayed` → true una vez que YouTube reporta estado PLAYING al menos
  // una vez. Entre que el iframe monta y empieza a reproducir, YouTube
  // muestra brevemente su UI de loading/play (botón central). Mantenemos
  // el iframe en opacity-0 hasta PLAYING para esconder ese flash.
  const [hasPlayed, setHasPlayed] = useState(false);
  // `thumbSrc` arranca con `maxresdefault.jpg` (1280×720). YouTube no lo
  // genera para todos los videos — cuando no existe devuelve un stub gris
  // de 120×90. Si el onLoad detecta esa dimensión, caemos a `hqdefault.jpg`
  // (480×360) que existe para cualquier video subido.
  const [thumbSrc, setThumbSrc] = useState(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  );

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
      // `rootMargin: 600px` → empezamos a cargar bien antes (~media
      // pantalla) de que entre al viewport. Cuando el usuario lo ve,
      // ya está listo (sin spinner). Trade-off: usa más bandwidth en
      // scrolls largos, pero el bandwidth lo gastamos igual cuando
      // llega; solo lo movemos antes para que esté listo a tiempo.
      { rootMargin: "600px" },
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Inicializar el YT.Player después de que el iframe esté montado.
  useEffect(() => {
    if (!hasMounted || !iframeRef.current || playerRef.current) return;

    let cancelled = false;
    let loopInterval: ReturnType<typeof setInterval> | null = null;

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

              // Loop ANTES de que termine el video. Si esperamos al estado
              // ENDED, YouTube muestra brevemente su UI de "play again"
              // (botón central de play). Saltando a 0 cuando faltan ~0.4s
              // del final, el player nunca entra en ENDED y la transición
              // queda invisible.
              loopInterval = setInterval(() => {
                try {
                  const t = e.target.getCurrentTime?.() ?? 0;
                  const d = e.target.getDuration?.() ?? 0;
                  if (d > 0 && t >= d - 0.4) {
                    // seekTo(0.3) en vez de 0: el frame 0 de un video YT
                    // suele ser idéntico al thumbnail (YouTube lo genera
                    // del primer frame). Saltando a 0.3s evitamos que el
                    // loop "muestre el thumbnail" por un instante.
                    e.target.seekTo(0.3, true);
                  }
                } catch {
                  // Ignorable: ocurre durante la transición ready/destroy.
                }
              }, 100);
            },
            onStateChange: (e) => {
              // `1` = YT.PlayerState.PLAYING. Una vez que YouTube confirma
              // que el video está reproduciendo, dejamos de esconder el
              // iframe.
              if (e.data === 1) {
                setHasPlayed(true);
              } else if (e.data === 0) {
                // `0` = ENDED. Defense in depth: si el setInterval no
                // alcanzó a hacer el seek antes del final (main thread
                // bloqueado, video muy corto, etc.), forzamos el loop
                // acá. Sin esto YouTube mostraría su UI de "video ended".
                try {
                  e.target.seekTo(0.3, true);
                  e.target.playVideo();
                } catch {}
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
      if (loopInterval) clearInterval(loopInterval);
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

  // Tres mecanismos juntos para forzar que el border-radius + overflow
  // del padre clipee al iframe en Chrome/Safari (default sin esto: el
  // iframe vive en su composite layer y "se escapa" del clip, viéndose
  // cuadrado encima del wrapper redondeado):
  // - `isolate` → crea stacking context propio.
  // - `transform-gpu` (translateZ(0)) → fuerza GPU compositing del wrapper.
  // - `[contain:paint]` → CSS containment del paint output al box del
  //   wrapper. Es el más bulletproof para este caso.
  return (
    <div
      ref={wrapperRef}
      className={`${className ?? ""} isolate transform-gpu [contain:paint]`}
    >
      {/*
        Thumbnail: visible mientras el iframe no haya empezado a reproducir.
        Sirve doble propósito: (a) placeholder antes del lazy mount, (b)
        cobertura sobre el iframe mientras YouTube muestra su UI de
        loading/play durante el arranque. Crossfade a transparente cuando
        `hasPlayed` se vuelve true.

        Mismo oversize + offsets que el iframe (-15% top, -7.5% left,
        130% h, 115% w) para que el crop visible matchee exactamente al
        del video. Sin esto, el thumbnail se ve "más zoomeado" que el
        video y al hacer el swap parece que el contenido se achica.

        El onLoad detecta el stub gris 120×90 que YouTube devuelve cuando
        `maxresdefault.jpg` no existe para ese video — en ese caso caemos
        a `hqdefault.jpg` (480×360, garantizado para todo video).
      */}
      {!hasPlayed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth <= 120) {
              setThumbSrc(
                `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              );
            }
          }}
          className="absolute top-[-15%] left-[-7.5%] z-10 h-[130%] w-[115%] object-cover"
        />
      )}
      {hasMounted && (
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          className={`pointer-events-none absolute top-[-15%] left-[-7.5%] h-[130%] w-[115%] border-0 transition-opacity duration-300 ${hasPlayed ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
