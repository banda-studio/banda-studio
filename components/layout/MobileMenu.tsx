"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { EmailLink } from "@/components/layout/EmailLink";
import {
  CONTACT_EMAIL,
  serviceDetails,
  services,
} from "@/lib/services";

/**
 * Menú hamburguesa para mobile. Reemplaza al EmailLink + nav central del
 * Header en viewports < md.
 *
 * Comportamiento:
 * - Botón hamburguesa (3 líneas) a la derecha del header en mobile.
 * - Al clickear abre un overlay full-screen con el menú: Home, About Us,
 *   Services (lista flat con los servicios visibles) + EmailLink al final.
 * - Click en X, Escape, o navegar a otra ruta cierra el menú.
 * - Body scroll lock mientras está abierto.
 *
 * **Implementación**: el drawer va via `createPortal` al `body`. Sin el
 * portal, el `fixed inset-0` queda atrapado adentro del Header (porque
 * el header tiene `backdrop-blur-md` y eso crea un containing block para
 * elementos `fixed` descendientes). Resultado: drawer squashed a 70px
 * de alto sin bg cubriendo la página atrás. El portal lo saca afuera.
 *
 * Client Component (estado + side effects + portal).
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  // `mounted` flag para que createPortal solo corra client-side (evita
  // mismatch de hydration: `document.body` no existe en SSR).
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtramos services igual que en ServicesDropdown — los que tienen
  // contenido real (graphic-design y website no aparecen hasta tener piezas).
  const visibleServices = services.filter((s) => s.slug in serviceDetails);

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    // Lock body scroll mientras el menú está abierto.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Cerrar el menú al navegar a otra ruta.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const drawer = (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className={`fixed inset-0 z-[60] bg-surface-secondary transition-opacity duration-200 md:hidden ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-caption font-medium uppercase tracking-[0.18em] text-white/50">
          Menu
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="inline-flex h-10 w-10 items-center justify-center text-ink-primary transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-2 px-6 pt-8">
        <MobileLink href="/">Home</MobileLink>
        <MobileLink href="/about">About Us</MobileLink>

        <div className="mt-4 mb-2 text-caption font-medium uppercase tracking-[0.18em] text-white/50">
          Services
        </div>
        {visibleServices.map((service) => (
          <MobileLink
            key={service.slug}
            href={`/services/${service.slug}`}
          >
            {service.name}
          </MobileLink>
        ))}

        <div className="mt-8 border-t border-white/10 pt-6">
          <EmailLink email={CONTACT_EMAIL} />
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex h-10 w-10 items-center justify-center text-ink-primary transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none md:hidden"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}

function MobileLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block py-2 text-tagline font-semibold text-ink-primary transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}
