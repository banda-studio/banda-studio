import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { ContactHero } from "@/components/sections/ContactHero";

export const metadata: Metadata = {
  title: "Contact — Banda Studio",
  description:
    "Tell us what you have in mind. Post-production, 2D & 3D animation, design, modeling, and VFX for brands around the world.",
};

/**
 * Página /contact. Una sola sección con form para no diluir el foco — el
 * usuario llegó acá con intención clara (lo dirigió un CTA "Let's work
 * together!"), no necesita ver el ContactCTA del home repetido.
 *
 * Server Component (el form en sí es Client).
 */
export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ContactHero />
      </main>
    </>
  );
}
