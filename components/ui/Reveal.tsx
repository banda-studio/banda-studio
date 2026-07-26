"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  /** Tag del wrapper. Default `div`. Usar `section`/`h2` cuando convenga. */
  as?: ElementType;
  className?: string;
  /** Delay inicial en segundos antes de animar. */
  delay?: number;
  /**
   * Si es > 0, anima los hijos directos del wrapper en secuencia (stagger en
   * segundos) en vez del wrapper como bloque único. Útil para el hero.
   */
  stagger?: number;
}

/**
 * Reveal on-scroll: el contenido entra con fade + blur + translate-y cuando
 * el bloque toca el 85% inferior del viewport. Si el bloque ya está en
 * viewport al cargar (ej: hero), ScrollTrigger dispara en el primer refresh,
 * así que sirve igual como entrada on-load.
 *
 * `once: true` → no se repite al scrollear arriba/abajo.
 * `prefers-reduced-motion` → estado final directo, sin animación.
 *
 * GSAP (no Framer Motion) para mantener un solo sistema de animación, igual
 * que ServicesShowcase y ContactCTA.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  stagger = 0,
}: RevealProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const targets = stagger > 0 ? Array.from(el.children) : el;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // set + to (no `from`): `from` con immediateRender + ScrollTrigger +
        // doble-render de React en dev deja la opacity pegada en 0. Setear el
        // estado inicial explícito y animar con `to` es estable.
        gsap.set(targets, { opacity: 0, y: 24, filter: "blur(8px)" });

        gsap.to(targets, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power2.out",
          delay,
          stagger: stagger > 0 ? stagger : 0,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  );
}
