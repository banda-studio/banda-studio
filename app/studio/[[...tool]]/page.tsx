/**
 * Sanity Studio embebido. Vive en /studio (dev: localhost:3000/studio, prod: banda.studio/studio).
 * Schemas, plugins y projectId vienen de sanity.config.ts en el root.
 *
 * - dynamic="force-static": el shell del Studio se sirve estático; las queries
 *   contra el dataset se hacen del lado del cliente.
 * - metadata/viewport: vienen de next-sanity/studio para que el viewport y los
 *   meta tags den el layout correcto (sin esto, el Studio queda mal en mobile).
 */

import { Studio } from "./Studio";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <Studio />;
}
