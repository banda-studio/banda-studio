/**
 * Las 5 categorías "principales" del estudio. Aparecen en el dropdown del nav,
 * en la sección Services (scroll-pinned) de la home y en las páginas
 * `/services/[slug]`. Cada categoría agrupa una o más specialties (ver
 * `marqueeSpecialties` abajo).
 *
 * Ahora hardcoded; cuando carguemos contenido en Sanity, esto se reemplaza por
 * un fetch contra `allServicesQuery` y los slugs vienen del CMS.
 */
export const services = [
  { name: "3D Works", slug: "3d-modeling" },
  { name: "2D Motion", slug: "2d-motion" },
  { name: "VFX", slug: "vfx" },
  { name: "Graphic Design", slug: "graphic-design" },
  { name: "Website", slug: "website" },
] as const;

export type Service = (typeof services)[number];

/**
 * Datos del showcase scroll-pinned de la home. Por ahora solo los 3 servicios
 * que tienen video disponible — Graphic Design y Website se suman cuando haya
 * pieza. `videoId` es el ID de YouTube; el embed se construye con el helper
 * `youtubeEmbedUrl` en `lib/utils/youtubeEmbed.ts`.
 */
export const showcaseServices = [
  {
    slug: "3d-modeling",
    name: "3D Works",
    description:
      "High-fidelity modeling, texturing, and lighting for products and brands.",
    videoId: "x9A4X5SwHo0",
  },
  {
    slug: "2d-motion",
    name: "2D Motion",
    description:
      "Animated storytelling and motion design for brands, products, and digital campaigns.",
    videoId: "Mnq6Lk7Ol24",
  },
  {
    slug: "vfx",
    name: "VFX",
    description:
      "Photoreal compositing and visual effects that elevate live-action and CG footage.",
    videoId: "0bePpPwwF9A",
  },
] as const;

export type ShowcaseService = (typeof showcaseServices)[number];

/**
 * Datos completos por servicio para la página interna `/services/[slug]`.
 * Incluye descripción larga y la lista de proyectos destacados (los 4 que
 * llenan el grid asimétrico del Figma). `videoId` es de YouTube.
 *
 * Cuando migremos a Sanity, esto se reemplaza por un fetch a
 * `serviceBySlugQuery`. La forma del objeto matchea el schema definido en
 * `sanity/schemas/service.ts` para que la transición sea sin friction.
 */
/**
 * El aspect ratio NO se hardcodea acá: lo detectamos automáticamente desde el
 * source del video en YouTube vía `getYouTubeAspect()` (scraping del HTML de
 * `watch?v=ID`). Eso devuelve dimensiones reales — 16:9, 9:16, 1:1, 4:5, etc.
 * — sin que tengas que mapear manualmente.
 */
export const serviceDetails = {
  "3d-modeling": {
    name: "3D Works",
    description:
      "High-fidelity modeling, texturing, and lighting for products and brands. From hero shots to full CG campaigns, we deliver photoreal visuals built to print, ship, or run on the web.",
    projects: [
      { title: "Heel — Hero Shot", videoId: "x9A4X5SwHo0" },
      { title: "Product Loop", videoId: "Qusi8VAni6Y" },
      { title: "Materials Study", videoId: "bz8A6TeqZ1U" },
      { title: "Brand Object", videoId: "nNNoNf_MihA" },
      // `column: "left"` fuerza el video a la columna izquierda overrideando
      // la lógica automática del aspect ratio. Estos dos tienen aspect ~0.8
      // (casi cuadrado vertical), que el algoritmo trataría como portrait
      // → derecha. Acá los queremos a la izquierda.
      { title: "CG Render 05", videoId: "MjEoFLWOP3g", column: "left" },
      { title: "CG Render 06", videoId: "wzKmf9MAtSE" },
      { title: "CG Render 07", videoId: "5Zgm7OjE_bw", column: "left" },
      { title: "CG Render 08", videoId: "Eky0GzQro54" },
    ],
  },
  "2d-motion": {
    name: "2D Motion",
    description:
      "Animated storytelling and motion design for brands, products, and digital campaigns. We move type, illustration, and identity systems with intention.",
    projects: [
      { title: "Go Power — Ciclon", videoId: "Mnq6Lk7Ol24" },
      { title: "Campaign Loop", videoId: "yHweM-ioqP0" },
      { title: "Identity Motion", videoId: "Vladbv4hErQ" },
      { title: "Animated Spot", videoId: "LiWhk9dCvGQ" },
      { title: "Animated Spot 05", videoId: "svH7YqA80-E" },
      { title: "Animated Spot 06", videoId: "SEpWPbMajGU" },
    ],
    // Layout manual por filas. Cada array interno = una fila. Los items
    // dentro de una fila se reparten el ancho proporcionalmente al aspect
    // ratio del video → todos quedan a la misma altura sin recortes.
    customLayout: [
      ["Mnq6Lk7Ol24", "yHweM-ioqP0"], // landscape + square
      ["Vladbv4hErQ", "LiWhk9dCvGQ"], // square + landscape
      ["svH7YqA80-E"], // full width
      ["SEpWPbMajGU"], // full width
    ],
  },
  vfx: {
    name: "VFX",
    description:
      "Photoreal compositing and visual effects that elevate live-action and CG footage. We blend the practical with the impossible — clean, invisible, and shippable.",
    projects: [
      { title: "Live-Action VFX", videoId: "0bePpPwwF9A" },
      { title: "Compositing Reel", videoId: "LLo7KiLbGzA" },
      { title: "Effects Pass", videoId: "kzStbCC9c4g" },
      { title: "Hybrid Shot", videoId: "aZe1XU8dJuA" },
      { title: "VFX Sequence 05", videoId: "XPi7zPCg39U" },
      { title: "VFX Sequence 06", videoId: "0JLKM-JIixM" },
      { title: "VFX Sequence 07", videoId: "fgtWcMbrnzo" },
    ],
    customLayout: [
      ["0bePpPwwF9A"], // landscape full width
      ["LLo7KiLbGzA", "kzStbCC9c4g"], // 9:16 + square
      ["aZe1XU8dJuA"], // landscape full width
      ["XPi7zPCg39U", "0JLKM-JIixM", "fgtWcMbrnzo"], // 9:16 × 3
    ],
  },
  // Graphic Design y Website van cuando tengamos piezas — la home ya
  // tampoco los muestra hasta entonces.
} as const;

export type ServiceSlug = keyof typeof serviceDetails;

/**
 * Specialties de la marquee — todo lo que hacen, desglosado más fino que las
 * 5 categorías. Se repite en loop infinito. No tienen página propia.
 */
export const marqueeSpecialties = [
  "3D",
  "2D Motion",
  "VFX",
  "Digital Design",
  "Branding",
  "UX/UI Design",
  "Websites",
  "Illustrations",
] as const;

/**
 * Email de contacto principal. Usado en el header (con copy-to-clipboard) y
 * en el footer. Single source of truth para que cualquier cambio se propague.
 */
export const CONTACT_EMAIL = "banda.studio.team@gmail.com";
