import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function ShieldSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#00d4ff"
          attach="material"
          distort={0.15}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.35}
          wireframe
        />
      </Sphere>
      <Sphere args={[1.8, 32, 32]}>
        <meshStandardMaterial
          color="#00ffa3"
          transparent
          opacity={0.08}
          emissive="#00d4ff"
          emissiveIntensity={0.15}
        />
      </Sphere>
    </Float>
  );
}

function GridRings() {
  const ringRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  const rings = useMemo(() => [
    { radius: 2.8, opacity: 0.15 },
    { radius: 3.2, opacity: 0.1 },
    { radius: 3.6, opacity: 0.05 },
  ], []);

  return (
    <group ref={ringRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.3]}>
          <torusGeometry args={[ring.radius, 0.01, 16, 100]} />
          <meshStandardMaterial
            color="#00d4ff"
            transparent
            opacity={ring.opacity}
            emissive="#00d4ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function DataParticles() {
  const count = 200;
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00d4ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function CyberGlobe() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00d4ff" />
        <pointLight position={[-10, -10, -5]} intensity={0.4} color="#00ffa3" />
        <ShieldSphere />
        <GridRings />
        <DataParticles />
        <Stars radius={50} depth={50} count={1000} factor={3} fade speed={1} />
      </Canvas>
    </div>
  );
}
