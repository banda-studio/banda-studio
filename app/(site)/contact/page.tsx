import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { ContactHero } from "@/components/sections/ContactHero";

export const metadata: Metadata = {
  // Solo la parte corta: el template del root layout agrega "— Banda Studio".
  title: "Contact",
  description:
    "Tell us what you have in mind. Post-production, 2D & 3D animation, design, modeling, and VFX for brands around the world.",
  alternates: { canonical: "/contact" },
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
