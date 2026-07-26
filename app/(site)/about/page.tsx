import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { AboutHero } from "@/components/sections/AboutHero";
import { ClientsStrip } from "@/components/sections/ClientsStrip";
import { ContactCTA } from "@/components/sections/ContactCTA";

export const metadata: Metadata = {
  // Solo la parte corta: el template del root layout agrega "— Banda Studio".
  title: "About",
  description:
    "Post-production studio based in Argentina. 2D & 3D animation, design, modeling, and VFX for brands around the world.",
  alternates: { canonical: "/about" },
};

/**
 * Página /about. Tres bloques:
 * 1. Header (sticky, mismo de todo el sitio).
 * 2. AboutHero — título + 4 párrafos de copy hardcoded.
 * 3. ClientsStrip — strip de logos con fondo off-white.
 * 4. ContactCTA — el "footer" animado del sitio.
 *
 * Server Component. Sin fetch a Sanity por ahora — cuando se cargue contenido
 * en el Studio el copy de about se puede mover a un `siteSettings` singleton.
 */
export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <AboutHero />
        <ClientsStrip />
        <ContactCTA primaryCta="contact" />
      </main>
    </>
  );
}
