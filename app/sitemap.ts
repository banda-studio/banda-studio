import type { MetadataRoute } from "next";

import { SITE_URL, serviceDetails } from "@/lib/services";

/**
 * Sitemap del sitio. Le dice a Google/Bing qué URLs indexar. Se genera en
 * build y queda en `/sitemap.xml`.
 *
 * Las páginas de servicio salen de `serviceDetails` (las que tienen contenido),
 * así el sitemap se mantiene solo: al agregar un servicio con piezas, aparece
 * acá automáticamente. `/studio` queda fuera a propósito (lo bloquea robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.7 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = Object.keys(serviceDetails).map(
    (slug) => ({
      url: `${SITE_URL}/services/${slug}`,
      changeFrequency: "monthly",
      priority: 0.9,
    }),
  );

  return [...staticRoutes, ...serviceRoutes];
}
