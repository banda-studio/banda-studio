import { groq } from "next-sanity";

/**
 * Lista de servicios para la home y para `generateStaticParams` de /services/[slug].
 */
export const allServicesQuery = groq`
  *[_type == "service"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    heroImage
  }
`;

/**
 * Slugs de todos los servicios — útil para generateStaticParams.
 */
export const allServiceSlugsQuery = groq`
  *[_type == "service" && defined(slug.current)][].slug.current
`;

/**
 * Servicio por slug + proyectos referenciados (dereferenciados con ->).
 */
export const serviceBySlugQuery = groq`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    name,
    description,
    heroImage,
    "projects": projects[]-> {
      _id,
      title,
      "slug": slug.current,
      client,
      year,
      videoUrl,
      thumbnail,
      tags
    }
  }
`;

/**
 * Site settings (singleton). Devuelve null si todavía no se editó en el Studio.
 */
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    contactEmail,
    social,
    heroBadge,
    heroTitle,
    heroSubtitle,
    heroCta
  }
`;
