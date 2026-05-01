import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";

export const metadata: Metadata = {
  title: "Banda Studio — Digital Creative Studio",
  description:
    "Independent creative studio bringing technical precision to your creative vision. 3D Modeling, 2D Motion, VFX, Graphic Design and Website.",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        {/* WIP — Marquee, Services, frase y Footer llegan en commits siguientes. */}
      </main>
    </>
  );
}
