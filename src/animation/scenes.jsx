import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { techStack } from "../data/stack";
import { iconTile } from "./iconTile";
import { makeScreen } from "./laptopScreen";

export const ACCENT = "#7ec8e3";
export const PALE = "#b8e0f0";
export const INK = "#16232f";
export const WARM = "#ffd479";

/**
 * Every mesh in a scene declares its resting opacity as `userData.o`, and may
 * set `userData.k` as a live multiplier while it animates. The scene then dims
 * the whole set by how present the companion is, so a set builds itself as the
 * companion arrives and dissolves as it leaves.
 */
const fade = (group, activity) => {
  group.traverse((child) => {
    if (!child.isMesh || child.userData.o === undefined) return;
    child.material.opacity = activity * child.userData.o * (child.userData.k ?? 1);
  });
};

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Left aligned rows of blocks, the shorthand for text on a small panel. */
const Bars = ({ rows = 3, width = 0.5, color = ACCENT, gap = 0.09 }) => (
  <>
    {Array.from({ length: rows }, (_, i) => {
      const w = width * (1 - i * 0.22);
      return (
        <mesh
          key={i}
          position={[-width / 2 + w / 2, ((rows - 1) * gap) / 2 - i * gap, 0.012]}
          userData={{ o: 0.6 - i * 0.12 }}
        >
          <boxGeometry args={[w, 0.022, 0.004]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      );
    })}
  </>
);

/* ------------------------------------------------------------------ *
 * Hero: a futuristic dais with gyroscope rings and drifting readouts.
 * ------------------------------------------------------------------ */

const Futurist = forwardRef((_, ref) => {
  const rings = useRef([]);
  const slabs = useRef([]);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;

    const activity = group.userData.activity ?? 0;
    group.visible = activity > 0.01;
    if (!group.visible) return;

    const t = state.clock.elapsedTime;

    if (rings.current[0]) rings.current[0].rotation.z += delta * 0.3;
    if (rings.current[1]) rings.current[1].rotation.z -= delta * 0.22;

    slabs.current.forEach((slab, i) => {
      if (!slab) return;
      slab.position.y = slab.userData.base + Math.sin(t * 0.8 + i * 1.7) * 0.11;
      slab.rotation.y = Math.sin(t * 0.4 + i) * 0.45;
    });

    fade(group, activity);
  });

  const readouts = [
    { at: [-1.35, 0.4, -0.35], rows: 3 },
    { at: [1.35, 0.62, -0.25], rows: 2 },
    { at: [-0.35, 1.05, -0.6], rows: 2 },
  ];

  return (
    <group ref={ref} visible={false}>
      {/* Dais */}
      <mesh position={[0, -1, 0]} userData={{ o: 0.42 }}>
        <cylinderGeometry args={[1.15, 1.32, 0.09, 6]} />
        <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.94, 0]} rotation={[Math.PI / 2, 0, 0]} userData={{ o: 0.9 }}>
        <torusGeometry args={[1.18, 0.014, 8, 6]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.08, 0]} rotation={[Math.PI / 2, 0, 0]} userData={{ o: 0.3 }}>
        <torusGeometry args={[1.5, 0.008, 8, 6]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Gyroscope rings */}
      <mesh ref={(el) => (rings.current[0] = el)} rotation={[0.62, 0.3, 0]} userData={{ o: 0.4 }}>
        <torusGeometry args={[1.45, 0.012, 8, 64]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={(el) => (rings.current[1] = el)} rotation={[-0.7, 0.5, 0]} userData={{ o: 0.26 }}>
        <torusGeometry args={[1.72, 0.008, 8, 64]} />
        <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Light column */}
      <mesh position={[0, -0.1, -0.15]} userData={{ o: 0.07 }}>
        <cylinderGeometry args={[0.45, 0.95, 2.4, 16, 1, true]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Drifting readouts */}
      {readouts.map((panel, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) {
              slabs.current[i] = el;
              el.userData.base = panel.at[1];
            }
          }}
          position={panel.at}
        >
          <mesh userData={{ o: 0.16 }}>
            <boxGeometry args={[0.62, 0.4, 0.018]} />
            <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          <Bars rows={panel.rows} width={0.42} gap={0.1} />
        </group>
      ))}
    </group>
  );
});

Futurist.displayName = "Futurist";

/* ------------------------------------------------------------------ *
 * About: a seat, a tablet to read and notes circling overhead.
 * ------------------------------------------------------------------ */

const Reading = forwardRef((_, ref) => {
  const notes = useRef([]);
  const motes = useRef([]);

  useFrame((state) => {
    const group = ref.current;
    if (!group) return;

    const activity = group.userData.activity ?? 0;
    group.visible = activity > 0.01;
    if (!group.visible) return;

    const t = state.clock.elapsedTime;

    notes.current.forEach((note, i) => {
      if (!note) return;
      const angle = t * 0.28 + (i * Math.PI * 2) / notes.current.length;
      note.position.set(Math.cos(angle) * 1.25, 0.62 + Math.sin(t * 0.7 + i) * 0.1, Math.sin(angle) * 0.5);
      note.rotation.y = -angle + Math.PI / 2;
    });

    // Thoughts rising off the top of its head and dissolving.
    motes.current.forEach((mote, i) => {
      if (!mote) return;
      const phase = ((t * 0.4 + i * 0.33) % 1);
      mote.position.y = 0.55 + phase * 1.1;
      mote.position.x = 0.1 + Math.sin(phase * 5 + i) * 0.12;
      mote.userData.k = Math.sin(phase * Math.PI);
      mote.scale.setScalar(0.4 + phase * 0.7);
    });

    fade(group, activity);
  });

  return (
    <group ref={ref} visible={false}>
      {/* Floating seat */}
      <mesh position={[0, -0.51, 0]} userData={{ o: 0.3 }}>
        <boxGeometry args={[1.05, 0.07, 0.85]} />
        <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.47, 0]} rotation={[Math.PI / 2, 0, 0]} userData={{ o: 0.55 }}>
        <torusGeometry args={[0.66, 0.011, 8, 32]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.62, 0]} userData={{ o: 0.14 }}>
        <cylinderGeometry args={[0.42, 0.16, 0.3, 12, 1, true]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Notes circling while it reads */}
      {[0, 1, 2].map((i) => (
        <group key={i} ref={(el) => (notes.current[i] = el)}>
          <mesh userData={{ o: 0.2 }}>
            <boxGeometry args={[0.5, 0.34, 0.016]} />
            <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          <Bars rows={3} width={0.34} gap={0.08} color={ACCENT} />
        </group>
      ))}

      {/* Thought motes */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (motes.current[i] = el)} userData={{ o: 0.5, k: 0 }} scale={0.5}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
});

Reading.displayName = "Reading";

/* ------------------------------------------------------------------ *
 * Experience: the desk. A laptop it types on, with the screen thrown up
 * as a hologram above the lid so it stays readable from the front. That
 * screen writes code, then opens the site it just built.
 * ------------------------------------------------------------------ */

const Desk = forwardRef(({ energy }, ref) => {
  const lid = useRef();
  const panel = useRef();
  const glow = useRef();
  const chips = useRef([]);
  const steam = useRef([]);

  const screen = useMemo(() => makeScreen(), []);
  useEffect(() => screen.dispose, [screen]);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;

    const activity = group.userData.activity ?? 0;
    group.visible = activity > 0.01;
    if (!group.visible) return;

    const t = state.clock.elapsedTime;
    const open = smooth(clamp01(activity * 1.15));

    // The lid follows the companion: it swings open as it settles in and folds
    // shut again as it pushes back from the desk to move on.
    if (lid.current) lid.current.rotation.x = -0.05 - open * 1.25;

    if (panel.current) {
      panel.current.scale.setScalar(0.72 + open * 0.28);
      panel.current.position.y = 0.6 + Math.sin(t * 0.9) * 0.02;
      panel.current.rotation.z = Math.sin(t * 0.5) * 0.012;
    }

    if (glow.current) glow.current.intensity = open * (1.5 + Math.sin(t * 7) * 0.12);

    // Writes while it is actually sitting there, pauses when it looks away,
    // then opens the site it just built.
    screen.advance(delta, energy?.current ?? 1);

    chips.current.forEach((chip, i) => {
      if (!chip) return;
      chip.position.y = chip.userData.base + Math.sin(t * 1.1 + i * 2) * 0.055;
      chip.rotation.y = Math.sin(t * 0.5 + i) * 0.35;
    });

    steam.current.forEach((puff, i) => {
      if (!puff) return;
      const phase = (t * 0.35 + i * 0.34) % 1;
      puff.position.y = -0.24 + phase * 0.5;
      puff.position.x = -0.72 + Math.sin(phase * 6 + i) * 0.05;
      puff.userData.k = Math.sin(phase * Math.PI) * 0.7;
      puff.scale.setScalar(0.5 + phase);
    });

    fade(group, activity);
  });

  const holo = () => (
    <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
  );

  return (
    <group ref={ref} visible={false}>
      {/* Desk. Its top sits just under the companion's hands when seated. */}
      <mesh position={[0.08, -0.46, 0.46]} userData={{ o: 0.42 }}>
        <boxGeometry args={[2.15, 0.055, 0.92]} />
        <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0.08, -0.428, 0.46]} userData={{ o: 0.5 }}>
        <boxGeometry args={[2.16, 0.006, 0.93]} />
        {holo()}
      </mesh>
      {[-0.86, 1.02].map((x) => (
        <mesh key={x} position={[x, -0.78, 0.46]} userData={{ o: 0.28 }}>
          <boxGeometry args={[0.05, 0.6, 0.05]} />
          <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}

      {/* Stool */}
      <mesh position={[0, -0.5, -0.05]} userData={{ o: 0.3 }}>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 20]} />
        <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.78, -0.05]} userData={{ o: 0.22 }}>
        <cylinderGeometry args={[0.05, 0.05, 0.52, 10]} />
        <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Laptop */}
      <mesh position={[0.12, -0.415, 0.42]} userData={{ o: 0.55 }}>
        <boxGeometry args={[0.92, 0.028, 0.6]} />
        <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0.12, -0.399, 0.44]} userData={{ o: 0.4 }}>
        <boxGeometry args={[0.78, 0.006, 0.3]} />
        {holo()}
      </mesh>
      <mesh position={[0.12, -0.399, 0.64]} userData={{ o: 0.22 }}>
        <boxGeometry args={[0.26, 0.006, 0.11]} />
        {holo()}
      </mesh>

      <group ref={lid} position={[0.12, -0.4, 0.13]}>
        <mesh position={[0, 0.26, 0]} userData={{ o: 0.5 }}>
          <boxGeometry args={[0.92, 0.54, 0.022]} />
          <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.26, 0.014]} userData={{ o: 0.3 }}>
          <boxGeometry args={[0.84, 0.47, 0.004]} />
          {holo()}
        </mesh>
      </group>

      {/* The screen, thrown up off the lid and out to the side. It has to clear
          the companion's head, which sits directly above the keyboard. */}
      <group ref={panel} position={[0.88, 0.6, 0.32]} rotation={[-0.1, -0.12, 0]}>
        <mesh userData={{ o: 1 }}>
          <planeGeometry args={[1.1, 0.69]} />
          <meshBasicMaterial
            map={screen.texture}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, -0.006]} userData={{ o: 0.5 }}>
          <planeGeometry args={[1.18, 0.77]} />
          {holo()}
        </mesh>
        <pointLight ref={glow} color={ACCENT} distance={4.5} intensity={0} />
      </group>

      {/* Projection beam, angled from the lid across to the panel */}
      <mesh position={[0.52, 0.24, 0.32]} rotation={[0, 0, -0.62]} userData={{ o: 0.06 }}>
        <cylinderGeometry args={[0.42, 0.16, 0.7, 12, 1, true]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Side readouts, kept on the far side from the editor */}
      {[
        { at: [-0.98, 0.42, 0.3], rows: 3 },
        { at: [-0.86, 0.02, 0.28], rows: 2 },
      ].map((chip, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) {
              chips.current[i] = el;
              el.userData.base = chip.at[1];
            }
          }}
          position={chip.at}
        >
          <mesh userData={{ o: 0.14 }}>
            <boxGeometry args={[0.5, 0.36, 0.014]} />
            <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          <Bars rows={chip.rows} width={0.34} gap={0.085} />
        </group>
      ))}

      {/* Mug */}
      <mesh position={[-0.72, -0.36, 0.5]} userData={{ o: 0.5 }}>
        <cylinderGeometry args={[0.085, 0.075, 0.14, 14]} />
        <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[-0.62, -0.36, 0.5]} rotation={[0, Math.PI / 2, 0]} userData={{ o: 0.4 }}>
        <torusGeometry args={[0.045, 0.011, 6, 14]} />
        <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => (steam.current[i] = el)}
          position={[-0.72, -0.24, 0.5]}
          userData={{ o: 0.32, k: 0 }}
        >
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
});

Desk.displayName = "Desk";

/* ------------------------------------------------------------------ *
 * Stack: the toolbox. Icons orbit a ring and it lifts one out at a time
 * to turn it over in its hand.
 * ------------------------------------------------------------------ */

const ORBIT_COUNT = 8;
// Where the companion's right hand ends up in the reach pose, once its turn
// toward the ring is taken into account.
const HAND = new THREE.Vector3(0.42, 0.02, 0.38);

const Orbit = forwardRef((_, ref) => {
  const cubes = useRef([]);
  const ring = useRef();

  // Each block wears the tech it stands for, so the one it lifts out of the
  // ring is a tool you can actually name.
  const picks = useMemo(
    () =>
      techStack.slice(0, ORBIT_COUNT).map(({ icon, hex }) => ({
        hex,
        map: iconTile(icon, hex, INK),
      })),
    []
  );

  // Held outside the objects: anything written into `userData` from a frame
  // loop is overwritten the next time React re-renders the set.
  const homes = useMemo(
    () => Array.from({ length: ORBIT_COUNT }, () => new THREE.Vector3()),
    []
  );

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;

    const activity = group.userData.activity ?? 0;
    group.visible = activity > 0.01;
    if (!group.visible) return;

    const t = state.clock.elapsedTime;
    if (ring.current) ring.current.rotation.z += delta * 0.12;

    // Every few seconds a different tool is taken out of the ring.
    const slot = Math.floor(t / 3.6) % ORBIT_COUNT;
    const grip = Math.sin(clamp01((t % 3.6) / 3.6) * Math.PI);

    cubes.current.forEach((cube, i) => {
      if (!cube) return;

      const angle = t * 0.25 + (i * Math.PI * 2) / ORBIT_COUNT;
      const home = homes[i];
      home.set(Math.cos(angle) * 1.3, Math.sin(angle) * 1.3 * 0.55 + 0.15, Math.sin(angle) * 0.35);

      if (i === slot) {
        cube.position.lerp(HAND, clamp01(delta * 3.4 * grip + delta * 0.6));
        cube.rotation.y += delta * 2.4;
        cube.rotation.x += delta * 0.9;
        cube.scale.setScalar(0.19 + grip * 0.08);
        cube.userData.k = 1;
      } else {
        cube.position.lerp(home, clamp01(delta * 2.6));
        cube.rotation.y += delta * 0.5;
        cube.scale.setScalar(0.15);
        cube.userData.k = 0.62;
      }
    });

    fade(group, activity);
  });

  return (
    <group ref={ref} visible={false}>
      <mesh ref={ring} rotation={[0.42, 0, 0]} userData={{ o: 0.24 }}>
        <torusGeometry args={[1.3, 0.008, 8, 72]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[0.42, 0, 0]} userData={{ o: 0.12 }}>
        <torusGeometry args={[1.56, 0.005, 8, 72]} />
        <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      {picks.map(({ map }, i) => (
        <mesh
          key={i}
          ref={(el) => (cubes.current[i] = el)}
          scale={0.15}
          userData={{ o: 0.92, k: 0.6 }}
        >
          <boxGeometry args={[1, 1, 1]} />
          {/* Back faces are culled, so the icon on the far side cannot ghost
              through the one you are looking at. */}
          <meshBasicMaterial map={map} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
});

Orbit.displayName = "Orbit";

/* ------------------------------------------------------------------ *
 * Projects: a window it turns over in both hands, with the live builds
 * hovering alongside.
 * ------------------------------------------------------------------ */

const Gallery = forwardRef((_, ref) => {
  const pane = useRef();
  const minis = useRef([]);
  const burst = useRef();

  useFrame((state) => {
    const group = ref.current;
    if (!group) return;

    const activity = group.userData.activity ?? 0;
    group.visible = activity > 0.01;
    if (!group.visible) return;

    const t = state.clock.elapsedTime;

    // Turned back and forth as though it is being inspected from every side.
    if (pane.current) {
      pane.current.rotation.y = Math.sin(t * 0.55) * 0.72;
      pane.current.rotation.x = Math.sin(t * 0.33) * 0.14;
      pane.current.position.y = -0.26 + Math.sin(t * 0.9) * 0.03;
    }

    minis.current.forEach((mini, i) => {
      if (!mini) return;
      const angle = t * 0.4 + i * 2.3;
      mini.position.set(Math.cos(angle) * 1.35, 0.5 + Math.sin(t * 0.8 + i) * 0.12, Math.sin(angle) * 0.4 - 0.2);
      mini.rotation.y = -angle;
    });

    // A build opening, once every few seconds.
    if (burst.current) {
      const phase = (t % 4.5) / 1.1;
      const alive = phase < 1;
      burst.current.visible = alive;
      if (alive) {
        burst.current.scale.setScalar(0.5 + phase * 1.5);
        burst.current.userData.k = 1 - phase;
      }
    }

    fade(group, activity);
  });

  return (
    <group ref={ref} visible={false}>
      {/* Held at chest height so it does not cover the companion's head */}
      <group ref={pane} position={[0.1, -0.26, 0.5]}>
        <mesh userData={{ o: 0.24 }}>
          <boxGeometry args={[1.35, 0.92, 0.02]} />
          <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.4, 0.014]} userData={{ o: 0.42 }}>
          <boxGeometry args={[1.35, 0.12, 0.008]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        {[-0.6, -0.52, -0.44].map((x) => (
          <mesh key={x} position={[x, 0.4, 0.022]} userData={{ o: 0.8 }}>
            <circleGeometry args={[0.022, 10]} />
            <meshBasicMaterial color={INK} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
        <group position={[0, -0.06, 0.014]}>
          <Bars rows={4} width={0.92} gap={0.13} />
        </group>
        <mesh position={[0, 0, -0.014]} userData={{ o: 0.5 }}>
          <planeGeometry args={[1.42, 0.99]} />
          <meshBasicMaterial
            color={ACCENT}
            wireframe
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {[0, 1].map((i) => (
        <group key={i} ref={(el) => (minis.current[i] = el)}>
          <mesh userData={{ o: 0.18 }}>
            <boxGeometry args={[0.46, 0.32, 0.014]} />
            <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
          <Bars rows={2} width={0.3} gap={0.08} />
        </group>
      ))}

      <mesh ref={burst} position={[0.1, -0.26, 0.5]} userData={{ o: 0.5, k: 0 }}>
        <torusGeometry args={[0.8, 0.01, 8, 48]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
});

Gallery.displayName = "Gallery";

/* ------------------------------------------------------------------ *
 * Contact: placing the call. Signal rings leave its handset and packets
 * run down the link to a beacon.
 * ------------------------------------------------------------------ */

// The handset sits in its raised right hand; the beacon is what it is dialling.
const SOURCE = new THREE.Vector3(0.26, 0.4, 0.2);
const BEACON = new THREE.Vector3(1.15, -0.5, -0.35);

const Call = forwardRef((_, ref) => {
  const rings = useRef([]);
  const packets = useRef([]);
  const tip = useRef();

  useFrame((state) => {
    const group = ref.current;
    if (!group) return;

    const activity = group.userData.activity ?? 0;
    group.visible = activity > 0.01;
    if (!group.visible) return;

    const t = state.clock.elapsedTime;

    // Rings pushing out of the handset, the signal going out.
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = ((t * 0.7 + i / rings.current.length) % 1);
      ring.scale.setScalar(0.25 + phase * 1.5);
      ring.userData.k = Math.pow(1 - phase, 1.6);
    });

    // Packets running down the link to the beacon and starting over.
    packets.current.forEach((packet, i) => {
      if (!packet) return;
      const phase = ((t * 0.55 + i / packets.current.length) % 1);
      packet.position.lerpVectors(SOURCE, BEACON, phase);
      packet.position.y += Math.sin(phase * Math.PI) * 0.28;
      packet.userData.k = Math.sin(phase * Math.PI);
    });

    if (tip.current) {
      const pulse = 0.5 + Math.abs(Math.sin(t * 2.4)) * 0.5;
      tip.current.userData.k = pulse;
      tip.current.scale.setScalar(0.8 + pulse * 0.35);
    }

    fade(group, activity);
  });

  return (
    <group ref={ref} visible={false}>
      {/* Signal rings, aimed out from the handset */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => (rings.current[i] = el)}
          position={SOURCE.toArray()}
          rotation={[0, -0.5, 0.4]}
          userData={{ o: 0.42, k: 0 }}
        >
          <torusGeometry args={[0.3, 0.008, 6, 32]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}

      {/* Packets on the link */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(el) => (packets.current[i] = el)} scale={0.05} userData={{ o: 0.9, k: 0 }}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={WARM} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}

      {/* Beacon it is dialling */}
      <mesh position={[BEACON.x, BEACON.y - 0.28, BEACON.z]} userData={{ o: 0.3 }}>
        <cylinderGeometry args={[0.03, 0.05, 0.55, 8]} />
        <meshBasicMaterial color={PALE} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={tip} position={BEACON.toArray()} scale={0.9} userData={{ o: 0.9, k: 0 }}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh
        position={[BEACON.x, BEACON.y - 0.55, BEACON.z]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ o: 0.35 }}
      >
        <torusGeometry args={[0.26, 0.008, 6, 28]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
});

Call.displayName = "Call";

export const SCENES = {
  futurist: Futurist,
  reading: Reading,
  desk: Desk,
  orbit: Orbit,
  gallery: Gallery,
  call: Call,
};
