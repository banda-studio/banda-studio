import type { MetadataRoute } from "next";

/**
 * Mientras el sitio está en construcción bloqueamos indexación de TODO el dominio.
 * Cuando lance el sitio real, cambiar a:
 *   { userAgent: "*", allow: "/", disallow: "/studio" }
 * para permitir la home pero seguir bloqueando el Studio (no debe estar en Google).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
