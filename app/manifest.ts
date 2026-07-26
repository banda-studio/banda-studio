import type { MetadataRoute } from "next";

/**
 * Web app manifest (`/manifest.webmanifest`). Define nombre, colores e íconos
 * cuando alguien "agrega a pantalla de inicio" o guarda el sitio. Colores
 * alineados a los tokens (surface-primary #0A0A0A, accent #70BEFA).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Banda Studio",
    short_name: "Banda",
    description:
      "Independent creative studio — 3D, 2D Motion, VFX, design, and websites.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#0A0A0A",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  };
}
