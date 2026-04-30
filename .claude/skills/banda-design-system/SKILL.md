---
name: banda-design-system
description: Tokens de diseño, escala tipográfica, border radius y reglas de estilo del proyecto Banda Studio (banda-web). Usá esta skill SIEMPRE que toques cualquier cosa visual del repo, incluso si el usuario no lo pide explícitamente: cuando crees o modifiques un componente UI, una sección, layout, o estilo en Tailwind; cuando traduzcas un frame de Figma a código; cuando escribas o ajustes valores de color, tipografía, spacing, border radius, sombras, o efectos glass; cuando definas una nueva variante de botón, chip, badge, o pill. También activá si el usuario menciona "el diseño", "los tokens", "Mona Sans", "el celeste", "el fondo oscuro", "rounded", "glass", "surface", "ink", o pega un screenshot/frame de Figma. Es el comportamiento default cada vez que algo del output va a verse en pantalla.
---

# Banda Studio — Design System

> Tokens y reglas de estilo del sitio banda-web. Mantenete fiel a esto en todo lo visual.

## Por qué importa

El diseño de Banda ya está cerrado en Figma. Inventar valores ad-hoc rompe la consistencia visual y genera deuda. Los tokens viven en `tailwind.config.ts` y deben usarse siempre que existan — nunca hardcodear el equivalente literal.

## Colores

Namespace `surface` para fondos, `ink` para texto, `accent` para el celeste, `glass` para superficies traslúcidas.

| Token Tailwind | Hex / valor | Uso |
|---|---|---|
| `bg-surface-primary` | `#111111` | Fondo principal del sitio |
| `bg-surface-secondary` | `#000000` | Secciones grandes con `rounded-section` |
| `text-accent` / `border-accent` / `bg-accent` | `#70BEFA` | Acento celeste — bordes, hovers, highlights |
| `text-ink-primary` | `#FFFFFF` | Texto sobre fondos oscuros |
| `text-ink-onChip` | `#231F20` | Texto sobre chips de servicios (fondo claro) |
| `bg-glass-light` | `rgba(255,255,255,0.32)` | Glass claro |
| `bg-glass-dark` | `rgba(217,217,217,0.08)` | Glass oscuro |

### Reglas

- **Solo dark mode.** No agregues clases `dark:` ni lógica de toggle. No existe versión light, no la implementes.
- El acento celeste (`#70BEFA`) es el único color "vivo". Usalo con criterio — si todo es accent, nada es accent.
- Para texto secundario sobre fondo oscuro, bajá la opacidad del blanco (`text-white/60`, `text-white/80`) en lugar de inventar grises nuevos.
- Nunca uses `bg-black` o `bg-white` literal — siempre el token correspondiente (`bg-surface-secondary`, `text-ink-primary`).

## Border radius

| Token | Valor | Uso |
|---|---|---|
| `rounded-section` | `70px` | Secciones grandes con `bg-surface-secondary` |
| `rounded-pill` | `57px` | Botones tipo pill |
| `rounded-badge` | `17px` | Badges (ej: "High-End") |
| `rounded-chip` | `10px` | Chips de servicios (3D, 2D Motion, etc.) |

### Regla crítica

**Nunca hardcodear el valor literal.** Si necesitás 70px de radius, usá `rounded-section`, no `rounded-[70px]`. Si encontrás un valor hardcodeado en código existente, reemplazalo por el token.

```tsx
// ❌ Mal
<section className="rounded-[70px] bg-black">

// ✅ Bien
<section className="rounded-section bg-surface-secondary">
```

Si un diseño de Figma pide un radius que no existe en los tokens (ej: 24px), **pará y preguntá** antes de hardcodearlo. Probablemente sea un error del Figma o un token nuevo que vale la pena agregar al config.

## Tipografía — Mona Sans

**Familia única en todo el sitio.** No agregues otras fuentes. Cargada vía `next/font/google` (decisión pendiente entre Google CDN o self-host — ver CLAUDE.md sección 9).

### Pesos disponibles

- `font-normal` (400) — texto corriente
- `font-medium` (500) — labels, navegación, microcopy
- `font-semibold` (600) — títulos, énfasis

No uses pesos fuera de estos tres. No uses `italic` salvo pedido explícito.

### Escala tipográfica — tokens nativos de Tailwind

Definidos en `tailwind.config.ts` bajo `theme.extend.fontSize`. Usalos como clases directas (`text-hero`, `text-body`), no como variables CSS.

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

Los dos tokens `bg-glass-light` y `bg-glass-dark` se usan para superficies traslúcidas (cards sobre el hero, overlays, headers flotantes). Combinalos con `backdrop-blur` para el efecto completo:

```tsx
<div className="bg-glass-light backdrop-blur-md rounded-pill px-6 py-3">
  Have an idea?
</div>
```

No inventes nuevos `rgba()` para glass. Si necesitás otra opacidad, preguntá antes si vale la pena agregar un token nuevo.

## Componentes atómicos esperados

Cuando crees `/components/ui/`, estos componentes encapsulan los tokens. Antes de inline-ar clases en una sección, **verificá si ya existe el componente**:

- `Button` — variantes: primary (con accent), secondary (glass). Usa `rounded-pill`.
- `Pill` — versión genérica del shape pill.
- `ServiceChip` — `rounded-chip`, fondo claro, texto `text-ink-onChip`.
- `Badge` — `rounded-badge`, ej: "High-End" rotado `-3.82deg`.

## Rotaciones y detalles del Figma

El badge "High-End" en el hero está rotado `-3.82deg`. Mantené ese valor exacto — no lo redondees a `-4deg`. Lo mismo aplica a otros valores específicos del Figma: respetá lo que dice el archivo, no lo "limpies" a ojo.

## Checklist mental al crear o editar algo visual

1. ¿Estoy usando un token de color (`surface-*`, `ink-*`, `accent`, `glass-*`) en vez de un hex hardcodeado?
2. ¿El border radius es uno de los 4 tokens, o estoy inventando un valor?
3. ¿El tamaño de texto es un token de la escala (`text-hero`, `text-body`, etc.) o estoy hardcodeando px?
4. ¿Estoy usando Mona Sans con peso 400/500/600?
5. ¿El componente atómico que necesito ya existe en `/components/ui/`?

Si alguna respuesta es "no", parate y reconsiderá antes de seguir.

## Referencia rápida — config de tokens (Tailwind v4, CSS-first)

> **Importante:** Este proyecto usa **Tailwind CSS v4**. **No existe `tailwind.config.ts`.** Toda la configuración vive en `app/globals.css` dentro de `@theme inline { ... }`. Las clases utilitarias en JSX (`bg-surface-primary`, `rounded-section`, `text-hero`) se siguen usando igual.

Forma esperada de los tokens en `app/globals.css`:

```css
/* app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Colors */
  --color-surface-primary: #111111;
  --color-surface-secondary: #000000;
  --color-accent: #70BEFA;
  --color-ink-primary: #FFFFFF;
  --color-ink-on-chip: #231F20;
  --color-glass-light: rgba(255, 255, 255, 0.32);
  --color-glass-dark: rgba(217, 217, 217, 0.08);

  /* Border radius */
  --radius-section: 70px;
  --radius-pill: 57px;
  --radius-badge: 17px;
  --radius-chip: 10px;

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

/* Defaults globales */
body {
  background: var(--color-surface-primary);
  color: var(--color-ink-primary);
  font-family: var(--font-sans);
}
```

### Notas de la sintaxis v4

- **Prefijos de namespace:** `--color-*` define colores, `--radius-*` define border-radius, `--text-*` define font-size, `--font-*` define font-family. Tailwind v4 mapea automáticamente a las clases utilitarias correspondientes.
- **Nombres con guion:** `--color-ink-on-chip` se usa en JSX como `text-ink-on-chip` (kebab-case completo).
- **Line-height pareado:** la convención v4 para atar un line-height a un font-size es `--text-X--line-height: Y`.
- **`@theme inline`:** el modifier `inline` evita que las CSS vars sean accedidas en runtime — los valores se compilan directamente en las utilities. Útil para tokens estáticos como los nuestros.

Esta config es la **fuente de verdad**. Si algo de la skill se contradice con el `globals.css` real, **gana el CSS** — actualizá esta skill para reflejarlo.
