---
name: banda-design-system
description: Tokens de diseño, escala tipográfica, border radius y reglas de estilo del proyecto Banda Studio (banda-web). Usá esta skill SIEMPRE que toques cualquier cosa visual del repo, incluso si el usuario no lo pide explícitamente: cuando crees o modifiques un componente UI, una sección, layout, o estilo en Tailwind; cuando traduzcas un frame de Figma a código; cuando escribas o ajustes valores de color, tipografía, spacing, border radius, sombras, o efectos glass; cuando definas una nueva variante de botón, chip, badge, o pill. También activá si el usuario menciona "el diseño", "los tokens", "Mona Sans", "el celeste", "el fondo oscuro", "rounded", "glass", "surface", "ink", o pega un screenshot/frame de Figma. Es el comportamiento default cada vez que algo del output va a verse en pantalla.
---

# Banda Studio — Design System

> Tokens y reglas de estilo del sitio banda-web. Mantenete fiel a esto en todo lo visual.

## Por qué importa

El diseño de Banda ya está cerrado en Figma. Inventar valores ad-hoc rompe la consistencia visual y genera deuda. Los tokens viven en `app/globals.css` (Tailwind v4 — config CSS-first, no hay `tailwind.config.ts`) dentro de `@theme inline { ... }`. Usalos siempre que existan; nunca hardcodees el equivalente literal.

## Colores

Namespace `surface` para fondos, `ink` para texto, `accent` para el celeste, `glass` para superficies traslúcidas, `border-fade` para el extremo "frío" de los gradients del border de CTAs.

| Token Tailwind | Hex / valor | Uso |
|---|---|---|
| `bg-surface-primary` | `#0A0A0A` | Fondo principal del sitio |
| `bg-surface-secondary` | `#000000` | Secciones grandes con `rounded-section` |
| `text-accent` / `border-accent` / `bg-accent` | `#70BEFA` | Acento celeste — bordes, hovers, highlights, extremo "vivo" del gradient de los CTAs |
| `border-fade` / `bg-border-fade` | `#666666` | Extremo "apagado" del gradient en el border de los CTAs (gris medio) |
| `text-ink-primary` | `#FFFFFF` | Texto sobre fondos oscuros |
| `text-ink-on-chip` | `#231F20` | Texto sobre chips/pills de fondo claro |
| `bg-glass-light` | `rgba(255,255,255,0.32)` | Glass claro — fondo de CTAs y cards traslúcidas |
| `bg-glass-dark` | `rgba(217,217,217,0.08)` | Glass oscuro — overlays sutiles, hovers |

### Reglas

- **Solo dark mode.** No agregues clases `dark:` ni lógica de toggle. No existe versión light, no la implementes.
- El acento celeste (`#70BEFA`) es el único color "vivo". Usalo con criterio — si todo es accent, nada es accent.
- Para texto secundario sobre fondo oscuro, bajá la opacidad del blanco (`text-white/60`, `text-white/80`) en lugar de inventar grises nuevos.
- Nunca uses `bg-black` o `bg-white` literal — siempre el token correspondiente (`bg-surface-secondary`, `text-ink-primary`).
- `border-fade` (`#666666`) tiene un único uso documentado: ser el "to" del gradient en el border de los CTAs (`from-accent to-border-fade`). No lo uses como color de fondo, texto, ni borde sólido — para eso preferí bajar la opacidad del blanco.

## Border radius

Tres tokens. La filosofía: cada uno cubre un tipo distinto de elemento.

| Token | Valor | Uso |
|---|---|---|
| `rounded-pill` | `9999px` (pill perfecto) | **CTAs y elementos pill-shaped**: botones, "More Works >", links navegacionales tipo pill. Siempre 100% redondeado, sin importar el tamaño. |
| `rounded-tag` | `0.75em` (relativo al font-size) | **Resaltados y tags**: badge "High-End", chips de servicios ("3D", "2D Motion", etc.), labels de status. Esquinas redondeadas pero NO pill. Escala proporcional al texto. |
| `rounded-section` | `70px` | **Secciones grandes con fondo**: bloques con `bg-surface-secondary` y mucho padding. |

### Por qué cada uno tiene esa unidad

- **`rounded-pill: 9999px`** — un valor enorme garantiza extremos siempre semicirculares. Si usaras un valor fijo en px (ej: 70px), un pill alto se vería bien pero uno bajito quedaría con esquinas "casi rectas".
- **`rounded-tag: 0.75em`** — `em` es relativo al `font-size` del elemento. Un tag chico con `text-caption` tiene radius ~12px; un badge grande con `text-body` tiene radius ~13.5px. Visualmente equivalente. Nota: NO usamos `%` porque en CSS el `border-radius: X%` calcula el radius como % del ancho/alto del elemento (radius elíptico/estirado en elementos alargados — feo).
- **`rounded-section: 70px`** — fijo. Las secciones grandes están en un rango de tamaños similar y un valor fijo da consistencia.

### Cuándo usar cuál

```tsx
// CTA principal o link pill — siempre pill
<button className="rounded-pill ...">Let's work together!</button>

// Resaltado / badge / chip — esquinas redondeadas relativas
<span className="rounded-tag ...">High-End</span>
<span className="rounded-tag ...">3D</span>
<span className="rounded-tag ...">Available now</span>

// Sección grande con fondo
<section className="rounded-section bg-surface-secondary p-20">...</section>
```

### Regla crítica

**Nunca hardcodear el valor literal.** Si necesitás un pill, usá `rounded-pill`, no `rounded-full` ni `rounded-[9999px]`. Si necesitás esquinas redondeadas de tag, usá `rounded-tag`, no `rounded-md` o `rounded-[12px]`. Si encontrás un valor hardcodeado en código existente, reemplazalo por el token.

```tsx
// ❌ Mal
<section className="rounded-[70px] bg-black">
<button className="rounded-full ...">
<span className="rounded-md ...">High-End</span>

// ✅ Bien
<section className="rounded-section bg-surface-secondary">
<button className="rounded-pill ...">
<span className="rounded-tag ...">High-End</span>
```

Si un diseño de Figma pide un radius distinto a los 3 tokens (ej: una card grande con esquinas de 24px que no es ni pill ni section), **pará y preguntá** antes de inventar un token nuevo. Tres opciones a evaluar:

1. ¿Se puede reusar `rounded-tag` (relativo) o `rounded-section` (fijo)?
2. ¿Es un caso recurrente que justifica un token nuevo (ej: `rounded-card`)?
3. ¿Es un one-off del Figma que en realidad debería ser uno de los tokens? (a veces el Figma tiene valores arbitrarios)

## Patrón: CTA con border gradient (centro sólido)

El CTA estándar del sitio (ej: "Get in touch", "Let's work together!") tiene **centro sólido** y un **border de 1px con gradient lineal del celeste al gris** (`accent → border-fade`). El centro NO es glass — es opaco para que cuando haya algo animándose en el background (blobs, partículas del hero) no se filtre por debajo del botón.

CSS no soporta `border: linear-gradient(...)` directamente con `border-radius` (rompe la curva del radius). Por eso se usa la técnica de **doble background**: uno con `padding-box` (interior sólido) y otro con `border-box` (cubre el border de 1px con el gradient).

```tsx
<a
  href="mailto:..."
  className="
    rounded-pill px-9 py-3 text-body font-medium text-ink-primary
    border border-transparent
    transition-opacity hover:opacity-90
    [background:linear-gradient(var(--color-surface-primary),var(--color-surface-primary))_padding-box,linear-gradient(135deg,var(--color-accent),var(--color-border-fade))_border-box]
  "
>
  Get in touch
</a>
```

### Cómo funciona

- `border: 1px solid transparent` reserva el espacio del border de 1px sin pintarlo.
- El primer layer del `background` (`linear-gradient(surface-primary, surface-primary) padding-box`) pinta el interior con un sólido `surface-primary` — el mismo color que el fondo de la página, así el botón se "funde" con el fondo en el centro.
- El segundo layer (`linear-gradient(135deg, accent, border-fade) border-box`) pinta el gradient solo en la zona del border (porque el primer layer en `padding-box` lo tapa en el interior).
- Resultado: pill con border gradient de 1px, centro opaco que NO deja ver lo que pasa atrás.

### Por qué NO usamos glass-light en el centro

Probamos antes con un wrapper p-px + child glass-light. El problema: glass-light es semi-transparente (32% blanco), y deja ver el gradient del wrapper / cualquier animación del fondo a través del centro del botón. Queda un "degradé interno" que no es lo que el Figma pide.

Si en algún caso futuro un CTA específico SÍ tiene que ser glass (ej: superpuesto sobre una imagen de hero, donde se quiere "transparencia"), agregamos una variante `glass` al componente `<Button>`. Default, **sólido + border gradient**.

### Notas

- `border border-transparent` mantiene el espacio del border. Si lo sacás, el child se "agranda" 2px.
- Tailwind v4 renombró las utilidades de gradient: usá `bg-linear-to-X` (no `bg-gradient-to-X` que es la sintaxis vieja v3). Direcciones: `to-r`, `to-br`, `to-b`, etc. **Pero** en el `[background:...]` arbitrary del CTA usamos sintaxis CSS pura porque combinamos dos layers — no hay shorthand de Tailwind para eso.
- Cuando encapsules el patrón en `<Button variant="cta">`, el arbitrary value se vuelve internal — el resto del código usa `<Button>` y se olvida.

## Tipografía — Mona Sans

**Familia única en todo el sitio.** No agregues otras fuentes. Cargada vía `next/font/google` y expuesta como CSS var `--font-mona-sans` desde `app/layout.tsx`. El token `--font-sans` en `@theme` apunta a esa CSS var, así que `font-sans` y el body inherit todo funciona.

### Pesos disponibles

- `font-normal` (400) — texto corriente
- `font-medium` (500) — labels, navegación, microcopy
- `font-semibold` (600) — títulos, énfasis

No uses pesos fuera de estos tres. No uses `italic` salvo pedido explícito.

### Escala tipográfica — tokens nativos de Tailwind v4

Definidos en `app/globals.css` dentro de `@theme inline { ... }`. Usalos como clases directas (`text-hero`, `text-body`), no como variables CSS.

| Token | Tamaño | Uso |
|---|---|---|
| `text-hero` | `clamp(2.5rem, 5vw + 1rem, 3.75rem)` (~40 → 60px) | Título principal del hero |
| `text-tagline` | `clamp(2rem, 3vw + 1rem, 2.5rem)` (~32 → 40px) | Taglines, h2 grandes de sección |
| `text-title` | `25px` | Títulos de card, subsecciones |
| `text-subtitle` | `21px` | Subtítulos, lead paragraphs |
| `text-body-lg` | `19px` | Body con énfasis |
| `text-body` | `18px` | Body default |
| `text-caption` | `16px` | Microcopy, footnotes, labels chicos |

### Uso

```tsx
// ✅ Bien — token nativo
<h1 className="text-hero font-semibold text-ink-primary">
  Digital Creative Studio
</h1>

<p className="text-body text-white/80">
  We bring technical precision to your creative vision.
</p>

// ❌ Mal — tamaño literal o variable CSS suelta
<h1 className="text-[60px]">...</h1>
<h1 className="text-[length:var(--text-hero)]">...</h1>
```

### Reglas

- Títulos grandes (`text-hero`, `text-tagline`): siempre `font-semibold`.
- Body: `font-normal`, usar `text-body` o `text-body-lg`.
- No mezcles los tokens del design system con los defaults de Tailwind (`text-xl`, `text-2xl`, etc.) — si necesitás un tamaño que no está en la escala, **pará y preguntá** antes de inventar uno.
- Los dos tokens fluidos (`text-hero`, `text-tagline`) ya escalan solos en mobile. No agregues media queries encima.

## Glass effects

Los dos tokens `bg-glass-light` y `bg-glass-dark` se usan para superficies traslúcidas (cards sobre el hero, overlays, headers flotantes, fondo de CTAs). Combinalos con `backdrop-blur` para el efecto completo:

```tsx
<div className="bg-glass-light backdrop-blur-md rounded-pill px-6 py-3">
  Have an idea?
</div>
```

No inventes nuevos `rgba()` para glass. Si necesitás otra opacidad, preguntá antes si vale la pena agregar un token nuevo.

## Componentes atómicos esperados

Cuando crees `/components/ui/`, estos componentes encapsulan los tokens. Antes de inline-ar clases en una sección, **verificá si ya existe el componente**:

- `Button` — variantes:
  - `cta` (principal): glass + gradient border (`from-accent to-border-fade`), `rounded-pill`. Usa el wrapper con `p-px`.
  - `secondary`: solo glass + `rounded-pill` (sin gradient border).
- `Pill` — wrapper genérico con `rounded-pill`, padding configurable. Útil si el botón no es un CTA pero comparte la forma pill (ej: link navegacional pill-shaped).
- `ServiceChip` — `rounded-tag`, fondo claro (`bg-ink-primary`), texto `text-ink-on-chip`. Para los chips "3D, 2D Motion, VFX, etc."
- `Badge` — `rounded-tag`, glass o accent. Ej: "High-End" rotado `-3.82deg`.

Diferenciación clara: `Button` y `Pill` usan **`rounded-pill`** (pill perfecto). `ServiceChip` y `Badge` usan **`rounded-tag`** (esquinas redondeadas relativas).

## Rotaciones y detalles del Figma

El badge "High-End" en el hero está rotado `-3.82deg`. Mantené ese valor exacto — no lo redondees a `-4deg`. Lo mismo aplica a otros valores específicos del Figma (ej: el border de 1.23px del CTA): respetá lo que dice el archivo, no lo "limpies" a ojo. Si el spec del Figma tiene un valor que no entra en los tokens y NO es un error, agregá el caso a esta skill antes de seguir.

## Checklist mental al crear o editar algo visual

1. ¿Estoy usando un token de color (`surface-*`, `ink-*`, `accent`, `border-fade`, `glass-*`) en vez de un hex hardcodeado?
2. ¿Qué tipo de elemento es?
   - CTA / link pill → `rounded-pill` (siempre 100% redondeado).
   - Badge / chip / tag / resaltado → `rounded-tag` (esquinas redondeadas relativas al texto).
   - Sección grande con fondo → `rounded-section` (70px fijo).
   - Otra cosa → preguntar antes de inventar un radius nuevo.
3. ¿El tamaño de texto es un token de la escala (`text-hero`, `text-body`, etc.) o estoy hardcodeando px?
4. ¿Estoy usando Mona Sans con peso 400/500/600?
5. ¿Si es un CTA, está usando el patrón glass + gradient border documentado en esta skill?
6. ¿El componente atómico que necesito ya existe en `/components/ui/`?

Si alguna respuesta es "no", parate y reconsiderá antes de seguir.

## Referencia rápida — config de tokens (Tailwind v4, CSS-first)

> **Importante:** Este proyecto usa **Tailwind CSS v4**. **No existe `tailwind.config.ts`.** Toda la configuración vive en `app/globals.css` dentro de `@theme inline { ... }`. Las clases utilitarias en JSX (`bg-surface-primary`, `rounded-pill`, `text-hero`) se siguen usando igual.

Forma esperada de los tokens en `app/globals.css`:

```css
/* app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Colors */
  --color-surface-primary: #0a0a0a;
  --color-surface-secondary: #000000;
  --color-accent: #70befa;
  --color-border-fade: #666666;
  --color-ink-primary: #ffffff;
  --color-ink-on-chip: #231f20;
  --color-glass-light: rgba(255, 255, 255, 0.32);
  --color-glass-dark: rgba(217, 217, 217, 0.08);

  /* Border radius */
  --radius-pill: 9999px;       /* CTAs, links pill (siempre 100% redondeado) */
  --radius-tag: 0.75em;        /* Badges, chips, resaltados (relativo al font-size) */
  --radius-section: 70px;      /* Secciones grandes con bg-surface-secondary */

  /* Font sizes — el sufijo `--line-height` ata el line-height al tamaño */
  --text-hero: clamp(2.5rem, 5vw + 1rem, 3.75rem);
  --text-hero--line-height: 1.05;
  --text-tagline: clamp(2rem, 3vw + 1rem, 2.5rem);
  --text-tagline--line-height: 1.1;
  --text-title: 25px;
  --text-title--line-height: 1.2;
  --text-subtitle: 21px;
  --text-subtitle--line-height: 1.3;
  --text-body-lg: 19px;
  --text-body-lg--line-height: 1.5;
  --text-body: 18px;
  --text-body--line-height: 1.5;
  --text-caption: 16px;
  --text-caption--line-height: 1.4;

  /* Font family — Mona Sans expuesta como CSS var por next/font/google */
  --font-sans: var(--font-mona-sans), system-ui, sans-serif;
}
```

### Notas de la sintaxis v4

- **Prefijos de namespace:** `--color-*` define colores, `--radius-*` define border-radius, `--text-*` define font-size, `--font-*` define font-family. Tailwind v4 mapea automáticamente a las clases utilitarias correspondientes.
- **Nombres con guion:** `--color-ink-on-chip` se usa en JSX como `text-ink-on-chip` (kebab-case completo).
- **Line-height pareado:** la convención v4 para atar un line-height a un font-size es `--text-X--line-height: Y`.
- **`@theme inline`:** el modifier `inline` evita que las CSS vars sean accedidas en runtime — los valores se compilan directamente en las utilities. Útil para tokens estáticos como los nuestros.
- **Gradients:** usá `bg-linear-to-X` (v4), no `bg-gradient-to-X` (v3 deprecated).

Esta config es la **fuente de verdad**. Si algo de la skill se contradice con el `globals.css` real, **gana el CSS** — actualizá esta skill para reflejarlo.
