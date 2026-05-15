import Image from "next/image";
import Link from "next/link";

import { CONTACT_EMAIL } from "@/lib/services";

import { EmailLink } from "./EmailLink";
import { NavLink } from "./NavLink";
import { ServicesDropdown } from "./ServicesDropdown";

/**
 * Header global del sitio. Sticky arriba con un glass sutil (negro/80%
 * + backdrop-blur) para que se mantenga visible sobre cualquier sección sin
 * tapar el contenido por completo.
 *
 * Layout: logo izquierda · nav central · email derecha. En mobile (< md) el
 * nav central se esconde — TODO: hamburger en commit posterior.
 *
 * Server Component. Las piezas interactivas (NavLink con `usePathname`,
 * ServicesDropdown con state, EmailLink con clipboard) son sub-componentes
 * con `"use client"`.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-secondary/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-4 sm:px-10 lg:px-16">
        <Link
          href="/"
          aria-label="Banda Studio — go to home"
          className="shrink-0"
        >
          <Image
            src="/logo.svg"
            alt="Banda Studio"
            width={475}
            height={80}
            priority
            className="h-6 w-auto sm:h-7"
          />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 md:flex"
        >
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About Us</NavLink>
          <ServicesDropdown />
        </nav>

        <EmailLink email={CONTACT_EMAIL} />
      </div>
    </header>
  );
}
