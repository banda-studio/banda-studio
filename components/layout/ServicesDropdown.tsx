"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { services } from "@/lib/services";

/**
 * Dropdown de Services del nav.
 *
 * Comportamiento:
 * - Desktop: hover abre, mouse leave cierra. Click también toggle (pa accesibility).
 * - Touch / sin hover: click toggle. Click fuera o Escape cierra.
 * - El trigger se marca activo cuando estás en cualquier /services/* o /services.
 * - aria-expanded + aria-haspopup="menu" + role="menu" + role="menuitem".
 */
export function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const pathname = usePathname();
  const isActive = pathname.startsWith("/services");

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-current={isActive ? "page" : undefined}
        className="relative inline-flex items-center gap-1 text-body-lg text-ink-primary transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none"
      >
        Services
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Underline pegado al border-bottom del header. -bottom-4 = py-4 del header. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-4 left-0 h-[3px] rounded-pill bg-accent transition-all duration-200 ${
            isActive ? "right-0 opacity-100" : "right-full opacity-0"
          }`}
        />
      </button>

      {/*
        Wrapper outer: posiciona el dropdown y agrega un buffer hover (pt-3)
        sobre el gap entre el trigger y el panel visible. Sin este buffer, el
        cursor al cruzar del trigger al menu sale del bounding box del
        container y onMouseLeave dispara → el menu se cierra antes del click.
      */}
      <div
        className={`absolute top-full left-0 pt-3 ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <div
          id={menuId}
          role="menu"
          aria-label="Services"
          className={`min-w-[220px] origin-top rounded-tag border border-white/10 bg-surface-secondary/95 p-2 backdrop-blur-md transition-all duration-200 ${
            open
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-tag px-4 py-2 text-body text-ink-primary transition-colors hover:bg-glass-light focus-visible:bg-glass-light focus-visible:outline-none"
            >
              {service.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
