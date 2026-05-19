/**
 * Detecta el aspect ratio nativo de un video de YouTube scrapeando la página
 * `watch?v={ID}`.
 *
 * Por qué no usar el thumbnail probe: YouTube normaliza casi todos los
 * thumbnails a 1280×720 (16:9), independientemente del aspect del source.
 * Probar `maxresdefault.jpg` siempre devuelve 16:9 → inútil.
 *
 * En cambio, la página del video tiene el JSON `ytInitialPlayerResponse`
 * embebido en un `<script>` con la lista de `adaptiveFormats`. Cada formato
 * trae `width` y `height` reales del source. Tomamos el primero que matchea
 * la regex.
 *
 * Caveats:
 * - Es scraping → fragil ante cambios en el HTML de YouTube.
 * - Algunos países / bot-detection pueden servir HTML distinto.
 * - Cache con `revalidate: 86400` → 1 día. Si rompe, devuelve `16/9` y
 *   degradamos al fallback.
 *
 * Devuelve un string `"W/H"`. Si no puede detectar, devuelve `"16/9"`.
 */
export async function getYouTubeAspect(videoId: string): Promise<string> {
  try {
    // El `_v=2` no hace nada en YouTube (ignora params desconocidos) pero
    // Next cachea fetch por URL exacta — cambiar el param invalida el cache
    // viejo de detección de aspect ratio (de antes del fix de "largest area").
    // Si en el futuro hay otro fix similar, incrementar a `_v=3` etc.
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&_v=2`, {
      headers: {
        // UA "real" para que YouTube no nos sirva la versión móvil reducida.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return "16/9";

    const html = await res.text();

    // El HTML tiene MUCHOS pares width/height: thumbnails de varios tamaños
    // (storyboards, preview, related videos), adaptiveFormats del stream
    // real, etc. Antes tomábamos el PRIMER match en rango, pero para videos
    // portrait suele aparecer primero un thumbnail 336×188 (preview 16:9
    // cropeado del portrait) y eso rompía la detección.
    //
    // Heurística mejor: tomar el match con mayor ÁREA. Los streams reales
    // del video son típicamente 1080p o 2160p (1080×1920, 1920×1080,
    // 1080×1080 según orientación) — área mucho mayor que cualquier
    // thumbnail. Eso resuelve consistentemente al stream real del video.
    const matches = [...html.matchAll(/"width":(\d+),"height":(\d+)/g)];
    let bestW = 0;
    let bestH = 0;
    let bestArea = 0;
    for (const m of matches) {
      const w = parseInt(m[1], 10);
      const h = parseInt(m[2], 10);
      if (w >= 256 && h >= 144 && w <= 7680 && h <= 4320) {
        const area = w * h;
        if (area > bestArea) {
          bestArea = area;
          bestW = w;
          bestH = h;
        }
      }
    }

    if (bestW && bestH) return `${bestW}/${bestH}`;
    return "16/9";
  } catch {
    return "16/9";
  }
}
