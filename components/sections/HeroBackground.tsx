"use client";

import { useEffect, useRef } from "react";

/**
 * Background del hero — dos capas:
 *
 * 1. **Blobs estáticos** (CSS): tres elipses grandes con blur fuerte, drift
 *    suave. Establecen la "atmósfera" humo/fluido. Animados con keyframes en
 *    globals.css; respetan `prefers-reduced-motion` (regla global allá los
 *    desactiva).
 *
 * 2. **Field de partículas** (Canvas2D): ~140 puntos chicos blancos que
 *    flotan y reaccionan al cursor — al acercar el mouse se repelen como si
 *    fuera un soplido. Trails sutiles para sensación humo/fluido. Native
 *    code: ~150 líneas, sin libs, fácil de modificar. Skip en mobile y con
 *    reduced-motion.
 *
 * `aria-hidden`: todo es decoración.
 */
export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Capa 1: ambient blobs siempre presentes (CSS, cero JS). */}
      <BlobFallback />
      {/* Capa 2: campo de partículas mouse-reactivas (Canvas 2D). */}
      <ParticleField />
    </div>
  );
}

function BlobFallback() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-1/3 -left-1/3 h-[60vmax] w-[60vmax] rounded-pill bg-white/15 blur-[150px] animate-blob-1" />
      <div className="absolute top-1/4 right-0 h-[50vmax] w-[50vmax] translate-x-1/4 rounded-pill bg-white/10 blur-[120px] animate-blob-2" />
      <div className="absolute -bottom-1/4 left-1/4 h-[55vmax] w-[55vmax] rounded-pill bg-[#e8e2d5]/12 blur-[140px] animate-blob-1" />
    </div>
  );
}

/**
 * Sistema de partículas Canvas2D.
 *
 * **Parámetros principales** (ajustables al gusto):
 * - `PARTICLE_COUNT`: cantidad. Más = más denso, más CPU.
 * - `REPULSE_RADIUS`: a qué distancia del mouse las partículas empiezan a
 *   huir. Más grande = "área de influencia" más generosa.
 * - `REPULSE_FORCE`: cuánto las empuja. Más grande = se escapan más rápido.
 * - `TRAIL_ALPHA`: opacidad del clear-frame. 0 = sin trails (clear total),
 *   0.05 = trails sutiles (humo), 0.15+ = trails muy marcados.
 * - `BASE_RADIUS` / `RADIUS_VAR`: tamaño mínimo y variación del radio.
 *
 * **Implementación**:
 * - Cada frame: clear translúcido (trail) + step de física + draw.
 * - Mouse posicion relativo al canvas via getBoundingClientRect.
 * - DPR-aware: canvas escalado para HiDPI (Retina, etc) sin pixelado.
 * - RAF cancelado en cleanup; listeners removidos. Sin leaks.
 *
 * **Skip cuando**:
 * - Mobile (< 768px): sin mouse, sin sentido.
 * - `prefers-reduced-motion: reduce`.
 * - Canvas2D no soportado (muy raro hoy).
 */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip en mobile y con reduced-motion.
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Tuning.
    const PARTICLE_COUNT = 450;
    const REPULSE_RADIUS = 160;
    const REPULSE_FORCE = 0.45;
    // Range amplio de tamaños — partículas tipo "polvo" (radio efectivo
    // ~0.6 px) hasta puntos más visibles (~6 px). Eso da textura visual:
    // varias capas de profundidad en vez de un campo uniforme.
    const BASE_RADIUS = 0.3;
    const RADIUS_VAR = 2.7;
    const GRADIENT_MULT = 2;
    const FRICTION = 0.96;
    const DRIFT = 0.12;
    const MAX_SPEED = 2.5;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
    };

    const particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: BASE_RADIUS + Math.random() * RADIUS_VAR,
        a: 0.25 + Math.random() * 0.55,
      }),
    );

    // Mouse — lejos al inicio para que las partículas no exploten.
    let mx = -9999;
    let my = -9999;

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    }
    function onMouseLeave() {
      mx = -9999;
      my = -9999;
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);

    let raf = 0;
    function tick() {
      // Clear total del canvas cada frame. Antes usábamos un fillRect con
      // alpha bajo para crear trails de humo, pero después de un rato las
      // trails dejan "polvo" residual (los gradientes nunca terminan de
      // llegar a 0 alpha por la decay multiplicativa). Con clearRect el
      // fondo queda 100% limpio en cada frame.
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // Repulsión del mouse: cuanto más cerca, más fuerza.
        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;
        const rSq = REPULSE_RADIUS * REPULSE_RADIUS;
        if (distSq < rSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = ((REPULSE_RADIUS - dist) / REPULSE_RADIUS) * REPULSE_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Drift random (browniano) — da vida cuando el mouse no está.
        p.vx += (Math.random() - 0.5) * DRIFT;
        p.vy += (Math.random() - 0.5) * DRIFT;

        // Fricción — sin esto las partículas aceleran indefinidamente.
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // Cap de velocidad.
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED;
          p.vy = (p.vy / speed) * MAX_SPEED;
        }

        // Move.
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges (toroidal). Más natural que rebotar para ambient.
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Draw: radial gradient para borde suave (look humo, no "dot duro").
        const drawR = p.r * GRADIENT_MULT;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, drawR);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.a})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
