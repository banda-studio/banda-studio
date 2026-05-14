"use client";

import { Environment } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Cubo de vidrio 3D con dispersión cromática (chromatic aberration + IOR).
 * Sigue el cursor con un lerp suave y rota lento sobre su propio eje. La
 * estética es la de un prisma transparente — la luz se separa en RGB al pasar
 * por las caras, generando ese arcoiris característico.
 *
 * **Parámetros tocables** (todos están abajo, comentados):
 * - `CUBE_SIZE`: tamaño del cubo en world units.
 * - `LERP_SPEED`: qué tan rápido sigue al mouse. 0.03 = relajado, 0.12 = pega.
 * - `MOUSE_RANGE`: % del viewport que cubre el mouse-follow. 1 = todo el
 *   viewport, 0.5 = solo la mitad central (cube nunca toca los bordes).
 * - Material props (`chromaticAberration`, `ior`, `thickness`, `roughness`):
 *   tunean la "intensidad" del efecto vidrio. Más detalle abajo.
 *
 * **Por qué este approach**:
 * - `MeshTransmissionMaterial` de drei usa render-targets internos para
 *   simular refracción real. Casi mismo bundle que Spline pero TS abierto.
 * - `dpr={[1, 1.5]}` cappea HiDPI a 1.5× para que las Retinas no quemen GPU.
 * - `frameloop="always"` porque el cubo rota constantemente.
 *
 * **Skip cuando**:
 * - Mobile (decidido en `HeroBackground.tsx` → no monta este componente).
 * - prefers-reduced-motion (idem).
 */
export default function GlassCube() {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      // Normalizado a [-1, 1] sobre el viewport entero.
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{
        alpha: true,
        antialias: true,
        // Pide GPU dedicada cuando hay (laptops con doble GPU).
        powerPreference: "high-performance",
        // Si el browser dice "GPU muy débil, no te doy contexto", aceptamos
        // igual — preferimos cube feo a no cube. Sin esto, en algunas
        // máquinas no carga.
        failIfMajorPerformanceCaveat: false,
      }}
      // Defensive: en dev, React strict mode mount/unmount/mount + los
      // render-targets de MTM pueden saturar la cantidad de contextos GL
      // del browser (Chrome cap = 16). Cuando el browser mata el contexto
      // (`webglcontextlost`), tenemos que prevenir el default para que
      // intente restaurarlo automáticamente. Sin esto, una vez perdido el
      // contexto el cubo se queda en negro hasta refresh.
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
        });
      }}
      className="!absolute !inset-0 !h-full !w-full"
    >
      {/*
        Environment HDR: CRÍTICO para que el glass se vea como vidrio y no
        como cubo negro. MeshTransmissionMaterial samplea este entorno para
        las reflexiones de Fresnel — sin esto, no tiene qué reflejar y queda
        oscuro. `background={false}` = solo usa el HDR para lighting, no lo
        muestra como fondo del canvas (queremos canvas transparente).

        Preset: `studio` = ambient blanco/gris neutral, no agrega tinte de
        color. Otras opciones: `city`, `sunset`, `night`, `warehouse`, etc.
      */}
      <Environment preset="studio" background={false} />

      {/*
        Lights extra para acentuar el accent del DS y meter algo de carácter
        sobre el ambient del HDR.
      */}
      <ambientLight intensity={0.2} />
      <pointLight position={[-3, 2, 3]} intensity={1.2} color="#70BEFA" />
      <pointLight position={[3, -3, 2]} intensity={0.8} color="#ffffff" />

      <Cube mouseRef={mouseRef} />
    </Canvas>
  );
}

function Cube({
  mouseRef,
}: {
  mouseRef: React.RefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Tuning.
  const CUBE_SIZE = 1.5;
  const LERP_SPEED = 0.04;
  const MOUSE_RANGE = 0.45;
  const ROT_X_SPEED = 0.003;
  const ROT_Y_SPEED = 0.005;

  useFrame(() => {
    if (!meshRef.current) return;

    const targetX =
      ((mouseRef.current.x * viewport.width) / 2) * MOUSE_RANGE;
    const targetY =
      ((mouseRef.current.y * viewport.height) / 2) * MOUSE_RANGE;

    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      LERP_SPEED,
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      LERP_SPEED,
    );

    meshRef.current.rotation.x += ROT_X_SPEED;
    meshRef.current.rotation.y += ROT_Y_SPEED;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
      {/*
        meshPhysicalMaterial — material físico standard de Three.js, sin
        render-targets internos (vs MTM que crea 2-4 contextos GL extras y
        eventualmente revienta con strict mode en dev).

        Combinación de efectos para imitar el cubo del Spline:
        - `transmission: 1` → vidrio transparente.
        - `thickness` → grosor óptico (mas alto = más distorsión interna).
        - `ior: 1.4` → índice de refracción (vidrio = 1.5).
        - `roughness: 0.05` → casi pulido.
        - `iridescence: 1` → activa el efecto thin-film (arcoiris en
          superficies). Es como mira una pompa de jabón al sol.
        - `iridescenceIOR: 1.3` → índice de refracción de la "película" — más
          alto = colores más intensos.
        - `iridescenceThicknessRange: [100, 800]` → la "película" varía su
          grosor entre estos valores (nm), creando el gradient de colores.
        - `clearcoat / clearcoatRoughness` → capa de barniz brillante encima.
        - `attenuationColor` → tinte sutil que el "vidrio" agrega a la luz que
          lo atraviesa.
      */}
      <meshPhysicalMaterial
        transmission={1}
        thickness={1.5}
        // Roughness un toque más alto = sensación granulada (vidrio
        // micro-imperfecto) en vez de espejo perfecto.
        roughness={0.12}
        ior={1.5}
        metalness={0}
        reflectivity={0.7}
        // Iridescence con range amplio para que distintos ángulos muestren
        // distintos colores. iridescenceIOR alto = colores más saturados.
        iridescence={1}
        iridescenceIOR={2.0}
        iridescenceThicknessRange={[100, 1000]}
        // Clearcoat con roughness no nula → barniz semi-mate, refuerza
        // el efecto "granulado" del vidrio real.
        clearcoat={1}
        clearcoatRoughness={0.18}
        // Sin tinte de color — antes estaba en `#a0c0ff` con distancia 0.6
        // que tintaba el cubo entero de azul. Pure white + distancia larga
        // mantiene la transparencia neutra.
        attenuationColor="#ffffff"
        attenuationDistance={5}
        // Descomposición de la luz (RGB split en los bordes). Subido a 5
        // para que se note. Si igual se ve poco, lo subimos más; es
        // un efecto que escala bien sin costo extra.
        dispersion={5}
        transparent
      />
    </mesh>
  );
}
