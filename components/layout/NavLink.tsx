"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Link de navegación principal. Marca el activo con un underline animado en
 * accent y `aria-current="page"` para screen readers. Considera también las
 * rutas hijas (ej: /services/3d-modeling matchea el link "Services").
 */
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className="relative text-body-lg text-ink-primary transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none"
    >
      {children}
      {/* Underline pegado al border-bottom del header. -bottom-4 = py-4 del header. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-4 left-0 h-[3px] rounded-pill bg-accent transition-all duration-200 ${
          isActive ? "right-0 opacity-100" : "right-full opacity-0"
        }`}
      />
    </Link>
  );
}
