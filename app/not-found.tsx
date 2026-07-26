import Link from "next/link";

import { Header } from "@/components/layout/Header";

/**
 * 404 global branded. Se renderiza dentro del root layout (fonts + fondo
 * oscuro ya aplicados). Mantiene el lenguaje del sitio: eyebrow en mayúsculas
 * con tracking, statement grande, y un pill con border-gradient (accent →
 * border-fade) igual que los CTAs del resto del sitio.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
        <p className="text-caption font-medium uppercase tracking-[0.18em] text-white/50">
          404
        </p>
        <h1 className="mt-6 max-w-2xl text-tagline font-semibold leading-[1.1] text-ink-primary">
          This page went off-frame.
        </h1>
        <p className="mt-4 max-w-md text-body text-white/70">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-10 rounded-pill border border-transparent px-6 py-2.5 text-caption font-medium text-ink-primary transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none [background:linear-gradient(var(--color-surface-primary),var(--color-surface-primary))_padding-box,linear-gradient(135deg,var(--color-accent),var(--color-border-fade))_border-box]"
        >
          Back home
        </Link>
      </main>
    </>
  );
}
