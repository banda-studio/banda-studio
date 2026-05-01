"use client";

import { useState } from "react";

interface EmailLinkProps {
  email: string;
}

/**
 * Email del header. Click → copia al clipboard + muestra "Email copied" 2s.
 * Si el clipboard API no está disponible (browser viejo, contexto inseguro
 * tipo http://), cae a `mailto:` clásico.
 *
 * El elemento es `<a href="mailto:...">` para que (1) screen readers lo
 * anuncien como link, (2) right-click → "Copy link address" funcione,
 * (3) si JS falla, igual abre el cliente de mail.
 */
export function EmailLink({ email }: EmailLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      // Sin clipboard API → dejá que el href mailto: haga su trabajo.
      return;
    }
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <a
      href={`mailto:${email}`}
      onClick={handleClick}
      aria-label={`Copy email ${email} to clipboard`}
      className="relative inline-flex items-center gap-2 text-body-lg text-ink-primary transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none"
    >
      <span>{email}</span>
      {/* Círculo con flecha diagonal arrow-up-right (estilo "abrir/actuar"). */}
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-pill border border-white/20"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 17 17 7M7 7h10v10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute top-full right-0 mt-2 rounded-tag bg-glass-light backdrop-blur-md px-3 py-1.5 text-caption font-medium text-ink-primary transition-opacity duration-200 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        Email copied
      </span>
    </a>
  );
}
