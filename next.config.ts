import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

/**
 * Headers de seguridad aplicados a todas las rutas. NO incluimos CSP a
 * propósito: con los embeds de YouTube + estilos inline (Satori/GSAP) es
 * fácil romper algo, y el beneficio no compensa el riesgo en un sitio así.
 *
 * - HSTS con includeSubDomains + preload: fuerza HTTPS.
 * - X-Frame-Options SAMEORIGIN: anti-clickjacking (solo nosotros nos framear).
 * - X-Content-Type-Options nosniff: no adivinar MIME types.
 * - Referrer-Policy: no filtrar la URL completa a orígenes cruzados.
 * - COOP same-origin-allow-popups: aísla la ventana pero deja abrir popups
 *   (para no romper flujos tipo auth del Studio de Sanity).
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

/**
 * Bundle analyzer: se activa solo cuando `ANALYZE=true`. Correr con
 * `pnpm analyze` abre un treemap del bundle en el browser al terminar el
 * build. En un build normal (`pnpm build`) es un no-op, no agrega peso.
 */
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
