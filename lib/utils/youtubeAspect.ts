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
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
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

    // El adaptiveFormats tiene entries tipo: {"itag":...,"url":"...","width":1920,"height":1080,...}
    // Buscamos el PRIMER par width/height que NO sea de un thumbnail (que
    // suelen estar en formatos distintos del JSON).
    const matches = [...html.matchAll(/"width":(\d+),"height":(\d+)/g)];
    for (const m of matches) {
      const w = parseInt(m[1], 10);
      const h = parseInt(m[2], 10);
      // Filter: ignorar dimensiones muy chicas (thumbnails miniatures) y muy
      // grandes (placeholders raros).
      if (w >= 256 && h >= 144 && w <= 7680 && h <= 4320) {
        return `${w}/${h}`;
      }
    }

    return "16/9";
  } catch {
    return "16/9";
  }
}
