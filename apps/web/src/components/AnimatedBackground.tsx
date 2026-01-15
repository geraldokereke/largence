"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random";

function AnimatedPoints() {
  const ref = useRef<any>(null);
  const sphere = useMemo(() => {
    const positions = new Float32Array(8000 * 3);
    random.inSphere(positions, { radius: 1.8 });
    return positions;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 12;
      ref.current.rotation.y -= delta / 18;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#14b8a6"
          size={0.004}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={1}
        />
      </Points>
    </group>
  );
}

function FallbackBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
  );
}

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Suspense fallback={<FallbackBackground />}>
        <Canvas 
          camera={{ position: [0, 0, 1], fov: 75 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          <AnimatedPoints />
        </Canvas>
      </Suspense>
    </div>
  );
}
