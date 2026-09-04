// Black Ledger style reminder: this reactor is a single protocol glyph—one rotating prediction frame, one FLINT hub, and only the essential straight paths.

import { Html, Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const amber = "#FF6B00";
const emerald = "#10B981";
const steel = "#555555";
type Point = [number, number, number];

function ArrowMarker({ from, to, color, t = 0.58 }: { from: Point; to: Point; color: string; t?: number }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const angle = Math.atan2(dy, dx);
  const position: Point = [from[0] + dx * t, from[1] + dy * t, 0.16];

  return (
    <mesh position={position} rotation={[0, 0, angle - Math.PI / 2]}>
      <coneGeometry args={[0.045, 0.13, 3]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function PredictionLayer() {
  const layer = useRef<THREE.Group>(null);
  const frame: Point[] = [
    [-0.8, -0.8, -0.12],
    [0.8, -0.8, -0.12],
    [0.8, 0.8, -0.12],
    [-0.8, 0.8, -0.12],
    [-0.8, -0.8, -0.12],
  ];

  useFrame((_, delta) => {
    if (layer.current) layer.current.rotation.z -= delta * 0.105;
  });

  return (
    <group ref={layer}>
      <Line points={frame} color={amber} lineWidth={1.8} transparent opacity={0.84} />
      <Line points={frame.map(([x, y, z]) => [x * 0.68, y * 0.68, z] as Point)} color="#555555" lineWidth={0.75} transparent opacity={0.62} />
    </group>
  );
}

function GraphGeometry() {
  const human: Point = [-1.22, 0.45, 0.04];
  const agentA: Point = [1.24, 0.45, 0.04];
  const agentB: Point = [1.24, -0.48, 0.04];
  const center: Point = [0, 0, 0.05];

  return (
    <group>
      <PredictionLayer />

      <Line points={[human, center]} color={steel} lineWidth={1.0} transparent opacity={0.7} />
      <Line points={[center, agentA]} color={amber} lineWidth={1.4} transparent opacity={0.88} />
      <Line points={[agentA, agentB]} color={emerald} lineWidth={1.35} transparent opacity={0.88} />
      <ArrowMarker from={human} to={center} color={steel} />
      <ArrowMarker from={center} to={agentA} color={amber} />
      <ArrowMarker from={agentA} to={agentB} color={emerald} t={0.6} />

      <mesh position={human}><boxGeometry args={[0.13, 0.13, 0.13]} /><meshBasicMaterial color="#9C9C9C" /></mesh>
      <mesh position={agentA}><boxGeometry args={[0.13, 0.13, 0.13]} /><meshBasicMaterial color={amber} /></mesh>
      <mesh position={agentB}><boxGeometry args={[0.13, 0.13, 0.13]} /><meshBasicMaterial color={emerald} /></mesh>

      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color={amber} wireframe transparent opacity={0.95} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.065, 12, 8]} />
        <meshBasicMaterial color={emerald} />
      </mesh>
      <Html position={[0, 0.27, 0.12]} center distanceFactor={5}>
        <span className="reactor-label reactor-label-center">FLINT</span>
      </Html>
    </group>
  );
}

export default function RollupReactor() {
  return (
    <div className="reactor-canvas" aria-label="Minimal FLINT graph with rotating prediction layer and direct settlement paths" role="img">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.3} />
        <GraphGeometry />
      </Canvas>
    </div>
  );
}
