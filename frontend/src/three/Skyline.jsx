import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointer, prefersReducedMotion, scrollState } from "../scroll.js";
import { isNum } from "../utils.js";

const MAX_HEIGHT = 3.4;
const SPACING = 1.25;

// Square-root scale: one extreme value (e.g. very high inflation) does not flatten every other bar.
function barHeight(value, maxAbs) {
  if (!isNum(value) || maxAbs === 0) return 0;
  return Math.sign(value) * Math.sqrt(Math.abs(value) / maxAbs) * MAX_HEIGHT;
}

function Bar({ x, z, row, metric, maxAbs, onHover }) {
  const mesh = useRef();
  const material = useRef();
  const value = row[metric];
  const target = isNum(value) ? barHeight(value, maxAbs) : 0;
  const missing = !isNum(value);
  const current = useRef(0);

  const color = useMemo(() => {
    if (missing) return new THREE.Color("#3a4a63");
    return new THREE.Color(value < 0 ? "#ff8a5c" : "#35c5c0");
  }, [missing, value]);

  useFrame(() => {
    current.current += (target - current.current) * (prefersReducedMotion ? 1 : 0.08);
    const h = Math.max(0.04, Math.abs(current.current));
    const sign = current.current < 0 ? -1 : 1;
    mesh.current.scale.y = h;
    mesh.current.position.y = (sign * h) / 2;
    material.current.color.lerp(color, 0.15);
    material.current.emissive.lerp(color, 0.15);
  });

  return (
    <mesh
      ref={mesh}
      position={[x, 0, z]}
      onPointerOver={(event) => { event.stopPropagation(); onHover(row); }}
      onPointerOut={() => onHover(null)}
    >
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial ref={material} color="#35c5c0" emissive="#35c5c0" emissiveIntensity={0.35} roughness={0.35} metalness={0.2} />
    </mesh>
  );
}

function World({ rows, metric, onHover }) {
  const group = useRef();
  const columns = Math.ceil(Math.sqrt(rows.length || 1));

  const maxAbs = useMemo(() => {
    const values = rows.map((r) => r[metric]).filter(isNum).map(Math.abs);
    return values.length ? Math.max(...values) : 0;
  }, [rows, metric]);

  useFrame((state) => {
    const t = prefersReducedMotion ? 0 : state.clock.elapsedTime;
    // spins slowly, and also turns as you scroll the page
    group.current.rotation.y = 0.6 + t * 0.12 + scrollState.y * 0.0025 + pointer.x * 0.35;
    state.camera.position.y = 6.5 + pointer.y * 0.8;
    state.camera.lookAt(0, 0.6, 0);
  });

  return (
    <group ref={group}>
      <gridHelper args={[16, 16, "#1f7a80", "#12303d"]} position={[0, -0.01, 0]} />
      {rows.map((row, index) => {
        const col = index % columns;
        const rowIndex = Math.floor(index / columns);
        const x = (col - (columns - 1) / 2) * SPACING;
        const z = (rowIndex - (Math.ceil(rows.length / columns) - 1) / 2) * SPACING;
        return <Bar key={row.country_code} x={x} z={z} row={row} metric={metric} maxAbs={maxAbs} onHover={onHover} />;
      })}
    </group>
  );
}

export default function Skyline({ rows, metric, onHover }) {
  return (
    <Canvas camera={{ position: [0, 6.5, 10.5], fov: 45 }} dpr={[1, 1.75]} gl={{ alpha: true }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 6]} intensity={1.2} />
      <pointLight position={[-6, 4, -4]} intensity={30} color="#e3b45c" />
      <World rows={rows} metric={metric} onHover={onHover} />
    </Canvas>
  );
}
