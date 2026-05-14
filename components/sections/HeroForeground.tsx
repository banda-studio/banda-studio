"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Cubo de vidrio cargado lazy. Three.js + R3F + drei pesan ~700KB; los
 * dejamos fuera del bundle inicial. Solo se importa cuando el viewport es
 * desktop + sin reduced-motion.
 */
const GlassCube = dynamic(() => import("./GlassCube"), {
  ssr: false,
  loading: () => null,
});

/**
 * Capa al FRENTE del contenido del hero — contiene el cubo de vidrio 3D que
 * flota visualmente por arriba del título / CTA.
 *
 * Hace falta una capa separada (no se puede meter en `HeroBackground` porque
 * éste está a `-z-10`, detrás de todo). Esta capa tiene `pointer-events-none`
 * para que clicks y hovers atraviesen el cubo y lleguen al texto / CTA.
 *
 * El cubo no monta en:
 * - Mobile (< 768px) — no hay mouse para que lo siga.
 * - `prefers-reduced-motion: reduce` — rotación constante + tracking del
 *   cursor sería molesto.
 *
 * En esos casos, este componente no renderiza nada. El hero queda con su
 * background normal (blobs + partículas), sin cubo.
 *
 * Nota sobre la "deformación del texto": el cubo está visualmente al frente
 * del título HTML, pero WebGL no puede refractar el DOM. El texto se ve a
 * través del cubo gracias a la transparencia del material, pero sin la
 * distorsión óptica del Spline original. Para tener distorsión real haría
 * falta mover el `<h1>` adentro del Canvas como un mesh 3D.
 */
export function HeroForeground() {
  const [enable, setEnable] = useState(false);
  // `ready` queda en false durante los primeros ~300ms tras el primer render.
  // En dev (React strict mode), eso da tiempo a que el ciclo mount→unmount→
  // mount del componente padre se complete ANTES de instanciar la Canvas
  // WebGL. Sin esto, el strict mode dispara dos creaciones de contexto GL
  // pegaditas y el browser termina por declarar "context lost". En prod
  // strict mode no aplica, pero el delay es invisible (300ms < paint inicial).
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mqlSize = window.matchMedia("(min-width: 768px)");
    const mqlMotion = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    );

    function update() {
      setEnable(mqlSize.matches && mqlMotion.matches);
    }
    update();
    mqlSize.addEventListener("change", update);
    mqlMotion.addEventListener("change", update);

    // Defensive delay para esquivar strict mode mount → unmount → mount.
    // 300ms alcanzaba en first load (network delay del chunk de Three.js
    // agregaba padding), pero en refresh los chunks están cacheados y todo
    // pasa antes de que strict mode termine. 1500ms es conservador y
    // sigue siendo invisible — el cubo es decoración y la home ya tiene
    // contenido propio mientras tanto.
    const t = setTimeout(() => setReady(true), 1500);

    return () => {
      clearTimeout(t);
      mqlSize.removeEventListener("change", update);
      mqlMotion.removeEventListener("change", update);
    };
  }, []);

  if (!enable || !ready) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10"
    >
      <GlassCube />
    </div>
  );
}
