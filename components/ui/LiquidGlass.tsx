import type { CSSProperties, ReactNode } from "react";

interface LiquidGlassProps {
  children: ReactNode;
  /**
   * Clases extra para el contenedor exterior. Acá va el `rounded-*`, `px-*`,
   * `py-*`, rotación, etc.
   */
  className?: string;
  /**
   * Color base del cristal. Si no se pasa, se usa el default del tono.
   */
  glassColor?: string;
  /**
   * - `light` (default): chips/badges chicos sobre fondos oscuros — High-End,
   *   idea?. Tint blanco 5%, highlights "curvos" que simulan un pill, saturate
   *   150%. Ideal para elementos chicos donde la curvatura ayuda al efecto.
   * - `subtle`: boxes rectangulares grandes con texto adentro. Tint oscuro
   *   ~40% para mejor lectura, highlights atenuados (en un rect grande la
   *   curvatura simulada queda "rara"), saturate 120%.
   */
  tone?: "light" | "subtle";
  /**
   * - `inline` (default): inline-flex centrado, sizing al contenido. Para
   *   chips dentro de texto.
   * - `block`: flex block-level. Para boxes que envuelven varios elementos
   *   apilados (la dirección flex la controlás vía className: `flex-col`,
   *   `items-center`, `gap-*`, etc.).
   */
  layout?: "inline" | "block";
}

/**
 * Wrapper de liquid glass (efecto refracción óptica + reflections).
 *
 * Estructura: 2 layers stackeados dentro de un contenedor con `isolate`:
 * 1. **Lens** (`-z-10`, vacío): captura el backdrop detrás y le aplica
 *    `backdrop-filter` con el SVG `#liquid-glass` (refracción) + blur +
 *    saturación + un stack de box-shadow inset que imita los highlights y
 *    sombras internos del vidrio real.
 * 2. **Content** (`z-0`, default): los children, encima del lens.
 *
 * Por qué el lens va vacío: si tuviera contenido propio, `backdrop-filter` lo
 * aplicaría también a ese contenido, no solo al fondo. Manteniéndolo vacío
 * garantiza que SOLO el fondo se refracta y el texto queda nítido.
 *
 * Requiere que `<LiquidGlassFilter />` esté montado una vez en `app/layout`.
 */
export function LiquidGlass({
  children,
  className,
  glassColor,
  tone = "light",
  layout = "inline",
}: LiquidGlassProps) {
  const isSubtle = tone === "subtle";

  // Defaults por tono. El usuario puede sobreescribir `backgroundColor` vía
  // la prop `glassColor`.
  const defaultColor = isSubtle
    ? "rgba(0, 0, 0, 0.25)"
    : "oklch(from var(--color-ink-primary) l c h / 5%)";
  const saturate = isSubtle ? "115%" : "150%";

  const lensStyle: CSSProperties = {
    backgroundColor: glassColor ?? defaultColor,
    // El SVG `#liquid-glass` tiene un displacement map bakeado con forma de
    // pill (el WebP base64). Aplicado a chips redondos queda natural; en
    // boxes rectangulares grandes proyecta una "lente fantasma" curva que
    // no matchea las esquinas → lo skipeamos en tono `subtle`.
    // En `light` (chips): blur + url() + saturate (refracción completa).
    // En `subtle` (boxes): solo blur + saturate (frost limpio).
    backdropFilter: isSubtle
      ? `blur(10px) saturate(${saturate})`
      : `blur(8px) url(#liquid-glass) saturate(${saturate})`,
    WebkitBackdropFilter: `blur(${isSubtle ? "10px" : "8px"}) saturate(${saturate})`,
  };

  // Las dos variantes usan stacks de box-shadow diferentes:
  // - `liquid-glass-lens` (light): simula curvatura de pill, ideal para chips
  //   chicos. En boxes grandes rectangulares crea artefactos "fantasma" en
  //   las esquinas.
  // - `liquid-glass-lens-subtle`: solo borde + highlight arriba + glow.
  //   Limpio en cualquier radius.
  const lensClass = isSubtle ? "liquid-glass-lens-subtle" : "liquid-glass-lens";

  const layoutClass =
    layout === "block" ? "flex" : "inline-flex items-center justify-center";

  // No ponemos `rounded-[inherit]` en el span exterior: el usuario pasa el
  // `rounded-*` via `className` y queremos que ese gane sin pelearse con un
  // `inherit` que termina computando a 0 cuando el padre no tiene radius.
  // El lens interior sí inherita — eso garantiza que la "lente" matchee
  // exacto el radius del contenedor exterior.
  return (
    <span
      className={`relative isolate ${layoutClass} ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className={`${lensClass} pointer-events-none absolute inset-0 -z-10 rounded-[inherit]`}
        style={lensStyle}
      />
      {children}
    </span>
  );
}
