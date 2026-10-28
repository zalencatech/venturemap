import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointer, prefersReducedMotion, scrollState } from "../scroll.js";

const TEAL = "#35c5c0";
const GOLD = "#e3b45c";
const DEPTH = 70;   // how far the camera travels while you scroll from top to bottom

// Small seeded random generator: the scene looks the same on every visit.
function makeRandom(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Thousands of tiny points spread along the flight path.
function Stars({ count }) {
  const positions = useMemo(() => {
    const random = makeRandom(7);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      array[i * 3] = (random() - 0.5) * 46;
      array[i * 3 + 1] = (random() - 0.5) * 30;
      array[i * 3 + 2] = 12 - random() * (DEPTH + 25);
    }
    return array;
  }, [count]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#9fd8e8" transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// The "world" at the start: a wireframe globe, a dotted shell and an orbit ring.
function Globe() {
  const group = useRef();
  const ring = useRef();
  const dots = useMemo(() => {
    const random = makeRandom(21);
    const array = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const v = new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize().multiplyScalar(2.15);
      array.set([v.x, v.y, v.z], i * 3);
    }
    return array;
  }, []);

  useFrame((state) => {
    const t = prefersReducedMotion ? 0 : state.clock.elapsedTime;
    group.current.rotation.y = t * 0.15 + scrollState.progress * 9;
    group.current.rotation.x = 0.35 + scrollState.progress * 2;
    ring.current.rotation.z = t * 0.25;
  });

  return (
    <group ref={group} position={[3.4, 0.2, 0]}>
      <mesh>
        <icosahedronGeometry args={[2, 3]} />
        <meshBasicMaterial color={TEAL} wireframe transparent opacity={0.28} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.9, 32, 32]} />
        <meshBasicMaterial color="#071a30" transparent opacity={0.85} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dots, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={GOLD} sizeAttenuation transparent opacity={0.95} depthWrite={false} />
      </points>
      <mesh ref={ring} rotation={[1.2, 0.3, 0]}>
        <torusGeometry args={[3, 0.012, 8, 120]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
    </group>
  );
}

// Glowing rings you fly through while scrolling.
function Rings() {
  const refs = useRef([]);
  const items = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    z: -10 - i * 7.5,
    x: Math.sin(i * 1.7) * 1.8,
    y: Math.cos(i * 1.3) * 1.2,
    color: i % 2 ? GOLD : TEAL,
  })), []);

  useFrame((state) => {
    const t = prefersReducedMotion ? 0 : state.clock.elapsedTime;
    refs.current.forEach((mesh, i) => {
      if (mesh) mesh.rotation.z = t * (0.2 + i * 0.03) * (i % 2 ? -1 : 1);
    });
  });

  return items.map((item, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[item.x, item.y, item.z]}>
      <torusGeometry args={[4.2, 0.02, 8, 100]} />
      <meshBasicMaterial color={item.color} transparent opacity={0.55} />
    </mesh>
  ));
}

// Floating wireframe shapes (cubes, octahedrons, rings) that drift past the camera.
function Floaters({ count }) {
  const refs = useRef([]);
  const items = useMemo(() => {
    const random = makeRandom(99);
    return Array.from({ length: count }, (_, i) => {
      const side = random() > 0.5 ? 1 : -1;
      return {
        position: [side * (2.2 + random() * 7), (random() - 0.5) * 9, -random() * DEPTH],
        scale: 0.35 + random() * 0.9,
        speed: 0.2 + random() * 0.5,
        kind: i % 3,
        color: i % 4 === 0 ? GOLD : TEAL,
      };
    });
  }, [count]);

  useFrame((state) => {
    const t = prefersReducedMotion ? 0 : state.clock.elapsedTime;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.x = t * items[i].speed;
      mesh.rotation.y = t * items[i].speed * 0.7 + scrollState.progress * 6;
    });
  });

  return items.map((item, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)} position={item.position} scale={item.scale}>
      {item.kind === 0 && <boxGeometry args={[1, 1, 1]} />}
      {item.kind === 1 && <octahedronGeometry args={[0.8]} />}
      {item.kind === 2 && <torusKnotGeometry args={[0.5, 0.12, 64, 8]} />}
      <meshBasicMaterial color={item.color} wireframe transparent opacity={0.45} />
    </mesh>
  ));
}

// Moves the camera forward as you scroll, with smoothing and a little mouse parallax.
function CameraRig() {
  const smooth = useRef(0);
  useFrame((state) => {
    const target = prefersReducedMotion ? 0 : scrollState.progress;
    smooth.current += (target - smooth.current) * 0.06;
    const p = smooth.current;
    const camera = state.camera;
    camera.position.x = pointer.x * 0.7 + Math.sin(p * 7) * 1.4;
    camera.position.y = pointer.y * 0.5 + Math.cos(p * 5) * 0.8;
    camera.position.z = 9 - p * DEPTH;
    camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, camera.position.z - 10);
  });
  return null;
}

export default function BackgroundScene() {
  const small = typeof window !== "undefined" && window.innerWidth < 720;
  return (
    <div className="bg-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 55, near: 0.1, far: 120 }}
        dpr={[1, small ? 1.25 : 1.75]}
        gl={{ antialias: !small, alpha: true, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={["#050d1a", 12, 55]} />
        <CameraRig />
        <Stars count={small ? 700 : 1600} />
        <Globe />
        <Rings />
        <Floaters count={small ? 18 : 36} />
      </Canvas>
    </div>
  );
}
