import type { MetadataRoute } from "next";

/**
 * Permitimos crawl/index del sitio público y bloqueamos el Studio de Sanity
 * (no debe aparecer en Google ni ningún buscador).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/studio" },
  };
}
