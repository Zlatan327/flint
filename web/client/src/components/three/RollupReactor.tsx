// Black Ledger style reminder: the reactor is a secondary instrument—slow, precise, low-contrast, and never a glowing centerpiece.

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function ReactorGeometry() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z -= delta * 0.08;
    group.current.rotation.x = Math.sin(performance.now() * 0.00022) * 0.08;
  });

  const spokeCount = 18;
  const spokes = Array.from({ length: spokeCount }, (_, index) => {
    const angle = (index / spokeCount) * Math.PI * 2;
    return <mesh key={`spoke-${index}`} rotation={[0, 0, angle]} position={[0, 0, -0.02]}><boxGeometry args={[2.9, 0.008, 0.008]} /><meshBasicMaterial color={index % 3 === 0 ? "#FF6B00" : "#3A3A3A"} transparent opacity={index % 3 === 0 ? 0.68 : 0.7} /></mesh>;
  });

  return (
    <group ref={group}>
      <mesh rotation={[0, 0, Math.PI / 4]}><torusGeometry args={[0.88, 0.012, 8, 4]} /><meshBasicMaterial color="#FF6B00" /></mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}><torusGeometry args={[0.61, 0.009, 8, 4]} /><meshBasicMaterial color="#565656" /></mesh>
      <mesh><sphereGeometry args={[0.07, 12, 8]} /><meshBasicMaterial color="#10B981" /></mesh>
      {spokes}
    </group>
  );
}

export default function RollupReactor() {
  return (
    <div className="reactor-canvas" aria-label="Procedural rollup reactor visualization" role="img">
      <Canvas camera={{ position: [0, 0, 3.8], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.3} />
        <ReactorGeometry />
      </Canvas>
    </div>
  );
}
