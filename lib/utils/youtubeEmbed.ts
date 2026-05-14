/**
 * Construye la URL de embed de YouTube. Dos modos:
 *
 * - Default: video "limpio" navegable (controls visibles, sin tracking previo).
 *   Para galerías de proyecto donde el usuario decide qué ver.
 * - `decorative`: video silenciado, autoplay, loop, sin controles ni branding.
 *   Para la home/showcase donde el video es decoración visual, no contenido
 *   interactivo. YouTube ignora algunos flags si la cuenta no es Partner —
 *   los overlays restantes los oculta el wrapper visual (oversize + overlay).
 */
export function youtubeEmbedUrl(
  videoId: string,
  opts: { decorative?: boolean } = {},
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
  });

  if (opts.decorative) {
    params.set("autoplay", "1");
    params.set("mute", "1");
    params.set("loop", "1");
    // `loop` solo funciona si `playlist` está seteada con el mismo ID.
    params.set("playlist", videoId);
    params.set("controls", "0");
    params.set("disablekb", "1");
    params.set("fs", "0");
    params.set("cc_load_policy", "0");
    // `vq` está deprecated pero YouTube todavía lo respeta como hint. Sin
    // esto el autoplay arranca en 360p y nunca sube si el usuario no toca
    // nada. Con `hd1080` se sirve la mejor calidad disponible del video.
    params.set("vq", "hd1080");
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
