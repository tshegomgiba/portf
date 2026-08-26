import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = "#7ec8e3";
const PALE = "#b8e0f0";

const WireShell = () => {
  const ref = useRef();

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.1;
    ref.current.rotation.x += delta * 0.04;
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[2.6, 1]} />
      <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.22} />
    </mesh>
  );
};

const OrbitRing = ({ radius, count, speed, tilt, size }) => {
  const ref = useRef();

  const nodes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
      }),
    [count, radius]
  );

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * speed;
  });

  return (
    <group ref={ref} rotation={[tilt, 0, tilt * 0.6]}>
      {nodes.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[size, 14, 14]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? "#ffffff" : PALE}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};

const Dust = ({ count = 140 }) => {
  const ref = useRef();

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      // Spherical sampling keeps the motes shell-like instead of boxy.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.9 + Math.random() * 1.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.05;
    ref.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.15) * 0.12;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color={PALE}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

const Rig = ({ children }) => {
  const ref = useRef();

  useFrame((state) => {
    const { x, y } = state.pointer;
    ref.current.rotation.y += (x * 0.4 - ref.current.rotation.y) * 0.04;
    ref.current.rotation.x += (-y * 0.28 - ref.current.rotation.x) * 0.04;
  });

  return <group ref={ref}>{children}</group>;
};

const HeroOrb = () => (
  <Canvas
    dpr={[1, 2]}
    camera={{ position: [0, 0, 7.5], fov: 45 }}
    gl={{ antialias: true, alpha: true }}
    style={{ background: "transparent", pointerEvents: "none" }}
  >
    <Rig>
      <WireShell />
      <OrbitRing radius={3.1} count={9} speed={0.22} tilt={0.5} size={0.075} />
      <OrbitRing radius={3.7} count={6} speed={-0.14} tilt={-0.9} size={0.055} />
      <Dust />
    </Rig>
  </Canvas>
);

export default HeroOrb;
