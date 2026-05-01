"use client";

import dynamic from "next/dynamic";

import config from "@/sanity.config";

/**
 * El Studio toca `window` durante el bootstrap (auth store, browser APIs), así
 * que cualquier intento de SSR explota con "window is not defined" antes de
 * caer al client. Cargamos el componente con next/dynamic + ssr:false para
 * saltarnos el render en server completamente.
 */
const NextStudio = dynamic(
  () => import("next-sanity/studio").then((mod) => mod.NextStudio),
  { ssr: false },
);

export function Studio() {
  return <NextStudio config={config} />;
}
