"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Form de contacto del /contact. POSTea a `/api/contact` que envía email
 * via Resend al inbox del estudio.
 *
 * Estilo: inputs underline-only (sin box) para mantener el look editorial
 * minimal del sitio. Estados de loading/success/error se muestran inline
 * debajo del submit.
 *
 * Client Component (estado + handler async).
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Failed to send");
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const disabled = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
      <Field
        label="Name"
        type="text"
        name="name"
        value={form.name}
        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
        autoComplete="name"
        disabled={disabled}
        required
      />
      <Field
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        autoComplete="email"
        disabled={disabled}
        required
      />
      <TextareaField
        label="Message"
        name="message"
        value={form.message}
        onChange={(v) => setForm((f) => ({ ...f, message: v }))}
        disabled={disabled}
        required
      />

      <div className="mt-2 flex flex-col items-start gap-4">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-pill border border-transparent px-7 py-2.5 text-caption font-medium text-ink-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 [background:linear-gradient(var(--color-surface-primary),var(--color-surface-primary))_padding-box,linear-gradient(135deg,var(--color-accent),var(--color-border-fade))_border-box]"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>

        {status === "success" && (
          <p role="status" className="text-body text-accent">
            Thanks! We&apos;ll get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-body text-white/70">
            Couldn&apos;t send the message. {errorMsg ? `(${errorMsg}) ` : ""}
            Try again in a bit, or write to us directly.
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  type,
  name,
  value,
  onChange,
  autoComplete,
  disabled,
  required,
}: {
  label: string;
  type: "text" | "email";
  name: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const id = `field-${name}`;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-caption font-medium uppercase tracking-[0.18em] text-white/50"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        className="border-b border-white/20 bg-transparent py-2 text-body text-ink-primary transition-colors placeholder:text-white/30 focus:border-accent focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  disabled,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  const id = `field-${name}`;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-caption font-medium uppercase tracking-[0.18em] text-white/50"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        rows={5}
        className="resize-none border-b border-white/20 bg-transparent py-2 text-body text-ink-primary transition-colors placeholder:text-white/30 focus:border-accent focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
