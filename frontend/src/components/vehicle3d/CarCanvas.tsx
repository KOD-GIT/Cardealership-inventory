/**
 * The Three.js part of the 3D vehicle card. Loaded lazily (React.lazy) the first time a card is
 * engaged, so three.js (~600 KB) is not part of the initial bundle.
 *
 * Two poses, animated with frame-rate independent damping:
 *  PARKED   - car in profile at the right edge, only its nose inside the frame
 *  SHOWCASE - car slides to the centre and turns to a front three-quarter view
 * While engaged: drag (OrbitControls) or the rotate buttons (`yaw`) turn the car.
 */
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { type ElementRef, type ReactNode, Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BODY, CAR_LENGTH, WHEEL_RADIUS, WHEEL_U, WINDOWS } from "./carProfile";

const PARKED = { x: 3.5, rotY: -Math.PI / 2 }; // faces left, body beyond the right edge
const SHOWCASE = { x: 0, rotY: -Math.PI / 6 };
const LOOK_AT: [number, number, number] = [0, 0.7, 0];
const WIDTH = 1.7;

export interface CarCanvasProps {
  engaged: boolean;
  reducedMotion: boolean;
  /** Extra yaw in radians from the rotate buttons. */
  yaw: number;
  modelUrl?: string;
  color?: string;
  /** Yaw (radians) to fix models whose front is not +Z, e.g. Math.PI or Math.PI / 2. */
  frontFixRad?: number;
  onReady?: () => void;
}

const centred = (pts: ReadonlyArray<readonly [number, number]>) => pts.map(([u, v]) => [u - CAR_LENGTH / 2, v] as const);

function extrudeProfile(pts: ReadonlyArray<readonly [number, number]>, depth: number, bevel: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  centred(pts).forEach(([u, v], i) => (i ? shape.lineTo(u, v) : shape.moveTo(u, v)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.rotateY(-Math.PI / 2); // profile x -> world z (front = +Z), extrusion -> world x (width)
  return geometry;
}

/** Procedural stand-in (same profile as the parked SVG) used until real .glb files are added. */
function ProfileCar({ color = "#0E6B66" }: { color?: string }) {
  const body = useMemo(() => extrudeProfile(BODY, WIDTH, 0.08), []);
  const glass = useMemo(() => extrudeProfile(WINDOWS, WIDTH + 0.22, 0), []);
  return (
    <group>
      <mesh geometry={body}><meshStandardMaterial color={color} metalness={0.1} roughness={0.5} /></mesh>
      <mesh geometry={glass}><meshStandardMaterial color="#2B3B46" metalness={0.2} roughness={0.25} /></mesh>
      {WHEEL_U.flatMap((u) =>
        [-1, 1].map((side) => (
          <mesh key={`${u}${side}`} position={[side * 0.82, WHEEL_RADIUS, u - CAR_LENGTH / 2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.3, 28]} />
            <meshStandardMaterial color="#12161C" roughness={0.8} />
          </mesh>
        )),
      )}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.72, CAR_LENGTH / 2 + 0.08]}>
          <boxGeometry args={[0.42, 0.12, 0.05]} />
          <meshStandardMaterial color="#FFF3C4" emissive="#FFF3C4" emissiveIntensity={1.1} />
        </mesh>
      ))}
    </group>
  );
}

/** Loads a .glb, centres it, sits the wheels on y = 0 and scales it to the standard car length. */
function GltfCar({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { object, scale, offset } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return {
      object: clone,
      scale: CAR_LENGTH / Math.max(size.x, size.z),
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
    };
  }, [scene]);
  return <group scale={scale}><primitive object={object} position={offset} /></group>;
}

function Stage({ engaged, reducedMotion, yaw, children }: { engaged: boolean; reducedMotion: boolean; yaw: number; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_state, delta) => {
    const g = group.current;
    if (!g) return;
    const targetX = engaged ? SHOWCASE.x : PARKED.x;
    const targetRot = engaged ? SHOWCASE.rotY + yaw : PARKED.rotY;
    const speed = reducedMotion ? 60 : 3.5; // very high = effectively jumps (reduced motion)
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, speed, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRot, speed, delta);
  });
  return <group ref={group} position={[PARKED.x, 0, 0]} rotation={[0, PARKED.rotY, 0]}>{children}</group>;
}

export default function CarCanvas({ engaged, reducedMotion, yaw, modelUrl, color, frontFixRad = 0, onReady }: CarCanvasProps) {
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  useEffect(() => { if (!engaged) controls.current?.reset(); }, [engaged]); // slide out along the same path

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 1.4, 6.5], fov: 35 }} onCreated={() => onReady?.()}>
      {/* Plain lights: <Environment> presets download HDR files from a CDN at runtime. */}
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} />
      <directionalLight position={[-5, 3, -4]} intensity={1} />
      <Stage engaged={engaged} reducedMotion={reducedMotion} yaw={yaw}>
        <group rotation={[0, frontFixRad, 0]}>
          <Suspense fallback={null}>{modelUrl ? <GltfCar url={modelUrl} /> : <ProfileCar color={color} />}</Suspense>
        </group>
      </Stage>
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={14} blur={2.5} far={2} />
      <OrbitControls
        ref={controls} enabled={engaged} target={LOOK_AT} enableZoom={false} enablePan={false} enableDamping
        rotateSpeed={0.8} minPolarAngle={Math.PI / 3.2} maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
