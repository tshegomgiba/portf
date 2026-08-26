import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { Journey, SECTIONS, clamp } from "./journey";
import { POSES, easePose, makePose, mixPose } from "./poses";
import { ACCENT, INK, PALE, SCENES } from "./scenes";

const SHELL_LIGHT = "#dbeef7";
const CROSS = "#ff8a6a";

const INK_COLOR = new THREE.Color(INK);
const LIGHT_COLOR = new THREE.Color(SHELL_LIGHT);
const ACCENT_COLOR = new THREE.Color(ACCENT);
const CROSS_COLOR = new THREE.Color(CROSS);

const scratch = new THREE.Vector3();

// What it has to say about being poked, in order. Keep prodding it and it works
// its way down the list.
const GRUMPS = [
  "Hey! That is not very nice.",
  "Again? I am trying to work here.",
  "Right, that is the last one you get.",
  "Fine. Poke away. I will remember this.",
];

// How long a jab keeps it in a mood, and how long a second jab still counts as
// the same round of teasing.
const SULK = 3.2;
const TEASE = 5000;

// How far the companion turns to face the set it is working in.
const YAW = {
  futurist: 0,
  reading: -0.12,
  desk: 0.16,
  orbit: 0.4,
  gallery: 0,
  call: -0.22,
};

// Length of the breadcrumb routes left behind by the companion and the cursor.
const ROUTE_POINTS = 72;
const ROUTE_STEP = 0.07 * 0.07;
const CURSOR_POINTS = 44;
const CURSOR_STEP = 0.05 * 0.05;

/** A one shot hump between `a` and `b`, for gestures that happen now and then. */
const hump = (x, a, b) => (x < a || x > b ? 0 : Math.sin(((x - a) / (b - a)) * Math.PI));

/** Polyline buffer whose vertices each carry their own alpha. */
const createRoute = (count, color) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 4);
  const rgb = new THREE.Color(color);

  for (let i = 0; i < count; i += 1) {
    colors[i * 4] = rgb.r;
    colors[i * 4 + 1] = rgb.g;
    colors[i * 4 + 2] = rgb.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 4));
  return geometry;
};

const seedRoute = (geometry, count, point) => {
  const path = geometry.attributes.position.array;

  for (let i = 0; i < count; i += 1) {
    path[i * 3] = point.x;
    path[i * 3 + 1] = point.y;
    path[i * 3 + 2] = point.z;
  }
};

/** Drop a breadcrumb once enough ground is covered, then fade the tail out. */
const traceRoute = (geometry, count, point, step, strength, falloff) => {
  const path = geometry.attributes.position.array;
  const shade = geometry.attributes.color.array;

  const gapX = path[3] - point.x;
  const gapY = path[4] - point.y;
  const gapZ = path[5] - point.z;

  if (gapX * gapX + gapY * gapY + gapZ * gapZ > step) {
    path.copyWithin(3, 0, (count - 1) * 3);
  }

  path[0] = point.x;
  path[1] = point.y;
  path[2] = point.z;

  for (let i = 0; i < count; i += 1) {
    shade[i * 4 + 3] =
      strength * Math.pow(1 - i / (count - 1), falloff) * 0.85;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
};

// Seconds spent waving goodbye before it takes the reader back to the top.
const WAVE_TIME = 2.4;

const PUFFS = [
  "-top-3 left-7 h-7 w-7",
  "-top-5 left-1/2 -translate-x-1/2 h-11 w-11",
  "-top-3 right-7 h-7 w-7",
  "-left-3.5 top-1/2 -translate-y-1/2 h-9 w-9",
  "-right-3.5 top-1/2 -translate-y-1/2 h-9 w-9",
  "-bottom-2.5 left-9 h-6 w-6",
  "-bottom-2.5 right-9 h-6 w-6",
];

/** Comic style thought cloud: one white silhouette built from stacked puffs. */
const CloudBubble = React.forwardRef(({ section, line, typing, farewell, grump }, ref) => (
  <div
    ref={ref}
    className="relative select-none pointer-events-none"
    style={{ opacity: 0 }}
  >
    <div style={{ filter: "drop-shadow(0 12px 20px rgba(22,35,47,0.35))" }}>
      {PUFFS.map((puff) => (
        <span key={puff} className={`absolute rounded-full bg-white ${puff}`} />
      ))}

      <div className="relative w-[16rem] rounded-[1.75rem] bg-white px-6 py-3 text-center">
        <p
          className={`font-display text-[9px] font-bold uppercase tracking-[0.22em] ${
            grump ? "text-[#e8613a]" : "text-[#2f7ea8]"
          }`}
        >
          {grump ? "Ouch" : farewell ? "Goodbye" : `${section.note} / ${section.label}`}
        </p>

        <div className="mt-1.5 flex min-h-[2.1rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {grump ? (
              <motion.p
                key={grump}
                className="text-[12.5px] font-semibold leading-snug text-[#16232f]"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1, x: [0, -5, 5, -3, 3, 0] }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.42, ease: "easeOut" }}
              >
                {grump}
              </motion.p>
            ) : farewell ? (
              <motion.p
                key="farewell"
                className="text-[12.5px] font-medium leading-snug text-[#16232f]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                That is the whole tour. Taking you back up.
              </motion.p>
            ) : typing ? (
              <motion.span
                key="typing"
                className="flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-[#7ec8e3]"
                    animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                    transition={{
                      duration: 0.9,
                      delay: dot * 0.15,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.span>
            ) : (
              <motion.p
                key={line}
                className="text-[12.5px] font-medium leading-snug text-[#16232f]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {section.lines[line]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Trail of shrinking puffs pointing back down at the companion. */}
      <span className="absolute left-1/2 -bottom-4 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white" />
      <span className="absolute left-1/2 -bottom-8 h-2 w-2 -translate-x-1/2 rounded-full bg-white" />
    </div>
  </div>
));

CloudBubble.displayName = "CloudBubble";

const Scene = ({ journey, reduced }) => {
  const { viewport } = useThree();

  const rig = useRef();
  const tag = useRef();
  const bubble = useRef();
  const bob = useRef();
  const chassis = useRef();
  const head = useRef();
  const visor = useRef();
  const halo = useRef();
  const shell = useRef();
  const antenna = useRef();
  const lamp = useRef();
  const shadow = useRef();

  const armL = useRef();
  const armR = useRef();
  const foreL = useRef();
  const foreR = useRef();
  const legL = useRef();
  const legR = useRef();
  const shinL = useRef();
  const shinR = useRef();

  const tablet = useRef();
  const handset = useRef();

  const place = useRef(new THREE.Vector3());
  const speed = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const settled = useRef(false);

  // One material for the shell so the whole body takes the section's tone at
  // once, and one for the accents that stay put.
  const skin = useMemo(
    () => new THREE.MeshStandardMaterial({ color: INK, roughness: 0.38, metalness: 0.35 }),
    []
  );
  const trim = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.4, metalness: 0.3 }),
    []
  );

  useEffect(
    () => () => {
      skin.dispose();
      trim.dispose();
    },
    [skin, trim]
  );

  const pose = useMemo(() => makePose(), []);
  const goal = useMemo(() => makePose(), []);
  const mixed = useMemo(() => makePose(), []);
  const weights = useMemo(() => new Float32Array(SECTIONS.length), []);
  const sceneRefs = useMemo(() => SECTIONS.map(() => createRef()), []);
  const typingEnergy = useRef(1);
  const perk = useRef(0);
  const lookX = useRef(0);
  const lookY = useRef(0);

  const [spoken, setSpoken] = useState(0);
  const [line, setLine] = useState(0);
  const [typing, setTyping] = useState(true);
  const [farewell, setFarewell] = useState(false);
  const [grump, setGrump] = useState(null);
  const spokenRef = useRef(0);

  // Where it currently sits on screen, in pixels, so a click can be tested
  // against it without the canvas having to accept pointer events.
  const spot = useRef({ x: 0, y: 0, r: 0 });
  const cross = useRef(0); // how put out it is, 1 down to 0
  const whirl = useRef(0); // the spin it is still working through
  const jolt = useRef(0); // the squash from the jab itself
  const lastPoke = useRef(0);
  const nagged = useRef(-1);
  const calm = useRef();

  const loiter = useRef(0);
  const waveStart = useRef(0);
  const waving = useRef(false);
  const waveLevel = useRef(0);
  const lastTouch = useRef(0);

  // Any sign of life on the page counts as the reader still being busy.
  useEffect(() => {
    const bump = () => {
      lastTouch.current = performance.now();
    };

    const signals = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "wheel",
      "keydown",
      "touchstart",
      "touchmove",
      "click",
      "focusin",
    ];

    signals.forEach((signal) =>
      window.addEventListener(signal, bump, { passive: true })
    );

    return () =>
      signals.forEach((signal) => window.removeEventListener(signal, bump));
  }, []);

  // Work through each section's lines so it reads as a running conversation.
  useEffect(() => {
    const { lines } = SECTIONS[spoken];
    let settle;
    let index = 0;

    const say = (next) => {
      clearTimeout(settle);
      setTyping(true);
      setLine(next);
      settle = setTimeout(() => setTyping(false), 650);
    };

    say(0);

    const loop =
      lines.length > 1
        ? setInterval(() => {
            index = (index + 1) % lines.length;
            say(index);
          }, 5400)
        : null;

    return () => {
      clearTimeout(settle);
      if (loop) clearInterval(loop);
    };
  }, [spoken]);

  const routeReady = useRef(false);
  const routeAlpha = useRef(0);
  const route = useMemo(() => createRoute(ROUTE_POINTS, ACCENT), []);

  const cursorRoute = useMemo(() => createRoute(CURSOR_POINTS, PALE), []);
  const cursorReady = useRef(false);
  const cursorAlpha = useRef(0);
  const cursorAt = useRef(new THREE.Vector3());
  const cursorWas = useRef(new THREE.Vector3());
  const pointer = useRef({ x: 0, y: 0, seen: false });

  useEffect(() => {
    // The overlay ignores pointer events, so track the cursor on the window.
    const follow = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointer.current.seen = true;
    };

    window.addEventListener("pointermove", follow, { passive: true });
    return () => window.removeEventListener("pointermove", follow);
  }, []);

  // Poking it. The click is tested against where the companion is drawn rather
  // than raycast through the canvas, because the canvas has to keep ignoring
  // pointer events or it would swallow every click on the page. Nothing here
  // consumes the event either, so whatever is underneath still gets it.
  useEffect(() => {
    const jab = (event) => {
      const { x, y, r } = spot.current;
      if (!r) return;

      const gapX = event.clientX - x;
      const gapY = event.clientY - y;
      if (gapX * gapX + gapY * gapY > r * r) return;

      const now = performance.now();
      const teasing = now - lastPoke.current < TEASE;
      lastPoke.current = now;
      nagged.current = teasing
        ? Math.min(nagged.current + 1, GRUMPS.length - 1)
        : 0;

      cross.current = 1;
      jolt.current = 1;
      whirl.current = Math.PI * 2;

      // Knocked off balance, away from the finger. The spring that holds it in
      // place does the rest, so it rocks back rather than snapping.
      speed.current.x += (gapX > 0 ? -1 : 1) * 2.8;
      speed.current.y += 1.5;

      setGrump(GRUMPS[nagged.current]);
      clearTimeout(calm.current);
      calm.current = setTimeout(() => setGrump(null), SULK * 1000);
    };

    window.addEventListener("pointerdown", jab, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", jab);
      clearTimeout(calm.current);
      // The cursor outlives this component on a resize down to a phone.
      document.querySelector(".cursor-ring")?.classList.remove("is-poke");
    };
  }, []);

  useEffect(
    () => () => {
      route.dispose();
      cursorRoute.dispose();
    },
    [route, cursorRoute]
  );

  const anchors = useMemo(
    () =>
      SECTIONS.map(({ anchor }) =>
        new THREE.Vector3(
          anchor.x * (viewport.width / 2) * 0.84,
          anchor.y * (viewport.height / 2) * 0.84,
          0
        )
      ),
    [viewport.width, viewport.height]
  );

  // The sets are rebuilt only when the viewport changes, so the speech bubble
  // updating does not make React reconcile every prop in the scenery.
  const stage = useMemo(
    () =>
      SECTIONS.map((section, i) => {
        const SceneSet = SCENES[section.scene];
        return (
          <group key={section.id} position={anchors[i]}>
            <SceneSet ref={sceneRefs[i]} energy={typingEnergy} />
          </group>
        );
      }),
    [anchors, sceneRefs]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const time = state.clock.elapsedTime;

    journey.update(dt);

    const { from, to, blend, travel } = journey;

    target.current.lerpVectors(anchors[from], anchors[to], blend);
    // Arc the crossing upward and toward the camera so it reads as flight
    // across the page rather than a slide behind the content.
    target.current.y += travel * 1.15;
    target.current.z += travel * 1.7;

    if (!settled.current) {
      place.current.copy(target.current);
      settled.current = true;
    }

    // Critically damped spring gives the object weight and a little overshoot.
    const stiffness = reduced ? 90 : 30;
    const damping = reduced ? 16 : 7.6;

    scratch.subVectors(target.current, place.current);
    speed.current.addScaledVector(scratch, stiffness * dt);
    speed.current.multiplyScalar(Math.exp(-damping * dt));
    place.current.addScaledVector(speed.current, dt);

    rig.current.position.copy(place.current);

    const rush = speed.current.length();
    const hustle = clamp(rush * 0.06, 0, 1);
    const rest = 1 - travel;

    // How present the companion is in each set. The sets build and dissolve
    // around it, so leaving one is what packs it away.
    let strongest = 0;
    for (let i = 0; i < SECTIONS.length; i += 1) {
      const nearness = clamp(1 - Math.abs(journey.position - i) * 1.9, 0, 1);
      weights[i] = nearness * (1 - travel * 0.85);
      strongest = Math.max(strongest, weights[i]);
      const set = sceneRefs[i].current;
      if (set) set.userData.activity = weights[i];
    }

    // Linger at the end of the page, wave, then carry the reader back up.
    const atEnd = journey.position > SECTIONS.length - 1.15;
    const busy = ["INPUT", "TEXTAREA"].includes(
      document.activeElement?.tagName
    );

    const quiet = performance.now() - lastTouch.current > 1400;
    const lingering =
      atEnd &&
      quiet &&
      !busy &&
      document.hasFocus() &&
      Math.abs(journey.velocity) < 8;

    if (lingering) {
      loiter.current += dt;
    } else {
      // Reading, clicking or moving the mouse cancels the goodbye outright.
      loiter.current = 0;
      if (waving.current) {
        waving.current = false;
        setFarewell(false);
      }
    }

    if (!waving.current && loiter.current > 5) {
      waving.current = true;
      waveStart.current = time;
      setFarewell(true);
    }

    let wave = 0;

    if (waving.current) {
      const elapsed = time - waveStart.current;
      wave = Math.sin(Math.PI * clamp(elapsed / WAVE_TIME, 0, 1));

      if (elapsed >= WAVE_TIME) {
        waving.current = false;
        loiter.current = 0;
        setFarewell(false);
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }
    }

    // Ease the wave in and out so an interruption does not snap the arm.
    waveLevel.current += (wave - waveLevel.current) * clamp(dt * 8, 0, 1);
    const swing = waveLevel.current;

    /* ---- pose ------------------------------------------------------- */

    // Mix the pose it is leaving with the one it is arriving at, then fold in
    // the flight pose by how far off the ground it is. Arms leave the keyboard
    // on the way out and settle onto the next prop on the way in.
    mixPose(mixed, POSES[SECTIONS[from].pose], POSES[SECTIONS[to].pose], blend);
    mixPose(goal, mixed, POSES.fly, travel);
    easePose(pose, goal, clamp(dt * (reduced ? 14 : 7), 0, 1));

    const idle = reduced ? 0 : rest;
    const focus = (i) => (reduced ? 0 : weights[i] * rest);

    let spine = pose.spine;
    let headX = pose.headX;
    let headY = 0;
    let shoulderLX = pose.shoulderLX;
    let shoulderLZ = pose.shoulderLZ;
    let elbowL = pose.elbowL;
    let shoulderRX = pose.shoulderRX;
    let shoulderRZ = pose.shoulderRZ;
    let elbowR = pose.elbowR;

    // Hero: it notices you. The head follows the cursor and it straightens up
    // whenever the page starts moving.
    const hero = focus(0);
    perk.current = Math.max(
      clamp(Math.abs(journey.velocity) * 0.004, 0, 1),
      perk.current * Math.exp(-2.4 * dt)
    );
    const wantY = pointer.current.x * 0.55 * hero;
    const wantX = -pointer.current.y * 0.3 * hero - perk.current * 0.18 * hero;
    lookY.current += (wantY - lookY.current) * clamp(dt * 4, 0, 1);
    lookX.current += (wantX - lookX.current) * clamp(dt * 4, 0, 1);
    headY += lookY.current;
    headX += lookX.current;

    // About: eyes tracking across the page, with a flick to turn it.
    const reading = focus(1);
    headY += Math.sin(time * 0.75) * 0.22 * reading;
    const turn = hump((time % 7) / 7, 0.6, 0.78) * reading;
    if (tablet.current) tablet.current.rotation.z = -turn * 0.5;
    elbowL += turn * 0.25;

    // Experience: typing, with the odd pause to think and a reach for the mug.
    const working = focus(2);
    const sip = hump((time % 11) / 11, 0.62, 0.84) * working;
    const think = hump((time % 9) / 9, 0.2, 0.34) * working;
    const clatter = working * (1 - sip) * (1 - think);

    typingEnergy.current = clatter;

    elbowL += Math.sin(time * 15.5) * 0.1 * clatter;
    elbowR += Math.sin(time * 15.5 + 2.1) * 0.1 * clatter;
    shoulderLX += Math.sin(time * 15.5 + 1) * 0.035 * clatter;
    shoulderRX += Math.sin(time * 15.5 + 3.2) * 0.035 * clatter;
    headX += Math.sin(time * 2.4) * 0.05 * working;

    // Sitting back from the keyboard to think it over.
    spine -= think * 0.28;
    headX -= think * 0.22;
    elbowL -= think * 0.3;
    elbowR -= think * 0.3;

    // Right hand off to the mug and back.
    shoulderRX += sip * 0.42;
    shoulderRZ -= sip * 0.55;
    elbowR += sip * 0.55;
    headX -= sip * 0.12;

    // Stack: the reaching arm drifts with whatever it has picked up.
    const picking = focus(3);
    shoulderRX += Math.sin(time * 1.3) * 0.12 * picking;
    shoulderRZ += Math.sin(time * 0.9) * 0.1 * picking;
    headY += Math.sin(time * 1.3) * 0.18 * picking;

    // Projects: hands turning with the panel it is holding.
    const inspecting = focus(4);
    const spin = Math.sin(time * 0.55);
    shoulderLZ += spin * 0.14 * inspecting;
    shoulderRZ += spin * 0.14 * inspecting;
    headY += spin * 0.2 * inspecting;

    // Contact: nodding along while it talks.
    const calling = focus(5);
    headX += Math.sin(time * 2.6) * 0.06 * calling;
    headY += Math.sin(time * 1.1) * 0.12 * calling;
    spine += Math.sin(time * 1.7) * 0.03 * calling;

    /* ---- being poked ------------------------------------------------ */

    cross.current = Math.max(0, cross.current - dt / SULK);
    jolt.current *= Math.exp(-8 * dt);
    whirl.current -= whirl.current * clamp(dt * 3.2, 0, 1);

    const mad = reduced ? 0 : cross.current;
    const sulk = mad * mad * (3 - 2 * mad);

    if (sulk > 0.001) {
      // Arms folded, which overrides whatever it was holding or typing on.
      shoulderLX += (-0.5 - shoulderLX) * sulk;
      shoulderLZ += (0.85 - shoulderLZ) * sulk;
      elbowL += (1.85 - elbowL) * sulk;
      shoulderRX += (-0.5 - shoulderRX) * sulk;
      shoulderRZ += (-0.85 - shoulderRZ) * sulk;
      elbowR += (1.85 - elbowR) * sulk;

      // Chin down into a glare, and a few sharp shakes of the head that run
      // out along with the mood.
      headX += 0.16 * sulk;
      headY += Math.sin((1 - cross.current) * 26) * 0.34 * sulk;
      spine -= 0.1 * sulk;
    }

    /* ---- apply ------------------------------------------------------ */

    const yaw =
      YAW[SECTIONS[from].scene] * (1 - blend) + YAW[SECTIONS[to].scene] * blend;

    chassis.current.rotation.x = spine;
    // The spin sits on top of everything else, so it whips all the way round
    // and slows into whatever it was facing before.
    chassis.current.rotation.y =
      yaw +
      Math.sin(time * 0.4) * 0.1 * idle +
      travel * 0.5 +
      (reduced ? 0 : whirl.current);

    head.current.rotation.x = headX;
    head.current.rotation.y = headY;

    armL.current.rotation.x = shoulderLX;
    armL.current.rotation.z = shoulderLZ;
    foreL.current.rotation.x = elbowL;

    // The waving arm overrides whatever it was holding.
    armR.current.rotation.x = shoulderRX * (1 - swing);
    armR.current.rotation.z =
      shoulderRZ + (2.05 - shoulderRZ) * swing + Math.sin(time * 13) * 0.45 * swing;
    foreR.current.rotation.x = elbowR * (1 - swing) + 0.3 * swing;

    legL.current.rotation.x = pose.hip;
    legR.current.rotation.x = pose.hip * 0.94;
    shinL.current.rotation.x = pose.knee;
    shinR.current.rotation.x = pose.knee * 0.96;

    // Seated poses drop the hips onto the seat; hovering ones float.
    bob.current.position.y =
      -0.17 * pose.sit + Math.sin(time * 1.6) * 0.075 * idle * (1 - pose.sit);

    if (tablet.current) {
      tablet.current.visible = weights[1] > 0.02;
      tablet.current.traverse((child) => {
        if (child.isMesh) child.material.opacity = weights[1] * (child.userData.o ?? 1);
      });
    }

    if (handset.current) {
      const shown = weights[5] * (1 - swing);
      handset.current.visible = shown > 0.02;
      handset.current.traverse((child) => {
        if (child.isMesh) child.material.opacity = shown * (child.userData.o ?? 1);
      });
    }

    // The label rides above the companion, free of its lean and squash.
    tag.current.position.copy(place.current);

    const nearest = Math.round(journey.position);
    if (nearest !== spokenRef.current) {
      spokenRef.current = nearest;
      setSpoken(nearest);
    }

    // Route the companion leaves behind, lingering after it lands.
    if (!routeReady.current) {
      seedRoute(route, ROUTE_POINTS, place.current);
      routeReady.current = true;
    }

    // Hold the trail a little longer so the whole arc across the page is on
    // screen at once instead of fading out behind it.
    routeAlpha.current = Math.max(
      clamp(hustle * 1.6, 0, 1),
      routeAlpha.current * Math.exp(-0.8 * dt)
    );

    traceRoute(
      route,
      ROUTE_POINTS,
      place.current,
      ROUTE_STEP,
      routeAlpha.current,
      1.7
    );

    // Matching route for the cursor, quicker to appear and quicker to clear.
    cursorAt.current.set(
      pointer.current.x * (viewport.width / 2),
      pointer.current.y * (viewport.height / 2),
      0
    );

    if (pointer.current.seen && !cursorReady.current) {
      seedRoute(cursorRoute, CURSOR_POINTS, cursorAt.current);
      cursorWas.current.copy(cursorAt.current);
      cursorReady.current = true;
    }

    if (cursorReady.current) {
      const drift = cursorAt.current.distanceTo(cursorWas.current) / dt;
      cursorWas.current.copy(cursorAt.current);

      cursorAlpha.current = Math.max(
        clamp(drift * 0.12, 0, 1),
        cursorAlpha.current * Math.exp(-3.4 * dt)
      );

      traceRoute(
        cursorRoute,
        CURSOR_POINTS,
        cursorAt.current,
        CURSOR_STEP,
        cursorAlpha.current * 0.75,
        2.1
      );
    }

    if (bubble.current) {
      // Normally it only speaks once it has landed, but a complaint cannot
      // wait for that.
      const reveal = Math.max(clamp((rest - 0.4) / 0.45, 0, 1), sulk);
      bubble.current.style.opacity = String(reveal);
      bubble.current.style.transform = `translateY(${(1 - reveal) * 10}px) scale(${
        0.86 + reveal * 0.14
      })`;
    }

    // Lean into the direction of travel, then level out once it settles.
    const lean = clamp(-speed.current.x * 0.03, -0.5, 0.5);
    const pitch = clamp(speed.current.y * 0.025, -0.4, 0.4);
    rig.current.rotation.z += (lean - rig.current.rotation.z) * clamp(dt * 6, 0, 1);
    rig.current.rotation.x += (pitch - rig.current.rotation.x) * clamp(dt * 6, 0, 1);
    rig.current.rotation.z += Math.sin(time * 6.5) * 0.1 * swing;

    // Stretched thin by speed, squashed wide by a jab.
    const stretch = reduced ? 0 : clamp(rush * 0.012, 0, 0.3);
    const squash = reduced ? 0 : jolt.current;
    rig.current.scale.set(
      (1 - stretch * 0.5) * (1 + squash * 0.24),
      (1 + stretch) * (1 - squash * 0.28),
      (1 - stretch * 0.5) * (1 + squash * 0.24)
    );

    // A shadow pooled under the companion. The camera looks straight on rather
    // than down, so it is a flattened disc facing us rather than a floor plane.
    if (shadow.current) {
      const floor =
        anchors[from].y * (1 - blend) + anchors[to].y * blend - 0.92;
      shadow.current.position.set(place.current.x, floor, place.current.z - 0.6);
      const lift = clamp((place.current.y - floor) / 1.6, 0, 1);
      shadow.current.scale.set(0.62 - lift * 0.16, 0.15 - lift * 0.04, 1);
      shadow.current.material.opacity =
        strongest * 0.22 * (1 - lift * 0.7) * (1 - pose.sit * 0.6);
    }

    // The halo belongs to hovering. Seated at a desk it is wider than the
    // companion and cuts straight across the screen, so it packs away as it
    // sits down and comes back when it lifts off.
    const grounded = 1 - pose.sit;
    halo.current.visible = grounded > 0.02;
    halo.current.material.opacity = 0.5 * grounded;
    halo.current.rotation.z += dt * (0.35 + hustle * 1.8);
    halo.current.rotation.x = 1.2 + Math.sin(time * 0.6) * 0.15;

    // The flight bubble only shows itself while it is actually travelling.
    shell.current.rotation.y += dt * 0.24;
    shell.current.material.opacity = (0.04 + travel * 0.2) * grounded;

    antenna.current.rotation.z =
      clamp(-speed.current.x * 0.05, -0.7, 0.7) +
      Math.sin(time * 2.1) * 0.12 * idle -
      perk.current * 0.25 * hero +
      Math.sin(time * 30) * 0.3 * sulk;

    // Occasional blink keeps it feeling alive rather than mechanical. A mood
    // narrows the visor into a glare and turns it from cool to hot.
    const blinkPhase = (time % 5) / 0.16;
    const blink = blinkPhase < 1 ? Math.sin(blinkPhase * Math.PI) : 0;
    visor.current.scale.y = 0.26 * (1 - blink * 0.85) * (1 - sulk * 0.5);
    visor.current.material.emissiveIntensity =
      1.15 + Math.sin(time * 2.2) * 0.2 + hustle + clatter * 0.4 + sulk * 1.4;
    visor.current.material.color.lerpColors(ACCENT_COLOR, CROSS_COLOR, sulk);
    visor.current.material.emissive.lerpColors(ACCENT_COLOR, CROSS_COLOR, sulk);

    // Shift the shell tone with the section behind it so it stays readable.
    const darkness =
      SECTIONS[from].tone * (1 - blend) + SECTIONS[to].tone * blend;
    skin.color.lerpColors(INK_COLOR, LIGHT_COLOR, darkness);
    lamp.current.intensity = 0.7 + darkness * 1.9 + hustle + sulk;
    lamp.current.color.lerpColors(ACCENT_COLOR, CROSS_COLOR, sulk);

    /* ---- where it is on screen -------------------------------------- */

    // Kept up to date every frame so a click can be tested against it, and so
    // the cursor can show that there is something here worth prodding.
    scratch.copy(place.current).project(state.camera);
    spot.current.x = (scratch.x * 0.5 + 0.5) * state.size.width;
    spot.current.y = (-scratch.y * 0.5 + 0.5) * state.size.height;

    scratch.set(place.current.x, place.current.y + 0.85, place.current.z);
    scratch.project(state.camera);
    spot.current.r = Math.abs(
      (-scratch.y * 0.5 + 0.5) * state.size.height - spot.current.y
    );

    if (pointer.current.seen) {
      const overX = ((pointer.current.x + 1) / 2) * state.size.width - spot.current.x;
      const overY = ((1 - pointer.current.y) / 2) * state.size.height - spot.current.y;
      const over = overX * overX + overY * overY < spot.current.r * spot.current.r;
      document
        .querySelector(".cursor-ring")
        ?.classList.toggle("is-poke", over);
    }
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 6]} intensity={0.8} />

      {stage}

      <mesh ref={shadow} scale={[0.6, 0.15, 1]}>
        <circleGeometry args={[1, 28]} />
        <meshBasicMaterial
          color={INK}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <line geometry={route} frustumCulled={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </line>

      <points geometry={route} frustumCulled={false}>
        <pointsMaterial
          size={0.07}
          vertexColors
          transparent
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <line geometry={cursorRoute} frustumCulled={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </line>

      <points geometry={cursorRoute} frustumCulled={false}>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <group ref={tag}>
        <Html center position={[0, 1.75, 0]} style={{ pointerEvents: "none" }}>
          <CloudBubble
            ref={bubble}
            section={SECTIONS[spoken]}
            line={line}
            typing={typing}
            farewell={farewell}
            grump={grump}
          />
        </Html>
      </group>

      <group ref={rig}>
        <group ref={bob}>
          <group ref={chassis}>
            <pointLight ref={lamp} color={ACCENT} distance={6} intensity={1} />

            {/* Torso */}
            <mesh material={skin}>
              <capsuleGeometry args={[0.2, 0.22, 4, 16]} />
            </mesh>
            <mesh position={[0, -0.28, 0]} material={trim}>
              <cylinderGeometry args={[0.14, 0.16, 0.08, 12]} />
            </mesh>

            {/* Head */}
            <group ref={head} position={[0, 0.44, 0]}>
              <mesh material={skin}>
                <sphereGeometry args={[0.21, 24, 24]} />
              </mesh>
              <mesh ref={visor} position={[0, 0.02, 0.155]} scale={[0.4, 0.26, 0.2]}>
                <sphereGeometry args={[0.5, 20, 20]} />
                <meshStandardMaterial
                  color={ACCENT}
                  emissive={ACCENT}
                  emissiveIntensity={1.2}
                  toneMapped={false}
                />
              </mesh>

              <group ref={antenna} position={[0, 0.19, 0]}>
                <mesh position={[0, 0.11, 0]}>
                  <cylinderGeometry args={[0.011, 0.011, 0.22, 6]} />
                  <meshBasicMaterial color={PALE} transparent opacity={0.7} />
                </mesh>
                <mesh position={[0, 0.24, 0]}>
                  <sphereGeometry args={[0.045, 14, 14]} />
                  <meshStandardMaterial
                    color={ACCENT}
                    emissive={ACCENT}
                    emissiveIntensity={1.4}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            </group>

            {/* Arms. Upper arm hangs from the shoulder, forearm from the elbow. */}
            <group ref={armL} position={[-0.24, 0.16, 0]}>
              <mesh position={[0, -0.13, 0]} material={skin}>
                <capsuleGeometry args={[0.043, 0.14, 4, 10]} />
              </mesh>
              <group ref={foreL} position={[0, -0.26, 0]}>
                <mesh position={[0, -0.11, 0]} material={skin}>
                  <capsuleGeometry args={[0.038, 0.13, 4, 10]} />
                </mesh>
                <mesh position={[0, -0.23, 0]} material={trim}>
                  <sphereGeometry args={[0.058, 12, 12]} />
                </mesh>
              </group>
            </group>

            <group ref={armR} position={[0.24, 0.16, 0]}>
              <mesh position={[0, -0.13, 0]} material={skin}>
                <capsuleGeometry args={[0.043, 0.14, 4, 10]} />
              </mesh>
              <group ref={foreR} position={[0, -0.26, 0]}>
                <mesh position={[0, -0.11, 0]} material={skin}>
                  <capsuleGeometry args={[0.038, 0.13, 4, 10]} />
                </mesh>
                <mesh position={[0, -0.23, 0]} material={trim}>
                  <sphereGeometry args={[0.058, 12, 12]} />
                </mesh>
              </group>
            </group>

            {/* Legs */}
            <group ref={legL} position={[-0.1, -0.3, 0]}>
              <mesh position={[0, -0.12, 0]} material={skin}>
                <capsuleGeometry args={[0.048, 0.13, 4, 10]} />
              </mesh>
              <group ref={shinL} position={[0, -0.25, 0]}>
                <mesh position={[0, -0.11, 0]} material={skin}>
                  <capsuleGeometry args={[0.041, 0.12, 4, 10]} />
                </mesh>
                <mesh position={[0, -0.22, 0.03]} material={trim}>
                  <boxGeometry args={[0.09, 0.05, 0.14]} />
                </mesh>
              </group>
            </group>

            <group ref={legR} position={[0.1, -0.3, 0]}>
              <mesh position={[0, -0.12, 0]} material={skin}>
                <capsuleGeometry args={[0.048, 0.13, 4, 10]} />
              </mesh>
              <group ref={shinR} position={[0, -0.25, 0]}>
                <mesh position={[0, -0.11, 0]} material={skin}>
                  <capsuleGeometry args={[0.041, 0.12, 4, 10]} />
                </mesh>
                <mesh position={[0, -0.22, 0.03]} material={trim}>
                  <boxGeometry args={[0.09, 0.05, 0.14]} />
                </mesh>
              </group>
            </group>

            {/* The tablet it reads from in About */}
            <group ref={tablet} position={[0, -0.14, 0.32]} rotation={[-0.75, 0, 0]} visible={false}>
              <mesh userData={{ o: 0.85 }}>
                <boxGeometry args={[0.46, 0.34, 0.016]} />
                <meshBasicMaterial color={INK} transparent opacity={0} toneMapped={false} />
              </mesh>
              <mesh position={[0, 0, 0.012]} userData={{ o: 0.55 }}>
                <planeGeometry args={[0.4, 0.28]} />
                <meshBasicMaterial color={ACCENT} transparent opacity={0} toneMapped={false} />
              </mesh>
            </group>

            {/* The handset it calls on in Contact */}
            <group ref={handset} position={[0.3, 0.4, 0.14]} rotation={[0.1, 0, -0.32]} visible={false}>
              <mesh userData={{ o: 0.9 }}>
                <boxGeometry args={[0.1, 0.26, 0.05]} />
                <meshBasicMaterial color={INK} transparent opacity={0} toneMapped={false} />
              </mesh>
              <mesh position={[0, 0, 0.027]} userData={{ o: 0.7 }}>
                <planeGeometry args={[0.075, 0.2]} />
                <meshBasicMaterial color={ACCENT} transparent opacity={0} toneMapped={false} />
              </mesh>
            </group>

            <mesh ref={halo} rotation={[1.2, 0, 0]}>
              <torusGeometry args={[0.62, 0.016, 12, 44]} />
              <meshBasicMaterial color={PALE} transparent opacity={0.5} toneMapped={false} />
            </mesh>

            <mesh ref={shell}>
              <icosahedronGeometry args={[0.82, 1]} />
              <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.04} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
};

const Companion = () => {
  const journey = useMemo(() => new Journey(), []);
  const [enabled, setEnabled] = useState(false);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    const check = () => setEnabled(window.innerWidth >= 768);
    check();

    journey.measure();
    const remeasure = () => journey.measure();

    // Section heights move as fonts load and reveal animations run.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);

    window.addEventListener("resize", check);
    window.addEventListener("load", remeasure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
      window.removeEventListener("load", remeasure);
    };
  }, [journey]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        // The canvas sets pointer-events auto on itself, which would swallow
        // every click on the page, so it has to be switched off here.
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <Scene journey={journey} reduced={reduced} />
      </Canvas>
    </div>
  );
};

export default Companion;
