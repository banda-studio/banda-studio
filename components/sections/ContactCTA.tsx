"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { EmailLink } from "@/components/layout/EmailLink";
import { LiquidGlass } from "@/components/ui/LiquidGlass";
import { CONTACT_EMAIL } from "@/lib/services";

gsap.registerPlugin(ScrollTrigger);

/**
 * CTA final con animación "drag-to-resize".
 *
 * Al entrar a la sección un cursor aparece sobre el nodo TL, lo clickea y
 * arrastra en diagonal hasta la esquina opuesta. El rectángulo crece
 * sincrónicamente con el cursor (mismo easing, misma duration → cursor
 * siempre toca la esquina BR del wireframe). Cuando termina el drag, el
 * cursor se va, aparecen los otros 3 nodos y la card con el copy.
 *
 * Layout:
 * - `outer-frame` con `relative p-4` define el rectángulo del wireframe.
 *   Los nodos quedan -1.5 (mitad de su size-3) afuera de los bordes para
 *   centrarse sobre los corners.
 * - El wireframe (lineas) está en un wrapper aparte que escala desde 0 al
 *   tamaño full con `transformOrigin: 0% 0%`. Las líneas viven adentro y
 *   se escalan con el wrapper.
 * - El nodo TL es independiente (siempre visible). TR/BR/BL son
 *   independientes también pero hidden hasta el final del drag.
 * - Card (`rounded-section bg-surface-secondary`) en el flow para definir
 *   el tamaño del wrapper. Initial opacity 0, fade in al final.
 *
 * Reduced motion: estado final directo, sin cursor ni timeline.
 * `once: true` → no replay al hacer scroll-up/down repetido.
 */
interface ContactCTAProps {
  /**
   * Qué CTA secundario mostrar en la fila inferior de la card.
   * - `"about"` (default): "Learn more about us" → `/about`. Para home y
   *   service pages, donde el visitante todavía puede querer conocer el
   *   estudio.
   * - `"contact"`: "Let's work together" → `/contact`. Para la página
   *   `/about`, donde "learn more about us" no tiene sentido porque ya
   *   está acá; el siguiente paso natural es escribirnos.
   */
  primaryCta?: "about" | "contact";
}

export function ContactCTA({ primaryCta = "about" }: ContactCTAProps = {}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-wireframe]", {
          scaleX: 0,
          scaleY: 0,
          transformOrigin: "0% 0%",
        });
        gsap.set('[data-node="tr"], [data-node="br"], [data-node="bl"]', {
          opacity: 0,
          scale: 0,
        });
        gsap.set("[data-card]", { opacity: 0 });
        gsap.set("[data-cursor]", { opacity: 0, left: "0%", top: "0%" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });

        const DRAG_DUR = 1.1;
        const EASE = "power2.inOut";

        // Cursor aparece + click rápido sobre el nodo TL.
        tl.to("[data-cursor]", { opacity: 1, duration: 0.3 })
          .to("[data-cursor]", { scale: 0.8, duration: 0.12 })
          .to("[data-cursor]", { scale: 1, duration: 0.12 });

        // Drag diagonal: cursor TL → BR, wireframe escala 0 → 1 en paralelo.
        // Mismo easing y duration garantiza que cursor "agarra" la esquina BR
        // del rectángulo durante todo el movimiento (drag-to-resize real).
        tl.to(
          "[data-cursor]",
          {
            left: "100%",
            top: "100%",
            duration: DRAG_DUR,
            ease: EASE,
          },
          "+=0.15",
        ).to(
          "[data-wireframe]",
          {
            scaleX: 1,
            scaleY: 1,
            duration: DRAG_DUR,
            ease: EASE,
          },
          "<",
        );

        // Cursor desaparece, nodos restantes "popean" en sus corners y la
        // card aparece adentro.
        tl.to("[data-cursor]", { opacity: 0, duration: 0.3 }, "+=0.15")
          .to(
            '[data-node="tr"]',
            {
              opacity: 1,
              scale: 1,
              duration: 0.25,
              ease: "back.out(2)",
            },
            "<",
          )
          .to(
            '[data-node="br"]',
            {
              opacity: 1,
              scale: 1,
              duration: 0.25,
              ease: "back.out(2)",
            },
            "<0.05",
          )
          .to(
            '[data-node="bl"]',
            {
              opacity: 1,
              scale: 1,
              duration: 0.25,
              ease: "back.out(2)",
            },
            "<0.05",
          )
          .to(
            "[data-card]",
            { opacity: 1, duration: 0.5, ease: "power2.out" },
            "<0.15",
          );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-wireframe], [data-card]", {
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
        });
        gsap.set("[data-node]", { opacity: 1, scale: 1 });
        gsap.set("[data-cursor]", { opacity: 0 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Get in touch"
      className="rounded-t-section bg-surface-secondary px-6 pt-24 pb-24 sm:px-10 lg:px-16 lg:pt-32 lg:pb-32"
    >
      <div className="mx-auto max-w-2xl">
        <div className="relative p-4">
          {/* Wireframe wrapper — scale 0 → 1, contiene solo las 4 líneas */}
          <div data-wireframe className="absolute inset-0">
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 left-0 h-px bg-white"
            />
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 bottom-0 w-px bg-white"
            />
            <span
              aria-hidden="true"
              className="absolute right-0 bottom-0 left-0 h-px bg-white"
            />
            <span
              aria-hidden="true"
              className="absolute top-0 bottom-0 left-0 w-px bg-white"
            />
          </div>

          {/* Nodo TL — anchor, visible desde el inicio */}
          <Node placement="-top-1.5 -left-1.5" dataKey="tl" />
          {/* Otros 3 nodos — hidden hasta el final del drag */}
          <Node placement="-top-1.5 -right-1.5" dataKey="tr" />
          <Node placement="-bottom-1.5 -right-1.5" dataKey="br" />
          <Node placement="-bottom-1.5 -left-1.5" dataKey="bl" />

          {/* Cursor — animates left/top % during drag */}
          <span
            data-cursor
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          >
            <CursorIcon />
          </span>

          {/* Card — appears at the end */}
          <div
            data-card
            className="rounded-section bg-surface-secondary px-8 py-10 lg:px-12 lg:py-12"
          >
            {/*
              Tamaño intermedio entre text-tagline (32-40px) y text-hero (48-88px).
              Escala fluida ~40 → 56px, suficiente para que "Let's work together!"
              entre en una sola línea dentro del max-w-2xl sin overflow.
            */}
            <h2 className="text-center text-[clamp(2.5rem,3.5vw+0.5rem,3.5rem)] font-semibold leading-[1.08]">
              Have an{" "}
              <LiquidGlass className="rounded-tag px-3 py-0.5 align-middle italic [transform:rotate(-5deg)]">
                idea?
              </LiquidGlass>
              <br />
              Let&apos;s work together!
            </h2>

            <p className="mt-6 text-center text-body text-white/70">
              From 3D animation to digital experiences. We bring technical
              precision to your creative vision.
            </p>

            {/*
              Bottom row: en sm:+ los dos elementos van en la misma fila a los
              extremos (justify-between). Cuando no hay espacio (default mobile)
              se apilan y quedan centrados. Es el comportamiento natural —
              ningún elemento se "estira" para llenar la fila.
            */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <Link
                href={primaryCta === "contact" ? "/contact" : "/about"}
                className="shrink-0 rounded-pill border border-transparent px-5 py-2 text-caption font-medium whitespace-nowrap text-ink-primary transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none [background:linear-gradient(var(--color-surface-secondary),var(--color-surface-secondary))_padding-box,linear-gradient(135deg,var(--color-accent),var(--color-border-fade))_border-box]"
              >
                {primaryCta === "contact"
                  ? "Let's work together"
                  : "Learn more about us"}
              </Link>
              <EmailLink email={CONTACT_EMAIL} compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Nodo del wireframe: cuadrado blanco pequeño (size-3 = 12px) con bordes
 * apenas redondeados. `placement` define la esquina, el `-X-1.5` lo
 * centra sobre el corner (1.5 = mitad de size-3).
 */
function Node({
  placement,
  dataKey,
}: {
  placement: string;
  dataKey: string;
}) {
  return (
    <span
      data-node={dataKey}
      aria-hidden="true"
      className={`absolute size-3 rounded-[2px] bg-white ${placement}`}
    />
  );
}

/**
 * Cursor estilo Windows clásico — fill blanco con stroke negro para que se
 * vea sobre fondos claros u oscuros.
 */
function CursorIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 2.5 L3 17 L7 13.5 L9.5 19 L12 18 L9.5 12.5 L15.5 12.5 Z"
        fill="white"
        stroke="black"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
