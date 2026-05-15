import { ContactForm } from "@/components/forms/ContactForm";
import { LiquidGlass } from "@/components/ui/LiquidGlass";

/**
 * Hero del /contact. Mismo lenguaje visual que el AboutHero:
 *
 * - Eyebrow "Contact" arriba.
 * - Statement grande en col izquierda (7/12).
 * - Form en col derecha (5/12). Inputs underline-only para mantener el
 *   look editorial sin agregar elementos visuales pesados.
 *
 * Chip LiquidGlass en "idea" (mismo gesto que el chip "Argentina" del
 * AboutHero y "High-End" del Hero) — atadura visual entre páginas.
 *
 * Server Component (el form en sí es Client adentro de ContactForm).
 */
export function ContactHero() {
  return (
    <section
      aria-labelledby="contact-title"
      className="bg-surface-primary px-6 pt-24 pb-24 sm:px-10 lg:px-16 lg:pt-32 lg:pb-32"
    >
      <div className="mx-auto max-w-[1440px]">
        <p className="text-caption font-medium uppercase tracking-[0.18em] text-white/50">
          Contact
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <h1
            id="contact-title"
            className="text-tagline font-semibold leading-[1.1] lg:col-span-7 lg:text-hero lg:leading-[1.05]"
          >
            Got an{" "}
            <LiquidGlass className="rounded-tag px-3 py-1 align-middle italic [transform:rotate(-3deg)]">
              idea
            </LiquidGlass>
            ? Tell us what you have in mind.
          </h1>

          <div className="lg:col-span-5 lg:pt-4">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
