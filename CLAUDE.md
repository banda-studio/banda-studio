# CLAUDE.md — banda-web

> Archivo de contexto para Claude Code. Leelo siempre antes de proponer cambios o escribir código.
>
> Adicional: este proyecto usa **Next.js 16** (con APIs/convenciones que cambiaron respecto de versiones anteriores) y **Tailwind v4** (config CSS-first, no `tailwind.config.ts`). Ver advertencias de Next en `AGENTS.md` y leer `node_modules/next/dist/docs/` antes de usar features avanzadas.

---

## 1. Proyecto

**Nombre público:** Banda Studio
**Nombre interno / repo:** `banda-web`
**Tipo:** Sitio corporativo + portfolio
**Descripción:** Sitio del estudio creativo digital independiente Banda Studio. Presenta la marca y muestra trabajos organizados por servicio: 3D, 2D Motion, VFX, Digital Design, Branding, UX/UI, Websites, Illustrations.
**Naturaleza:** Side project a pulmón, en paralelo a Ready Set. Equipo chico, sin presupuesto pesado.
**Idioma:** Inglés (single-language por ahora). El copy del sitio está en inglés. Este archivo y la comunicación entre Jor y Claude pueden ser en español.
**Identidad visual:** Ya definida. Vive en Figma.

---

## 2. Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Server Components por default. Turbopack default en dev. Leer `AGENTS.md` y `node_modules/next/dist/docs/` antes de usar APIs nuevas. |
| Lenguaje | **TypeScript** | Strict mode. Tipos auto-generados desde Sanity con `@sanity/typegen`. |
| CMS | **Sanity** | Studio embebido en `/studio`. No evaluamos Payload — Sanity alcanza y sobra. |
| Estilos | **Tailwind CSS v4** | **Config CSS-first**. Tokens en `app/globals.css` dentro de `@theme inline { ... }`. **No existe `tailwind.config.ts`** en este proyecto. |
| Animación | **Framer Motion** | Para microinteracciones, fade-ins on scroll, page transitions. |
| Hero 3D | **@splinetool/react-spline** | Lazy-loaded. Fallback en mobile / `prefers-reduced-motion`. |
| Iconos | **lucide-react** | Solo si hace falta algo simple. |
| Tipografía | **Mona Sans** | Vía `next/font/google`, expuesta como CSS var `--font-mona-sans`. Pesos: Regular, Medium, SemiBold. |
| Package manager | **pnpm** | Más rápido, ahorra disco, soporte nativo en Vercel. |
| Hosting | **Vercel** (free tier) | Sin Cloudflare en el medio — Vercel ya tiene CDN. Dominio apunta directo. |
| Email (form contacto) | **Resend** o **Formspree** | A decidir cuando lleguemos al form. |
| Repo | **GitHub** | `banda-studio/banda-studio`. |

### Cosas que NO usamos (importante)

- ❌ Material UI, Chakra UI, shadcn/ui — el diseño es muy custom, los componentes pre-fabricados estorban.
- ❌ jQuery, Bootstrap, librerías CSS antiguas.
- ❌ Pages Router (usamos App Router).
- ❌ JavaScript plano (todo es TS).
- ❌ Client-side fetching innecesario (preferimos Server Components + ISR).
- ❌ `tailwind.config.ts` — Tailwind v4 es CSS-first; la configuración vive en `app/globals.css`.

---

## 3. Diseño

**Figma:** https://www.figma.com/design/E2RWIYSIE4thoMXESBA7aU/Banda-web
*Conectado vía MCP. Leerlo cuando se codeen secciones nuevas para validar tokens y layout exacto.*

> **Detalle completo de tokens y reglas de uso:** ver skill `banda-design-system` en `.claude/skills/banda-design-system/SKILL.md`. Este resumen es solo orientación — la skill es la fuente de verdad operativa.

### Design tokens — colores

Namespace: `surface` para fondos, `ink` para texto, `accent` para el celeste, `glass` para superficies traslúcidas.

```css
/* app/globals.css (referencia conceptual — Tailwind v4 CSS-first) */
@import "tailwindcss";

@theme inline {
  --color-surface-primary: #111111;
  --color-surface-secondary: #000000;
  --color-accent: #70BEFA;
  --color-ink-primary: #FFFFFF;
  --color-ink-on-chip: #231F20;
  --color-glass-light: rgba(255, 255, 255, 0.32);
  --color-glass-dark: rgba(217, 217, 217, 0.08);
}
```

Uso en JSX: `bg-surface-primary`, `text-ink-primary`, `text-accent`, `bg-glass-light`, `text-ink-on-chip`, etc.

### Border radius distintivo

| Token CSS (`@theme`) | Clase Tailwind | Valor | Uso |
|---|---|---|---|
| `--radius-section` | `rounded-section` | `70px` | Secciones grandes con `bg-surface-secondary` |
| `--radius-pill` | `rounded-pill` | `57px` | Botones tipo pill |
| `--radius-badge` | `rounded-badge` | `17px` | Badges (ej: "High-End") |
| `--radius-chip` | `rounded-chip` | `10px` | Chips de servicios |

### Tipografía

- **Familia única:** Mona Sans (Google Font, hecha por GitHub). Cargada con `next/font/google` y expuesta como CSS var `--font-mona-sans`.
- **Pesos:** 400 (Regular), 500 (Medium), 600 (SemiBold).
- **Escala:** definida como tokens nativos de Tailwind v4 en `@theme`. Usalos como clases (`text-hero`, `text-body`), no como CSS vars sueltas.

| Token CSS | Clase Tailwind | Tamaño | Uso |
|---|---|---|---|
| `--text-hero` | `text-hero` | `clamp(2.5rem, 5vw + 1rem, 3.75rem)` (~40 → 60px) | Título del hero |
| `--text-tagline` | `text-tagline` | `clamp(2rem, 3vw + 1rem, 2.5rem)` (~32 → 40px) | Taglines, h2 grandes |
| `--text-title` | `text-title` | `25px` | Títulos de card, subsecciones |
| `--text-subtitle` | `text-subtitle` | `21px` | Subtítulos |
| `--text-body-lg` | `text-body-lg` | `19px` | Body con énfasis |
| `--text-body` | `text-body` | `18px` | Body default |
| `--text-caption` | `text-caption` | `16px` | Microcopy |

Los dos tokens fluidos (`text-hero`, `text-tagline`) ya escalan en mobile vía `clamp()` — no agregar media queries encima.

### Modo

- **Solo dark.** No hay versión clara. No la implementamos — duplicar trabajo sin razón.

---

## 4. Estructura del sitio

### Páginas

| Ruta | Tipo | Notas |
|---|---|---|
| `/` | Home | Hero con partículas Spline, lista horizontal de servicios, showcase de servicio destacado, tagline, CTA "Have an idea?" |
| `/about` | Estática | About Us. Copy hardcoded por ahora. |
| `/services/[slug]` | Dinámica | Una por servicio. Frame "Interna" del Figma. |
| `/work/[slug]` | Dinámica (futura) | Proyectos individuales. Definir cuando lleguemos. |

### Contenido dinámico (editable desde Sanity)

- **Servicios** — `name`, `slug`, `description`, `heroImage`, `projects[]` (referencias).
- **Proyectos** — `title`, `client`, `year`, `videoUrl`, `thumbnail`, `tags[]`, `description`, `service` (referencia al padre).
- **Datos globales** (`siteSettings` singleton) — email de contacto, links sociales, copy del hero.

### Contenido estático (hardcoded en código)

- Estructura de páginas, layout general.
- Copy de About.
- Estilos, animaciones, design tokens.

### Hosting de videos

- **Ahora:** YouTube con embed limpio → `youtube-nocookie.com` + `?rel=0&modestbranding=1&showinfo=0`.
- **Después:** Vimeo Standard ($12/mes) — sin branding, dominio restringido a `banda.studio`.
- **Schema en Sanity:** campo `videoUrl` flexible con detección automática de plataforma (YouTube/Vimeo). Sin cambio de código al migrar.

---

## 5. Hero con partículas

**Estilo:** Partículas reactivas al mouse, estética humo/fluido. Alineado al header image del Figma.
**Implementación:** Spline embed vía `@splinetool/react-spline`, lazy-loaded.

**Por qué Spline y no shader custom:**
- Tiempo de dev: días vs. 1-2 semanas.
- Se ve idéntico a las refs validadas.
- Banda es a pulmón → priorizamos salir online sobre perfección técnica.

### Contenido sobre las partículas

- Badge "High-End" rotado `-3.82deg`.
- Título: "Digital Creative Studio".
- Subheader: "We bring technical precision to your creative vision".
- Botón CTA: "Let's work together!".
- Nav header.

### Performance

- **Lazy load** de la escena Spline (no se carga en initial load).
- **Mobile + `prefers-reduced-motion`:** fallback a imagen estática (en `/public/fallback/`).
- **Prioridad:** no destruir el LCP. Si Spline pesa el inicio, lo movemos a `<Suspense>` con un placeholder y se carga después del paint.

---

## 6. Estructura de carpetas

```
/app
  /(site)               # grupo de rutas públicas (con layout compartido)
    /page.tsx           # home
    /about/page.tsx
    /services/[slug]/page.tsx
  /studio               # Sanity Studio embebido
    /[[...tool]]/page.tsx
  /layout.tsx           # layout root
  /globals.css          # ← config de Tailwind v4 (@theme con tokens) + estilos globales

/components
  /ui                   # atómicos: Button, Pill, ServiceChip, Badge
  /sections             # Hero, ServicesList, ServiceShowcase, CTA, Tagline
  /layout               # Header, Footer, Nav

/lib
  /sanity
    client.ts           # cliente Sanity
    queries.ts          # GROQ queries
    types.ts            # tipos auto-generados
  /utils                # helpers (cn, formatters, video URL parser, etc.)

/sanity
  /schemas
    project.ts
    service.ts
    siteSettings.ts
    index.ts
  sanity.config.ts

/public
  /fallback             # imagen estática del hero para mobile
  /favicons

/.claude
  /skills               # skills project-specific (versionadas, parte del repo)
    banda-design-system/SKILL.md
    nextjs-sanity-stack/SKILL.md + references/
  settings.local.json   # ❌ NO versionado (gitignored). Permisos locales de Claude Code.

AGENTS.md               # convención Next 16 — advertencias para agents (no editar a mano)
CLAUDE.md               # este archivo
README.md
.env.local              # SANITY_PROJECT_ID, SANITY_DATASET, etc.
next.config.ts
postcss.config.mjs
tsconfig.json
package.json
pnpm-lock.yaml
```

---

## 7. Convenciones

### Commits

**Conventional Commits.** Tipos permitidos:

- `feat:` nueva funcionalidad
- `fix:` bug fix
- `chore:` mantenimiento, deps, configs
- `style:` cambios visuales, ajustes de Tailwind
- `refactor:` refactor sin cambio de comportamiento
- `docs:` documentación (incluye este archivo)

Ejemplos:
- `feat(hero): add Spline particles with mobile fallback`
- `fix(sanity): correct project schema reference to service`
- `style(services-list): tighten chip spacing on mobile`

### Naming

- **Componentes:** PascalCase (`ServiceChip.tsx`).
- **Hooks:** `useCamelCase` (`useReducedMotion.ts`).
- **Utils:** camelCase (`parseVideoUrl.ts`).
- **Tipos/Interfaces:** PascalCase, sin prefijo `I`.
- **Archivos de schema Sanity:** kebab o singular (`project.ts`, no `projects.ts`).

### Imports

Usar alias `@/` para imports absolutos desde root.
```ts
import { Button } from '@/components/ui/Button'
import { client } from '@/lib/sanity/client'
```

### Componentes

- Default a **Server Component**. Marcar `'use client'` solo si hace falta state, efectos, listeners, o uso de Framer Motion / Spline.
- Props tipadas explícitamente. Nada de `any`.
- Un componente por archivo. Si es muy chico y privado a otro, está bien co-locarlo.

---

## 8. Cómo trabajar con Claude en este repo

### Antes de codear algo nuevo

1. Si la tarea toca diseño, **leer el frame correspondiente del Figma** vía MCP antes de proponer código. No inventar layouts.
2. Si la tarea toca contenido dinámico, **revisar el schema de Sanity** antes de tocar la query o el componente.
3. Si vas a usar una API de Next que no es 100% estándar (caching, route handlers, middleware, params dinámicos, etc.), **leer las docs en `node_modules/next/dist/docs/`** — Next 16 cambió cosas respecto de 13/14.
4. Si hay duda sobre el stack o convenciones, **leer este archivo primero**.

### Estilo de respuesta

- Concisa. Sin disclaimers innecesarios.
- Si una decisión tiene tradeoffs, mencionarlos brevemente y recomendar uno.
- Al proponer código, mostrar solo lo que cambia, no archivos enteros (salvo que sean nuevos).

### Cosas que Jor prefiere

- Que le tires opciones cuando hay más de un camino razonable, con tu recomendación clara.
- Que asumas que puede leer código bien — no expliques sintaxis básica.
- Comunicación en español, casual y directa.
- Si algo se va a romper en el futuro (ej: deprecación, cambio de API), avisar al momento de escribirlo, no después.

### Cosas a evitar

- Generar componentes "por las dudas" antes de que se necesiten.
- Sugerir librerías nuevas sin razón concreta.
- Sobre-abstraer. El proyecto es chico — está bien tener un poco de duplicación si hace el código más legible.

---

## 9. Decisiones pendientes (a resolver cuando lleguemos)

- [ ] Form de contacto: Resend vs. Formspree.
- [ ] Estructura final de `/work/[slug]` (¿hace falta o alcanza con services?).
- [ ] Estrategia de revalidación de Sanity: webhook a Vercel vs. ISR con tag-based revalidation. *(La skill `nextjs-sanity-stack` recomienda combinar ambas.)*
- [ ] Migración a Vimeo cuando haya presupuesto.

---

## 10. Estado del proyecto

**Etapa actual:** Repo iniciado en GitHub (`banda-studio/banda-studio`). Next.js 16 + Tailwind v4 + TypeScript scaffold listo. Skills project-specific (`banda-design-system`, `nextjs-sanity-stack`) creadas.

**Próximos pasos sugeridos (en orden):**

1. ~~Inicializar repo Next.js + TypeScript + Tailwind con pnpm.~~ ✅
2. Setup de tokens de diseño en `app/globals.css` (`@theme`) + carga de Mona Sans con `next/font/google`.
3. Configurar Sanity (proyecto, dataset, schemas base, Studio embebido).
4. Componentes atómicos (`Button`, `Pill`, `ServiceChip`, `Badge`).
5. Header + Nav.
6. Hero con Spline (con fallback).
7. Resto de secciones de la home.
8. Páginas dinámicas de servicios.
9. About.
10. Deploy a Vercel.

---

*Última actualización: abril 2026.*
