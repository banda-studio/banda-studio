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
| Animación | **GSAP** (`@gsap/react` + ScrollTrigger) | Scroll-pin del showcase, reveal on-scroll (`components/ui/Reveal.tsx`), wireframe-draw del ContactCTA. NO usamos Framer Motion. |
| Hero background | **Video self-hosted** en loop (`/public/hero`) | Reemplazó a las partículas Canvas2D. 16:9 desktop / 9:16 mobile, poster-first LCP, fallback estático en `prefers-reduced-motion`. Ver §5. |
| Analytics | **Vercel Analytics + Speed Insights** | `<Analytics/>` + `<SpeedInsights/>` en el root layout. Solo emiten en el deploy de Vercel. |
| Iconos | **lucide-react** | Solo si hace falta algo simple. |
| Tipografía | **Mona Sans** | Vía `next/font/google`, expuesta como CSS var `--font-mona-sans`. Pesos: Regular, Medium, SemiBold. |
| Package manager | **pnpm** | Más rápido, ahorra disco, soporte nativo en Vercel. |
| Hosting | **Vercel** (free tier) | CDN propio de Vercel. Deploy auto desde `main`. Dominio productivo: **`www.bandastudio.tv`** (DNS en Namecheap). |
| Email (form contacto) | **Resend** | Decidido y en uso. Dominio `bandastudio.tv` verificado; el form envía desde `hello@bandastudio.tv`. |
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

Namespace: `surface` para fondos, `ink` para texto, `accent` para el celeste, `border-fade` para el extremo gris del gradient en el border de los CTAs, `glass` para superficies traslúcidas.

```css
/* app/globals.css (referencia conceptual — Tailwind v4 CSS-first) */
@import "tailwindcss";

@theme inline {
  --color-surface-primary: #0A0A0A;
  --color-surface-secondary: #000000;
  --color-accent: #70BEFA;
  --color-border-fade: #666666;
  --color-ink-primary: #FFFFFF;
  --color-ink-on-chip: #231F20;
  --color-glass-light: rgba(255, 255, 255, 0.32);
  --color-glass-dark: rgba(217, 217, 217, 0.08);
}
```

Uso en JSX: `bg-surface-primary`, `text-ink-primary`, `text-accent`, `border-fade`, `bg-glass-light`, `text-ink-on-chip`, etc.

### Border radius

Tres tokens, cada uno cubre un tipo de elemento.

| Token CSS (`@theme`) | Clase Tailwind | Valor | Uso |
|---|---|---|---|
| `--radius-pill` | `rounded-pill` | `9999px` (pill perfecto) | CTAs y links pill-shaped (botones, "More Works >") — siempre 100% redondeado |
| `--radius-tag` | `rounded-tag` | `clamp(0.5rem, 0.75em, 1rem)` (~8 → 16px, relativo al font-size con cap) | Badges, chips, resaltados (badge "High-End", chips de servicios) — esquinas redondeadas pero no pill, escalan con el texto y se cappean en 16px para que un highlight grande no parezca pill |
| `--radius-section` | `rounded-section` | `70px` | Secciones grandes con `bg-surface-secondary` |

`em` en lugar de `%`: con `%`, en CSS, el radius se calcula sobre el ancho/alto y queda elíptico/estirado en elementos alargados; con `em` el radius es circular y proporcional al texto, que es lo que define el tamaño visual de un tag.

Para un CTA con border gradient (`accent → border-fade`), usar el patrón **glass + wrapper con `p-px`** documentado en la skill `banda-design-system`.

### Tipografía

- **Familia única:** Mona Sans (Google Font, hecha por GitHub). Cargada con `next/font/google` y expuesta como CSS var `--font-mona-sans`.
- **Pesos:** 400 (Regular), 500 (Medium), 600 (SemiBold).
- **Escala:** definida como tokens nativos de Tailwind v4 en `@theme`. Usalos como clases (`text-hero`, `text-body`), no como CSS vars sueltas.

| Token CSS | Clase Tailwind | Tamaño | Uso |
|---|---|---|---|
| `--text-hero` | `text-hero` | `clamp(3rem, 6vw + 1rem, 5.5rem)` (~48 → 88px) | Título del hero |
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
| `/` | Home | Hero con **video de fondo** (partículas), marquee de specialties, showcase scroll-pinned, tagline, ContactCTA. Es la home real (ya no hay landing de maintenance). |
| `/about` | Estática | `AboutHero` (copy hardcoded) + `ClientsStrip` (logos) + ContactCTA. |
| `/contact` | Estática | `ContactHero` con form (`ContactForm` → `POST /api/contact` vía Resend). |
| `/services/[slug]` | Dinámica (SSG) | Una por servicio. Frame "Interna" del Figma. |
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

Estrategia mixta (decidida jul-2026):

- **Home (hero + showcase):** **self-hosted** en `/public`. Es la página más vista → priorizamos calidad, loop limpio, cero branding. Se pre-hornean con ffmpeg (16:9 desktop / 9:16 mobile, comprimidos, sin audio, poster para LCP). Hero en `/public/hero`, showcase en `/public/showcase`. Excepción: el desktop de 3D y 2D del showcase sigue en YouTube.
- **Páginas internas (`/services/[slug]`):** **YouTube** (`youtube-nocookie.com`, embed limpio vía `YouTubeLoopVideo`). Son grids de 6-8 videos → el lazy-load de YouTube conviene y evita meter decenas de MB al repo.
- **Si la compresión no alcanza:** subir los originales a **Cloudflare R2** (egress gratis) y cambiar solo el `src` en `lib/services.ts` — el componente no cambia.
- **Aspect ratios (YouTube):** **hardcodeados** en `serviceDetails` (`"W/H"`). Antes se scrapeaban en runtime pero YouTube sirve HTML reducido a IPs de datacenter (Vercel) → salía mal. Para un video nuevo, correr `node_modules/.cache/probe-aspects.cjs` con el ID desde una IP residencial y pegar el valor.

---

## 5. Hero (video de fondo)

**Estilo:** partículas en movimiento, estética humo/fluido. Alineado al header image del Figma.

**Historia:** arrancó como idea de Spline → se implementó como campo de partículas Canvas2D reactivas al mouse → **hoy es un video de fondo en loop** (partículas renderizadas, sin interactividad). Ni Spline ni Three.js siguen en el proyecto.

**Implementación actual** (`components/sections/HeroBackground.tsx`, client):
- Video self-hosted en `/public/hero`, pre-horneado con ffmpeg desde un source 9:16:
  - **Desktop:** `particles-desktop.mp4` — rotado a **16:9** (1920×1080), así se ve nítido a resolución nativa.
  - **Mobile:** `particles-mobile.mp4` — **9:16** (720×1280).
- Se sirve **una sola versión** según viewport (matchMedia), no las dos.
- `poster` (primer frame) pinta al instante → no rompe el LCP; el video baja en segundo plano.
- `muted` seteado por ref (el atributo JSX no siempre se refleja y sin muted el autoplay se bloquea).
- **`prefers-reduced-motion`:** no reproduce video, muestra el poster estático.
- Overlay `bg-gradient` sutil encima para el contraste del texto.

### Contenido sobre el video

- Badge "High-End" rotado `-3.82deg` (chip LiquidGlass).
- Título: "Digital Creative Studio".
- Subheader: "We bring technical precision to your creative vision".
- CTA: "Let's work together!" — **glass translúcido** (`bg-white/10` + backdrop-blur) con hover notorio (borde accent + glow), para que el video se vea a través.
- El contenido entra con un `Reveal` (fade + blur + slide, stagger).

**Si querés bajar el peso del video:** subir crf en el comando ffmpeg o acortar el loop (`-t`). Los mp4 viven en el repo (~8 MB entre las 2 versiones); si escalara mucho, mover a R2.

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
  /hero                 # video de fondo del hero (desktop 16:9 + mobile 9:16) + posters
  /showcase             # videos self-hosted del ServicesShowcase (mobile + VFX desktop) + posters
  logo.svg

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
- `feat(hero): add looping background video with mobile fallback`
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

- Default a **Server Component**. Marcar `'use client'` solo si hace falta state, efectos, listeners, GSAP, o control de un `<video>`/matchMedia.
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

- [ ] Estructura final de `/work/[slug]` (¿hace falta o alcanza con services?).
- [ ] Estrategia de revalidación de Sanity: webhook a Vercel vs. ISR con tag-based revalidation. *(La skill `nextjs-sanity-stack` recomienda combinar ambas.)*
- [ ] Cargar contenido en Sanity y cambiar a fetch dinámico (hoy todo está hardcoded en `lib/services.ts`).
- [ ] Imágenes hero por servicio (hoy hero del service usa el primer video del grid como fondo).
- [ ] Redes sociales: cargar los links (hoy `sameAs` del JSON-LD en `app/layout.tsx` está vacío; el estudio todavía no las trabaja).
- [ ] Si la compresión de los videos self-hosted no convence: subir originales a Cloudflare R2 (egress gratis) y apuntar los `src`.

### Decididas (ya no pendientes)

- ✅ **Form de contacto:** Resend. Dominio `bandastudio.tv` verificado, envía desde `hello@bandastudio.tv`. Anti-spam por honeypot.
- ✅ **Cubo 3D del hero:** descartado. Se removió Three.js/@react-three; el hero es video. (Recuperable del historial si se retoma en una V2.)
- ✅ **Video de la home:** self-hosted (ver §4 → Hosting de videos).

---

## 10. Estado del proyecto

**Etapa actual:** **sitio live en producción** — **https://www.bandastudio.tv** (deploy auto desde `main` en Vercel; el sin-www redirige a www). Home + About + Contact + 3 páginas de servicio, todo pre-render estático. SEO y analytics puestos. `robots.txt` permite indexación (solo bloquea `/studio`).

### Lo que está hecho

**Páginas:**
- `/` — Home real (ya no hay landing de maintenance). Ver secciones abajo.
- `/about` — `AboutHero` + `ClientsStrip` + ContactCTA.
- `/contact` — `ContactHero` con form (`ContactForm` → `POST /api/contact` vía Resend).
- `/services/3d-modeling` | `/services/2d-motion` | `/services/vfx` — pre-generadas vía `generateStaticParams`. Graphic Design y Website están declaradas en `services` pero sin página hasta que haya piezas (el `ServicesDropdown` las oculta para no dar 404).
- `/studio` — Sanity Studio embebido (cliente listo, sin contenido cargado).

**SEO / infra:**
- Metadata completa: `metadataBase`, Open Graph + Twitter cards, canonicals por página, title template `%s — Banda Studio`.
- OG images dinámicas (`app/opengraph-image.tsx` + una por servicio en `services/[slug]/opengraph-image.tsx`), `sitemap.ts`, `manifest.ts`, JSON-LD `Organization` (con `sameAs` vacío hasta cargar redes), `theme-color`.
- `SITE_URL` en `lib/services.ts` = `https://www.bandastudio.tv` (single source of truth de dominio). **Ojo:** `banda.studio` NO es este sitio (resuelve a un Squarespace ajeno) — el dominio real es `bandastudio.tv`.
- Vercel Analytics + Speed Insights en el root layout.
- `.vercelignore` excluye `.claude` + docs del deploy (no afectan build ni se sirven).

**Secciones de la home (en orden):**
1. `Header` (sticky, glass blur) con dropdown de Services + EmailLink con copy-to-clipboard.
2. `Hero` — título con chip "High-End" inline + bajada + **CTA glass** (translúcido, hover con borde accent + glow). Background: `HeroBackground` = **video de partículas en loop** self-hosted (16:9 desktop / 9:16 mobile). El contenido entra con `Reveal`. Ver §5.
3. `Marquee` — banda horizontal con 8 specialties duplicadas en loop infinito (pause on hover, `prefers-reduced-motion`). El set duplicado va con `aria-hidden` para que el lector de pantalla las lea una sola vez.
4. `ServicesShowcase` — sección scroll-pinned estilo Lusion (GSAP ScrollTrigger). Crossfade entre 3D / 2D Motion / VFX. Videos **responsive**: 16:9 desktop / 9:16 mobile. VFX + todos los mobile son self-hosted (`/public/showcase`, componente `LoopVideo` con IntersectionObserver); 3D y 2D en desktop siguen en YouTube. Se renderiza solo la versión del viewport activo.
5. `Tagline` — frase grande "Whatever you're building, we'd love to be part of it.".
6. `ContactCTA` — card con animación "wireframe drag" (cursor dibuja la caja desde una esquina) usando GSAP. Adentro: título "Have an [idea?] Let's work together!" (idea? con chip glass + rotación + italic) + descripción + "Learn more about us" pill + email.

**Secciones de páginas internas (`/services/[slug]`):**
1. `Header` (mismo).
2. `ServicePageHero` — video full-bleed (HD, loop, mute) del primer proyecto. Encima: card LiquidGlass con título + descripción + CTA. En mobile, gradient placeholder en lugar de video.
3. `ServiceProjectGrid` — grid de proyectos. Dos modos:
   - **Auto** (3D): 2 columnas asimétricas (`16fr` / `9fr`). Landscape → izquierda, portrait → derecha, squares balancean heights.
   - **Manual** (2D, VFX): `customLayout: string[][]` en `lib/services.ts` define filas explícitas. Cada fila reparte width con `flex: aspectRatio 1 0` → todos los items en una fila quedan a la misma altura sin recortes.
4. `ContactCTA` (mismo de home).

**Componentes UI (`components/ui/`):**
- `LiquidGlass` — wrapper de efecto vidrio con 2 tonos:
  - `light` (default): chips chicos (High-End, idea?). Box-shadow stack que simula curvatura de pill + SVG displacement map (`url(#liquid-glass)`).
  - `subtle`: boxes rectangulares grandes (hero card de service pages). Box-shadow simplificado (`.liquid-glass-lens-subtle`), sin displacement, tint más oscuro (rgba 0.25), saturate 115%.
- `LiquidGlassFilter` — SVG filter montado una vez en `app/layout.tsx`. Define `#liquid-glass` con `feImage` (WebP displacement map base64 en `lib/liquidGlassDisplacementMap.ts`) + `feGaussianBlur` + `feDisplacementMap`.
- `YouTubeLoopVideo` — embed de YouTube decorativo. Loop vía YouTube IFrame API (no usa `loop=1&playlist` que dispara los controles ⏮ ⏸ ⏭). Lazy mount con IntersectionObserver (rootMargin 300px) + `pauseVideo()` cuando sale del viewport para no saturar la red.

**Componentes nuevos (además de los de arriba):**
- `Reveal` (`components/ui/Reveal.tsx`) — reveal on-scroll (fade + blur + slide) vía GSAP, con modo `stagger`. Usado en Hero, Marquee, Tagline.
- `Footer` (`components/layout/Footer.tsx`) — crédito minimal ("Made by Banda Studio · año") al pie de las rutas públicas, vía `app/(site)/layout.tsx`.
- `ContactForm` (`components/forms/`) — form del `/contact` con honeypot anti-spam.
- `not-found.tsx` — 404 branded.
- `LoopVideo` (dentro de `ServicesShowcase`) — `<video>` self-hosted en loop con IntersectionObserver.

**Aspect ratios de videos (YouTube):**
- **Hardcodeados** en `serviceDetails` (`aspectRatio: "W/H"`). El scraping en runtime se abandonó (YouTube sirve HTML reducido a IPs de datacenter → salía mal). Para un video nuevo, correr `node_modules/.cache/probe-aspects.cjs` desde IP residencial y pegar el valor.

**Design system aplicado:**
- Tokens en `app/globals.css` (`@theme`): colors (`surface-primary/secondary`, `ink-primary/on-chip`, `accent`, `border-fade`, `glass-light/dark`), border-radius (`pill`, `tag`, `section`), font sizes (`hero`, `tagline`, `title`, `subtitle`, `body-lg`, `body`, `caption`), Mona Sans.
- Layout: contenedor estándar `max-w-[1440px]` + `px-6 sm:px-10 lg:px-16`. La zona de videos en las service pages usa `lg:px-40` (padding doble) para que los tiles respiren.
- Tipografía afinada en una segunda pasada (mayo 2026): nav/email/CTAs bajados de `text-body-lg` (19px) y `text-body` (18px) a `text-caption` (16px) `font-medium`. Marquee chips bajados de 25px → 19px.

**Performance / animaciones:**
- GSAP (`@gsap/react` + ScrollTrigger) — ServicesShowcase (scroll-pin), ContactCTA (wireframe-draw), `Reveal` (entrada on-scroll).
- Hero: video de fondo (ver §5). Ya **no** hay partículas Canvas2D ni blobs CSS.
- Three.js / R3F / drei: **removidos** del proyecto (junto con el cubo 3D) para aligerar el bundle. `@next/bundle-analyzer` disponible → `pnpm analyze` abre el treemap del bundle.

### Removido (recuperable del historial)

**Cubo 3D del hero (HeroForeground / GlassCube)** — Three.js + R3F + drei + `meshPhysicalMaterial` iridiscente que seguía el mouse. Nunca terminó de gustar; se removió junto con las deps de Three.js. Si se retoma en una V2: recuperar los archivos del historial (`git show <sha>:components/sections/GlassCube.tsx`, ver el comentario en `Hero.tsx` con los paths exactos) y reinstalar `three @react-three/fiber @react-three/drei @types/three`.

### Decisiones técnicas tomadas

1. **YouTube vs Vimeo**: arrancamos con YouTube (free) usando un helper que ya parsea ID y construye URLs limpias (`lib/utils/youtubeEmbed.ts`). Cuando haya presupuesto, migrar a Vimeo Pro — el schema de Sanity y los helpers ya están diseñados para soportar ambas plataformas.
2. **Aspect ratios de los videos**: **hardcodeados** en `serviceDetails` (`"W/H"`). El scraping en runtime se abandonó — YouTube sirve HTML reducido a las IPs de datacenter (Vercel) y el aspect salía mal. Ver §4 → Hosting de videos.
3. **`column: "left" | "right"`** opcional por proyecto: override manual del auto-distribute cuando un video "casi-cuadrado" (~0.8) debe ir a una columna específica.
4. **`customLayout: string[][]`** opcional por servicio: override completo del auto-distribute con filas manuales. Cada fila se renderiza como flex-row con `flex: aspectRatio 1 0` por item → heights matchean.
5. **LiquidGlass tone="subtle"** sin SVG displacement: el WebP displacement map tiene forma de pill bakeada — sobre boxes rectangulares grandes proyectaba una "lente fantasma". En `subtle` se skipea el `url()` y queda blur+saturate limpio.
6. **`rounded-[inherit]` solo en el lens, no en el outer del LiquidGlass**: si está en ambos, Tailwind genera reglas que pelean y `inherit` (que computa a 0 sin padre) puede ganar — bug visible que apareció en mayo 2026.

### Próximos pasos sugeridos

1. **Contenido en Sanity** — cargar services + projects en el Studio, cambiar `serviceDetails` hardcoded por fetch contra `serviceBySlugQuery`.
2. **Redes sociales** — cargarlas y completar el `sameAs` del JSON-LD (`app/layout.tsx`) + un bloque de links (¿en el footer?).
3. **Imágenes hero por servicio** — reemplazar el video-como-fondo del `ServicePageHero` por una pieza específica diseñada para hero.
4. **`/work/[slug]`** — evaluar si hace falta (case studies por proyecto) o alcanza con las service pages.
5. **Footer** — hoy es solo el crédito; si el Figma trae uno más completo (links, redes), ampliarlo.

*(Ya hechos: home live, `/about`, `/contact` + form Resend, SEO, analytics, footer-crédito, 404, dominio productivo `bandastudio.tv`.)*

---

*Última actualización: julio 2026.*
