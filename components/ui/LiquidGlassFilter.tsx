import { LIQUID_GLASS_DISPLACEMENT_MAP } from "@/lib/liquidGlassDisplacementMap";

/**
 * Filtro SVG global usado por todas las instancias de `<LiquidGlass>`. Va
 * UNA SOLA VEZ en el `<body>` (montado desde `app/layout.tsx`). Después
 * cualquier elemento puede usarlo vía `backdrop-filter: url(#liquid-glass)`
 * en CSS.
 *
 * Cómo funciona:
 * - `feImage` carga el displacement map (un WebP base64 con valores RGB que
 *   representan offsets X/Y por pixel).
 * - `feGaussianBlur` pre-suaviza el SourceGraphic (el contenido del backdrop)
 *   para que la refracción no muestre artefactos duros.
 * - `feDisplacementMap` aplica el offset: cada pixel del backdrop se mueve
 *   según el valor RGB del mapa en esa posición, simulando la distorsión
 *   óptica de un vidrio real.
 *
 * `primitiveUnits="objectBoundingBox"` hace que el filtro se adapte a
 * cualquier tamaño de elemento sin necesidad de recalcular dimensiones desde
 * JavaScript.
 *
 * Fallback: en Safari (que no soporta `url()` dentro de backdrop-filter), los
 * estilos del lens caen a un blur simple. No se ve la refracción, pero el
 * efecto vidrio sigue funcionando.
 */
export function LiquidGlassFilter() {
  return (
    <svg
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      aria-hidden="true"
    >
      <filter id="liquid-glass" primitiveUnits="objectBoundingBox">
        <feImage
          result="map"
          width="100%"
          height="100%"
          x="0"
          y="0"
          href={LIQUID_GLASS_DISPLACEMENT_MAP}
          preserveAspectRatio="none"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
        <feDisplacementMap
          in="blur"
          in2="map"
          scale="0.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
