import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";

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
        {/* WIP — Hero, Marquee, Services, frase y Footer llegan en commits siguientes. */}
        <p className="py-32 text-center text-body text-white/40">
          Home V1 — work in progress
        </p>
      </main>
    </>
  );
}
