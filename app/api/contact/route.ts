import { NextResponse } from "next/server";
import { Resend } from "resend";

import { CONTACT_EMAIL } from "@/lib/services";

/**
 * POST /api/contact
 *
 * Recibe { name, email, message } y dispara un email via Resend al inbox
 * del estudio (`CONTACT_EMAIL`). Reply-To se setea al email del visitante
 * para que responder desde Gmail vaya directo a esa dirección.
 *
 * **Env vars requeridas:**
 * - `RESEND_API_KEY` — API key de https://resend.com (free tier: 3K/mes).
 *
 * **From address:** mientras el dominio no esté verificado en Resend, va
 * el `onboarding@resend.dev` (sandbox de Resend, válido pero menos pro).
 * Cuando se verifique `banda.studio` (DNS records en Namecheap), cambiar a
 * algo como `Banda Studio <hello@banda.studio>`.
 */
export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, message" },
      { status: 400 },
    );
  }

  // Validación email mínima — el HTML5 type=email del form ya frena la
  // mayoría, esto es defense in depth contra requests directos a la API.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  // Escape HTML por las dudas — el destinatario es el equipo de Banda, no
  // un tercero, pero un Gmail moderno renderiza HTML y mejor no inyectar.
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const messageHtml = esc(message).replace(/\n/g, "<br>");

  try {
    const { error } = await resend.emails.send({
      from: "Banda Studio <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `New inquiry from ${name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px;">
          <h2 style="margin: 0 0 16px;">New inquiry via banda.studio</h2>
          <p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p>${messageHtml}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
