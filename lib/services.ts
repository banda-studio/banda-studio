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
  { name: "3D Modeling", slug: "3d-modeling" },
  { name: "2D Motion", slug: "2d-motion" },
  { name: "VFX", slug: "vfx" },
  { name: "Graphic Design", slug: "graphic-design" },
  { name: "Website", slug: "website" },
] as const;

export type Service = (typeof services)[number];

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
