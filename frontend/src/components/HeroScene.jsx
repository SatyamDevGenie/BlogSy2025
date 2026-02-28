import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

function FloatingParticles() {
  const ref = useRef();
  const count = 100;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 18;
    positions[i + 1] = (Math.random() - 0.5) * 18;
    positions[i + 2] = (Math.random() - 0.5) * 8;
  }
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      ref.current.rotation.x = state.clock.elapsedTime * 0.008;
    }
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        color="#818cf8"
        opacity={0.35}
      />
    </Points>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/92 via-white/92 to-purple-50/92 dark:from-gray-900/96 dark:via-gray-900/96 dark:to-gray-900/96" />
      <div className="absolute inset-0 w-full h-full min-h-[300px] sm:min-h-[400px]">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <FloatingParticles />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
