export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-3xl w-full flex flex-col gap-10 text-center">
        <div className="inline-flex items-center self-center px-4 py-1.5 rounded-tag bg-glass-light backdrop-blur-md text-caption font-medium [transform:rotate(-3.82deg)]">
          High-End
        </div>

        <h1 className="text-hero font-semibold">Digital Creative Studio</h1>

        <p className="text-tagline text-white/80">
          We bring technical precision to your{" "}
          <span className="text-accent">creative vision</span>
        </p>

        <p className="text-body text-white/60 max-w-xl mx-auto">
          Smoke test del design system: si ves Mona Sans, el celeste, los radios
          y la escala tipográfica funcionando, los tokens están bien mapeados.
        </p>

        <div className="flex justify-center mt-4">
          {/* Glass + gradient border (accent → border-fade) — patrón documentado en la skill banda-design-system */}
          <div className="rounded-pill p-px bg-linear-to-br from-accent to-border-fade self-center">
            <button
              type="button"
              className="block rounded-pill bg-glass-light backdrop-blur-md text-ink-primary px-9 py-3 text-body font-medium hover:bg-glass-dark transition-colors"
            >
              Let&apos;s work together!
            </button>
          </div>
        </div>
      </div>

      <section className="mt-32 w-full max-w-5xl rounded-section bg-surface-secondary px-10 py-20 flex flex-col gap-6">
        <h2 className="text-tagline font-semibold">Token check</h2>
        <p className="text-body text-white/70">
          Esta sección verifica{" "}
          <code className="text-accent">rounded-section</code> +{" "}
          <code className="text-accent">bg-surface-secondary</code>. Los chips
          de abajo usan <code className="text-accent">rounded-tag</code>
          {" "}(`0.75em`, esquinas redondeadas pero no pill — escala con el
          font-size del elemento).
        </p>
        <div className="flex flex-wrap gap-3">
          {["3D", "2D Motion", "VFX", "Branding", "Websites"].map((label) => (
            <span
              key={label}
              className="rounded-tag bg-ink-primary text-ink-on-chip text-caption font-medium px-4 py-2"
            >
              {label}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
