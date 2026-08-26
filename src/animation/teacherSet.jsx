import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BIT_GLOW, BIT_TEAL } from "./BotFigure";
import { INK } from "./scenes";

const MINT = BIT_GLOW;
const TEAL = BIT_TEAL;
const CREAM = "#e8f7f3";

const fade = (group, activity) => {
  group.traverse((child) => {
    if (!child.isMesh || child.userData.o === undefined) return;
    child.material.opacity = activity * child.userData.o * (child.userData.k ?? 1);
  });
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const hump = (x, a, b) => (x < a || x > b ? 0 : Math.sin(((x - a) / (b - a)) * Math.PI));

const Lines = ({ rows = 3, width = 0.42, color = CREAM, gap = 0.07 }) => (
  <>
    {Array.from({ length: rows }, (_, i) => {
      const w = width * (1 - i * 0.18);
      return (
        <mesh
          key={i}
          position={[-width / 2 + w / 2, ((rows - 1) * gap) / 2 - i * gap, 0.01]}
          userData={{ o: 0.7 - i * 0.1 }}
        >
          <boxGeometry args={[w, 0.018, 0.004]} />
          <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      );
    })}
  </>
);

/**
 * Bit's kit. Pixel has a laptop and a toolbox; Bit has a teacher's things,
 * and a different set for every section.
 */
export const TeacherGear = ({ weights, drive }) => {
  const root = useRef();
  const book = useRef();
  const page = useRef();
  const pointer = useRef();
  const board = useRef();
  const chalk = useRef();
  const clip = useRef();
  const ticks = useRef([]);
  const papers = useRef();
  const plaque = useRef();
  const orbs = useRef([]);

  useFrame((state) => {
    const group = root.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    const w = weights;
    const travel = drive?.current?.travel ?? 0;
    const rest = 1 - travel;

    const show = (i) => clamp01((w[i] ?? 0) * rest);

    // 0 lecture: pointer sweeps as if walking a class through a point.
    if (pointer.current) {
      const a = show(0);
      pointer.current.visible = a > 0.02;
      pointer.current.rotation.z = -0.9 + Math.sin(t * 1.6) * 0.35 * a;
      pointer.current.rotation.x = Math.sin(t * 0.7) * 0.12 * a;
    }

    // 1 book: a page turns, then settles.
    if (page.current) {
      const a = show(1);
      const turn = hump((t % 5.5) / 5.5, 0.15, 0.55);
      page.current.rotation.y = -0.08 - turn * 1.15 * a;
    }
    if (book.current) {
      book.current.rotation.x = -0.55 + Math.sin(t * 0.5) * 0.04 * show(1);
    }

    // 2 grade: ticks appear one after another on the clipboard.
    ticks.current.forEach((tick, i) => {
      if (!tick) return;
      const a = show(2);
      const on = ((t * 0.55 + i * 0.33) % 3) < 1.4 ? 1 : 0.15;
      tick.userData.k = on;
    });
    if (clip.current) {
      clip.current.rotation.z = Math.sin(t * 0.8) * 0.06 * show(2);
    }

    // 3 chalk: a line is drawn across the board.
    if (chalk.current) {
      const a = show(3);
      const draw = (t * 0.35) % 1;
      chalk.current.position.x = -0.42 + draw * 0.84;
      chalk.current.position.y = 0.22 - Math.floor(t * 0.35) % 3 * 0.12;
      chalk.current.userData.k = a > 0.02 ? 1 : 0;
    }
    if (board.current) board.current.rotation.y = Math.sin(t * 0.25) * 0.04 * show(3);

    // 4 review: papers fan and restack.
    if (papers.current) {
      const a = show(4);
      papers.current.rotation.y = Math.sin(t * 0.55) * 0.5 * a;
      papers.current.rotation.x = -0.2 + Math.sin(t * 0.4) * 0.08 * a;
    }

    // 5 invite: question orbs rise like hands in a class.
    orbs.current.forEach((orb, i) => {
      if (!orb) return;
      const a = show(5);
      const phase = (t * 0.45 + i * 0.4) % 1;
      orb.position.y = 0.35 + phase * 0.55;
      orb.userData.k = Math.sin(phase * Math.PI);
    });
    if (plaque.current) {
      plaque.current.position.y = -0.42 + Math.sin(t * 1.2) * 0.03 * show(5);
    }

    if (root.current) {
      root.current.children.forEach((child, i) => {
        fade(child, show(i));
      });
    }
  });

  return (
    <group ref={root}>
      {/* 0 Lecture: a pointer and three floating note cards */}
      <group>
        <group ref={pointer} position={[0.42, 0.22, 0.28]} rotation={[0.2, 0, -0.9]}>
          <mesh position={[0, 0.28, 0]} userData={{ o: 0.85 }}>
            <cylinderGeometry args={[0.012, 0.018, 0.56, 8]} />
            <meshBasicMaterial color={TEAL} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.58, 0]} userData={{ o: 0.95 }}>
            <sphereGeometry args={[0.03, 10, 10]} />
            <meshBasicMaterial color={MINT} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
        {[-0.7, -0.48, -0.26].map((y, i) => (
          <group key={y} position={[-0.85, y + 0.55, 0.1]} rotation={[0, 0.2, -0.08 + i * 0.04]}>
            <mesh userData={{ o: 0.22 }}>
              <boxGeometry args={[0.55, 0.32, 0.012]} />
              <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
            </mesh>
            <Lines rows={3} width={0.4} />
          </group>
        ))}
      </group>

      {/* 1 Book: an open text Bit is walking the visitor through */}
      <group ref={book} position={[0.02, -0.02, 0.42]} rotation={[-0.55, 0, 0]}>
        <mesh position={[-0.22, 0, 0]} rotation={[0, 0.08, 0]} userData={{ o: 0.9 }}>
          <boxGeometry args={[0.4, 0.52, 0.018]} />
          <meshBasicMaterial color={TEAL} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={page} position={[0.22, 0, 0]} rotation={[0, -0.08, 0]}>
          <mesh userData={{ o: 0.92 }}>
            <boxGeometry args={[0.4, 0.52, 0.012]} />
            <meshBasicMaterial color={CREAM} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          <group position={[0, 0.02, 0.01]}>
            <Lines rows={5} width={0.3} color={TEAL} gap={0.065} />
          </group>
        </group>
        <mesh position={[0, 0, -0.02]} userData={{ o: 0.35 }}>
          <boxGeometry args={[0.06, 0.54, 0.04]} />
          <meshBasicMaterial color={MINT} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* 2 Grade: clipboard and ticks, like marking internships */}
      <group ref={clip} position={[-0.32, 0.08, 0.38]} rotation={[-0.4, 0.3, -0.15]}>
        <mesh userData={{ o: 0.55 }}>
          <boxGeometry args={[0.38, 0.5, 0.02]} />
          <meshBasicMaterial color={TEAL} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.014]} userData={{ o: 0.8 }}>
          <boxGeometry args={[0.32, 0.42, 0.006]} />
          <meshBasicMaterial color={CREAM} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        {[0.1, 0, -0.1].map((y, i) => (
          <mesh
            key={y}
            ref={(el) => {
              ticks.current[i] = el;
            }}
            position={[-0.08, y, 0.022]}
            rotation={[0, 0, 0.5]}
            userData={{ o: 0.95, k: 0 }}
          >
            <boxGeometry args={[0.08, 0.018, 0.006]} />
            <meshBasicMaterial color={MINT} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* 3 Chalk: a small board Bit writes on while explaining the stack */}
      <group ref={board} position={[-0.95, 0.35, -0.05]} rotation={[0, 0.35, 0]}>
        <mesh userData={{ o: 0.5 }}>
          <boxGeometry args={[1.15, 0.72, 0.03]} />
          <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.018]} userData={{ o: 0.28 }}>
          <planeGeometry args={[1.05, 0.62]} />
          <meshBasicMaterial color={TEAL} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh
          ref={chalk}
          position={[-0.42, 0.22, 0.03]}
          userData={{ o: 0.95, k: 0 }}
        >
          <boxGeometry args={[0.08, 0.018, 0.018]} />
          <meshBasicMaterial color={CREAM} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* 4 Review: a fan of papers, work being marked */}
      <group ref={papers} position={[0.08, 0.02, 0.4]}>
        {[-0.12, 0, 0.12].map((x, i) => (
          <mesh
            key={x}
            position={[x, i * 0.012, 0]}
            rotation={[-0.35, x * 0.8, x * 0.15]}
            userData={{ o: 0.7 - i * 0.1 }}
          >
            <boxGeometry args={[0.46, 0.58, 0.01]} />
            <meshBasicMaterial
              color={i === 1 ? CREAM : MINT}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* 5 Invite: office hours plaque and rising questions */}
      <group>
        <group ref={plaque} position={[0.7, -0.42, 0.15]}>
          <mesh userData={{ o: 0.55 }}>
            <boxGeometry args={[0.7, 0.28, 0.02]} />
            <meshBasicMaterial color={TEAL} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          <group position={[0, 0, 0.014]}>
            <Lines rows={2} width={0.48} color={CREAM} gap={0.08} />
          </group>
        </group>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            ref={(el) => {
              orbs.current[i] = el;
            }}
            position={[-0.35 + i * 0.28, 0.35, 0.2]}
            userData={{ o: 0.85, k: 0 }}
          >
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color={MINT} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
