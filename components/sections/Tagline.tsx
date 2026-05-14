/**
 * Frase grande de transición entre el showcase y el CTA final. Texto
 * centrado, regular, dos líneas. Sirve como "respiro" visual antes del
 * cierre de la home.
 *
 * Server Component — sin interactividad ni state.
 */
export function Tagline() {
  return (
    <section
      aria-label="Studio philosophy"
      className="bg-surface-primary py-24 lg:py-32"
    >
      <div className="mx-auto flex w-full max-w-[1440px] justify-center px-6 sm:px-10 lg:px-16">
        <h2 className="mx-auto max-w-4xl text-center text-tagline font-normal text-ink-primary">
          Whatever you&apos;re building,
          <br />
          we&apos;d love to be part of it.
        </h2>
      </div>
    </section>
  );
}
