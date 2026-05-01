import Image from "next/image";

export default function MaintenancePage() {
  return (
    <>
      {/* Background animado — solo blobs accent, sutiles, en esquinas opuestas. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 h-[35vmax] w-[35vmax] -translate-x-1/2 -translate-y-1/2 rounded-pill bg-[#e8e2d5]/10 blur-[90px] animate-blob-1" />
        <div className="absolute bottom-0 right-0 h-[35vmax] w-[35vmax] translate-x-1/2 translate-y-1/2 rounded-pill bg-[#e8e2d5]/10 blur-[90px] animate-blob-2" />
      </div>

      {/* Header — bg negro para que se delimite del hero como nav real. */}
      <header className="bg-surface-secondary px-6 sm:px-10 py-4">
        <Image
          src="/logo.svg"
          alt="Banda Studio"
          width={475}
          height={80}
          priority
          className="w-auto h-6 sm:h-7"
        />
      </header>

      {/* Hero — centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-3xl w-full flex flex-col items-center gap-8">
          {/* Coming soon tag — rounded-tag (no pill) para diferenciarlo del CTA. */}
          <div className="inline-flex items-center gap-2 rounded-tag bg-glass-light backdrop-blur-md px-4 py-1.5 text-caption font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-pill bg-accent" />
            </span>
            Coming soon
          </div>

          <h1 className="text-hero font-semibold">Digital Creative Studio</h1>

          <p className="text-body-lg text-white/80 max-w-xl">
            We bring technical precision to your{" "}
            <span className="text-accent">creative vision</span>.
          </p>

          {/* CTA — centro sólido (surface-primary), gradient SOLO en el border de 1px.
              Técnica: dos backgrounds layered en padding-box / border-box. */}
          <a
            href="mailto:banda.studio.team@gmail.com"
            className="rounded-pill px-9 py-3 text-body font-medium text-ink-primary border border-transparent transition-opacity hover:opacity-90 mt-2 [background:linear-gradient(var(--color-surface-primary),var(--color-surface-primary))_padding-box,linear-gradient(135deg,var(--color-accent),var(--color-border-fade))_border-box]"
          >
            Get in touch
          </a>
        </div>
      </main>
    </>
  );
}
