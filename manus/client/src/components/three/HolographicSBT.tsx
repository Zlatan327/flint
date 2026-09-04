// Black Ledger style reminder: the SBT preview is a provenance object—faceted, restrained, and framed by metadata rather than effects.

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function TokenMesh() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.x = Math.sin(performance.now() * 0.00028) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <icosahedronGeometry args={[0.78, 1]} />
        <meshStandardMaterial color="#222222" roughness={0.42} metalness={0.72} flatShading />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]} scale={1.012}>
        <icosahedronGeometry args={[0.78, 1]} />
        <meshBasicMaterial color="#FF6B00" wireframe transparent opacity={0.44} />
      </mesh>
      <mesh position={[0, 0, 0.73]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.23, 0.05]} />
        <meshBasicMaterial color="#FF6B00" />
      </mesh>
    </group>
  );
}

export default function HolographicSBT() {
  return (
    <div className="sbt-canvas" aria-label="Procedural soulbound token visualization" role="img">
      <Canvas camera={{ position: [0, 0, 3.3], fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 3, 4]} intensity={2.5} color="#FFFFFF" />
        <pointLight position={[-2, -1, 2]} intensity={1.2} color="#FF6B00" />
        <TokenMesh />
      </Canvas>
    </div>
  );
}
