import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { Tagline } from "@/components/sections/Tagline";

export const metadata: Metadata = {
  title: "Banda Studio — Digital Creative Studio",
  description:
    "Independent creative studio bringing technical precision to your creative vision. 3D Works, 2D Motion, VFX, Graphic Design and Website.",
};

/**
 * Home (`/`). Hero con humo + chips de servicios, showcase scroll-pinned con
 * los 3 servicios destacados, tagline y card de CTA final.
 *
 * Antes vivía en `/home` mientras `/` mostraba una landing de maintenance,
 * pero ya estamos live — `/` ahora es la home real.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <ServicesShowcase />
        <Tagline />
        <ContactCTA />
      </main>
    </>
  );
}
