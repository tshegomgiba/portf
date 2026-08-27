import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { Journey, SECTIONS, clamp } from "./journey";
import { POSES, TEACHER, easePose, makePose, mixPose } from "./poses";
import { ACCENT, INK, PALE, SCENES } from "./scenes";
import { RepairingPair } from "./PixelSprite";
import {
  BIT_GLOW,
  BIT_LIGHT,
  BIT_SHELL,
  BIT_TEAL,
  BotFigure,
  useBotParts,
} from "./BotFigure";
import { TeacherGear } from "./teacherSet";
import { hush, speak } from "./voice";
import { useCompanionTalk } from "./useCompanionTalk";
import { getTalk } from "./dialogue";
import { isAutoScrollOn } from "./autoScroll";
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  Ban,
  Bug,
  Zap,
  ShieldAlert,
  Skull,
  WifiOff,
  Unplug,
  OctagonX,
  Siren,
} from "lucide-react";

const SHELL_LIGHT = "#dbeef7";
const CROSS = "#ff8a6a";

const INK_COLOR = new THREE.Color(INK);
const LIGHT_COLOR = new THREE.Color(SHELL_LIGHT);
const ACCENT_COLOR = new THREE.Color(ACCENT);
const CROSS_COLOR = new THREE.Color(CROSS);
const BIT_DARK = new THREE.Color(BIT_SHELL);
const BIT_LIT = new THREE.Color(BIT_LIGHT);
const BIT_GLOW_COLOR = new THREE.Color(BIT_GLOW);
const BIT_TEAL_COLOR = new THREE.Color(BIT_TEAL);

const scratch = new THREE.Vector3();

const easeLook = (from, cursor, pitchRef, yawRef, dt, amount) => {
  let yaw = 0;
  let pitch = 0;
  if (amount > 0.01) {
    yaw = clamp(Math.atan2(cursor.x - from.x, 5.2), -0.95, 0.95) * amount;
    pitch =
      clamp(Math.atan2(-(cursor.y - (from.y + 0.42)), 5.2), -0.48, 0.48) * amount;
  }
  const t = clamp(dt * 6.2, 0, 1);
  yawRef.current += (yaw - yawRef.current) * t;
  pitchRef.current += (pitch - pitchRef.current) * t;
};

// What it has to say about being poked, in order. Keep prodding it and it works
// its way down the list.
const PIXEL_GRUMPS = [
  "Hey! That is not very nice.",
  "Again? I am trying to work here.",
  "That is it. Self destruct.",
];

const BIT_GRUMPS = [
  "Hands off. I am teaching.",
  "That is not how we ask a question.",
  "That is it. Self destruct.",
];

const HELP = {
  pixel: "Stay still. I'll put you back together.",
  bit: "Hold on. I will put you back together.",
};

const BACK = {
  pixel: "I am back. Please do not poke me.",
  bit: "I am back. Please do not poke the class.",
};

const SULK = 3.2;

// How far the companion turns to face the set it is working in.
const YAW = {
  futurist: 0,
  reading: -0.12,
  desk: 0.16,
  orbit: 0.4,
  gallery: 0,
  call: -0.22,
};

const TEACH_KEYS = ["lecture", "book", "grade", "chalk", "review", "invite"];

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
const CloudBubble = React.forwardRef(
  ({ section, grump, talk, speaker = "pixel" }, ref) => {
    const bit = speaker === "bit";
    const accent = bit
      ? talk?.laugh || talk?.tag === "Unhinged"
        ? "text-[#e8613a]"
        : "text-[#2f8f7e]"
      : (grump && grump.who !== "bit") || talk?.laugh || talk?.tag === "Unhinged"
        ? "text-[#e8613a]"
        : "text-[#2f7ea8]";

    const heading = bit
      ? grump?.who === "bit"
        ? grump.text.startsWith("I am back")
          ? "Reboot"
          : grump.text.startsWith("Hold on")
            ? "Repair"
            : "Ouch"
        : talk?.laugh
          ? "Bit / Joke"
          : talk?.tag
            ? `Bit / ${talk.tag}`
            : "Bit"
      : grump && grump.who !== "bit"
        ? grump.text.startsWith("I am back")
          ? "Reboot"
          : grump.text.startsWith("Stay still")
            ? "Repair"
            : "Ouch"
        : talk?.tag === "Goodbye"
          ? "Goodbye"
          : talk?.laugh
            ? "Pixel / Joke"
            : talk?.tag
              ? `Pixel / ${talk.tag}`
              : `Pixel / ${section.note} ${section.label}`;

    const bitLine =
      grump?.who === "bit"
        ? grump.text
        : talk?.laugh || talk?.who === "both"
          ? "Ha ha."
          : talk?.who === "bit"
            ? talk.text
            : null;

    return (
      <div
        ref={ref}
        className="relative select-none pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div style={{ filter: "drop-shadow(0 12px 20px rgba(22,35,47,0.35))" }}>
          {PUFFS.map((puff) => (
            <span key={puff} className={`absolute rounded-full bg-white ${puff}`} />
          ))}

          <div
            className={`relative rounded-[1.75rem] bg-white px-6 py-3 text-center ${
              bit ? "w-[14rem]" : "w-[16rem]"
            }`}
          >
            <p
              className={`font-display text-[9px] font-bold uppercase tracking-[0.22em] ${accent}`}
            >
              {heading}
            </p>

            <div className="mt-1.5 flex min-h-[2.1rem] items-center justify-center">
              <AnimatePresence mode="wait">
                {bit ? (
                  bitLine ? (
                    <motion.p
                      key={bitLine}
                      className={`text-[12.5px] font-medium leading-snug text-[#16232f] ${
                        talk?.tag === "Read" ? "line-clamp-4" : ""
                      }`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={
                        talk?.laugh
                          ? { opacity: 1, y: 0, rotate: [0, -4, 4, -3, 3, 0] }
                          : { opacity: 1, y: 0 }
                      }
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                      {bitLine}
                    </motion.p>
                  ) : (
                    <motion.span
                      key="bit-wait"
                      className="flex items-center gap-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-[#7ed9c0]"
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
                  )
                ) : grump && grump.who !== "bit" ? (
                  <motion.p
                    key={grump.text}
                    className="text-[12.5px] font-semibold leading-snug text-[#16232f]"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={
                      grump.text.startsWith("I am back")
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 1, scale: 1, x: [0, -5, 5, -3, 3, 0] }
                    }
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                  >
                    {grump.text}
                  </motion.p>
                ) : talk?.laugh || talk?.who === "both" ? (
                  <motion.p
                    key="laugh"
                    className="text-[12.5px] font-medium leading-snug text-[#16232f]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, rotate: [0, -4, 4, -3, 3, 0] }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                  >
                    Ha ha.
                  </motion.p>
                ) : talk?.who !== "bit" && talk?.text ? (
                  <motion.p
                    key={talk.text}
                    className="text-[12.5px] font-medium leading-snug text-[#16232f]"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    {talk.text}
                  </motion.p>
                ) : (
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
                )}
              </AnimatePresence>
            </div>
          </div>

          <span className="absolute left-1/2 -bottom-4 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white" />
          <span className="absolute left-1/2 -bottom-8 h-2 w-2 -translate-x-1/2 rounded-full bg-white" />
        </div>
      </div>
    );
  }
);

CloudBubble.displayName = "CloudBubble";

const SHARDS = 36;

const MeltdownAlert = ({ origin }) => {
  const x = origin?.x ?? (typeof window === "undefined" ? 0 : window.innerWidth / 2);
  const y = origin?.y ?? (typeof window === "undefined" ? 0 : window.innerHeight / 2);

  const bits = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 520,
        dy: (Math.random() - 0.65) * 420,
        rot: (Math.random() - 0.5) * 540,
        size: 5 + Math.random() * 16,
        color:
          origin?.who === "bit"
            ? i % 3 === 0
              ? "#ffffff"
              : i % 3 === 1
                ? "#ff8a6a"
                : "#7ed9c0"
            : i % 3 === 0
              ? "#ffffff"
              : i % 3 === 1
                ? "#ff8a6a"
                : "#7ec8e3",
      })),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 z-[80] pointer-events-none overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-[#fff4e8]"
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-[#2a0b08]"
        initial={{ opacity: 0.16 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.85, delay: 0.08 }}
      />

      <motion.span
        className="absolute rounded-full bg-[#ff8a6a]"
        style={{ left: x, top: y, marginLeft: -12, marginTop: -12 }}
        initial={{ width: 24, height: 24, opacity: 1 }}
        animate={{ width: 720, height: 720, marginLeft: -360, marginTop: -360, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="absolute rounded-full border-2 border-white"
        style={{ left: x, top: y }}
        initial={{ width: 8, height: 8, marginLeft: -4, marginTop: -4, opacity: 1 }}
        animate={{ width: 420, height: 420, marginLeft: -210, marginTop: -210, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      {bits.map((bit) => (
        <motion.span
          key={bit.id}
          className="absolute rounded-[2px]"
          style={{
            left: x,
            top: y,
            width: bit.size,
            height: bit.size * 0.55,
            background: bit.color,
            marginLeft: -bit.size / 2,
            marginTop: -bit.size / 4,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: bit.dx, y: bit.dy, opacity: 0, rotate: bit.rot, scale: 0.2 }}
          transition={{ duration: 0.85, ease: [0.15, 0.8, 0.25, 1] }}
        />
      ))}

      <motion.p
        className="absolute left-1/2 top-[18%] -translate-x-1/2 font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-[0.12em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        initial={{ opacity: 1, scale: 0.7 }}
        animate={{ opacity: 0, scale: 1.15 }}
        transition={{ duration: 0.9, delay: 0.15 }}
      >
        Boom
      </motion.p>
    </motion.div>
  );
};

const REBOOT_LOGS = (who) => [
  `ERR  ${who}.core        unresponsive`,
  "LOCK viewport          frozen",
  "RECALL origin          #top",
  "BOOT companion         rebuilding",
  "OK   systems           online",
];

const CRASH_POPUPS = [
  { title: "Fatal error", body: "Pixel.exe has stopped responding.", code: "0xPX-01", x: "4%", y: "7%", delay: 0.04, kind: "error", rot: -4, from: "left" },
  { title: "Heap dump", body: "Companion ran out of patience.", code: "MEM 88", x: "4%", y: "8%", delay: 0.1, kind: "warn", rot: 3, from: "right" },
  { title: "Unhandled poke", body: "Input was not very nice.", code: "POKE x3", x: "6%", y: "34%", delay: 0.16, kind: "error", rot: -2, from: "left" },
  { title: "Render stall", body: "Scene graph collapsed.", code: "GL 504", x: "5%", y: "29%", delay: 0.2, kind: "warn", rot: 5, from: "right" },
  { title: "Viewport lock", body: "Scrolling is offline.", code: "NAV 00", x: "3%", y: "56%", delay: 0.26, kind: "info", rot: 2, from: "left" },
  { title: "Core dump", body: "Self destruct completed.", code: "BOOM", x: "4%", y: "58%", delay: 0.3, kind: "error", rot: -5, from: "right" },
  { title: "Speech bubble", body: "Cannot say hello right now.", code: "UI 12", x: "18%", y: "4%", delay: 0.14, kind: "info", rot: 6, from: "left" },
  { title: "Trail buffer", body: "Cursor crumbs were lost.", code: "PATH", x: "20%", y: "5%", delay: 0.22, kind: "warn", rot: -3, from: "right" },
  { title: "Halo missing", body: "Flight ring failed to boot.", code: "RING", x: "6%", y: "78%", delay: 0.34, kind: "info", rot: 4, from: "right" },
  { title: "Antenna snap", body: "Signal to visitor dropped.", code: "RF 9", x: "5%", y: "78%", delay: 0.18, kind: "error", rot: -6, from: "left" },
];

const EXTRA_POPUPS = [
  { title: "Alert", body: "Please do not poke Pixel.", code: "HINT", x: "8%", y: "18%", delay: 0, kind: "warn", rot: 2, from: "left" },
  { title: "Kernel panic", body: "Joint rig unloaded.", code: "POSE", x: "7%", y: "42%", delay: 0, kind: "error", rot: -3, from: "right" },
  { title: "Timeout", body: "Goodbye wave cancelled.", code: "WAVE", x: "8%", y: "46%", delay: 0, kind: "info", rot: 4, from: "left" },
  { title: "Disk scratch", body: "Desk scene packed away.", code: "SET", x: "5%", y: "72%", delay: 0, kind: "warn", rot: -2, from: "right" },
  { title: "Hot visor", body: "Emissive overload.", code: "EYE", x: "6%", y: "16%", delay: 0, kind: "error", rot: 7, from: "right" },
  { title: "Shadow lost", body: "Floor disc not found.", code: "SHADE", x: "7%", y: "22%", delay: 0, kind: "info", rot: -4, from: "left" },
];

const ERROR_SHAPES = [
  AlertTriangle,
  AlertCircle,
  XCircle,
  Ban,
  Bug,
  Zap,
  ShieldAlert,
  Skull,
  WifiOff,
  Unplug,
];

const ERROR_MARKS = Array.from({ length: 32 }, (_, i) => {
  let x = (i * 37 + 8) % 94;
  let y = (i * 23 + 6) % 90;
  // Leave the Site recovery card and Pixel's seat empty. Keep the rest scattered.
  if (x > 22 && x < 74 && y > 6 && y < 94) {
    x = i % 2 === 0 ? 3 + (i * 7) % 16 : 80 + (i * 5) % 14;
  }
  return {
    id: i,
    Icon: ERROR_SHAPES[i % ERROR_SHAPES.length],
    x: `${x}%`,
    y: `${y}%`,
    size: 20 + (i * 11) % 42,
    rot: (i * 21) % 56 - 28,
    delay: (i % 12) * 0.05,
    color: i % 4 === 0 ? "#ff8a6a" : i % 4 === 1 ? "#e8a15a" : i % 4 === 2 ? "#ff6b4a" : "#7ec8e3",
    opacity: 0.16 + (i % 6) * 0.06,
  };
});

const popupTone = {
  error: { bar: "bg-[#ff8a6a]", text: "text-[#ff8a6a]" },
  warn: { bar: "bg-[#e8a15a]", text: "text-[#e8a15a]" },
  info: { bar: "bg-[#7ec8e3]", text: "text-[#7ec8e3]" },
};

const CrashPopup = ({ title, body, code, x, y, delay, kind, rot, from = "left" }) => {
  const tone = popupTone[kind] ?? popupTone.error;

  return (
    <motion.div
      className="pointer-events-none absolute z-[5] w-[13.5rem] overflow-hidden rounded-lg border border-white/15 bg-[#18232e] shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
      style={{
        top: y,
        left: from === "left" ? x : undefined,
        right: from === "right" ? x : undefined,
      }}
      initial={{ opacity: 0, scale: 0.45, y: 18, rotate: rot - 8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: rot,
        x: [0, -3, 3, -2, 2, 0],
      }}
      transition={{
        opacity: { delay, duration: 0.18 },
        scale: { delay, type: "spring", stiffness: 520, damping: 18 },
        y: { delay, type: "spring", stiffness: 400, damping: 20 },
        rotate: { delay, type: "spring", stiffness: 280, damping: 16 },
        x: { delay: delay + 0.2, duration: 0.35, ease: "easeInOut" },
      }}
    >
      <div className={`flex items-center justify-between px-2.5 py-1.5 ${tone.bar}`}>
        <span className="font-display text-[9px] font-bold uppercase tracking-[0.16em] text-[#16232f]">
          {title}
        </span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16232f]/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#16232f]/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#16232f]/70" />
        </span>
      </div>
      <div className="px-2.5 py-2.5">
        <p className="text-[11px] leading-snug text-white/80">{body}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className={`font-mono text-[9px] ${tone.text}`}>{code}</span>
          <span className="rounded-[4px] border border-white/15 px-2 py-0.5 font-display text-[8px] font-bold uppercase tracking-[0.14em] text-white/55">
            OK
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const RebootScene = ({ who = "pixel" }) => {
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(1);
  const [bar, setBar] = useState(0);
  const [pile, setPile] = useState(0);

  const helper = who === "pixel" ? "bit" : "pixel";
  const name = who === "bit" ? "Bit" : "Pixel";
  const helperName = helper === "bit" ? "Bit" : "Pixel";

  useEffect(() => {
    const stages = [
      setTimeout(() => setStep(1), 850),
      setTimeout(() => setStep(2), 2300),
    ];

    const logs = REBOOT_LOGS(who);
    const lines = logs.map((_, i) =>
      setTimeout(() => setShown(i + 1), 280 + i * 420)
    );

    const extras = setInterval(() => {
      setPile((n) => Math.min(EXTRA_POPUPS.length, n + 1));
    }, 170);

    let frame;
    const started = performance.now();
    const tick = (now) => {
      setBar(Math.min(100, ((now - started) / 2500) * 100));
      if (now - started < 2500) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      stages.forEach(clearTimeout);
      lines.forEach(clearTimeout);
      clearInterval(extras);
      cancelAnimationFrame(frame);
      hush();
    };
  }, []);

  useEffect(() => {
    if (step === 1) return undefined;
    speak(
      step === 2
        ? "There. That should hold."
        : "Hold on. I am putting them back together.",
      { who: helper }
    );
    return undefined;
  }, [step]);

  const headline =
    step === 0 ? "Systems down" : step === 1 ? "Rebooting" : "Systems online";
  const sub =
    step === 0
      ? `${name} process halted`
      : step === 1
        ? `${helperName} is putting ${name} back together`
        : `${name} is coming back`;

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-[#0b1218]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(47,126,168,0.18),transparent_62%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.28) 3px)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[#ff8a6a]/10"
        animate={{ opacity: [0.08, 0.2, 0.06, 0.16, 0.08] }}
        transition={{ duration: 0.35, repeat: Infinity }}
      />

      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        {ERROR_MARKS.map((mark) => (
          <motion.div
            key={mark.id}
            className="absolute"
            style={{ left: mark.x, top: mark.y, color: mark.color }}
            initial={{ opacity: 0, scale: 0.4, rotate: mark.rot - 20 }}
            animate={{
              opacity: [mark.opacity * 0.55, mark.opacity, mark.opacity * 0.7],
              scale: [0.92, 1.08, 0.96],
              rotate: [mark.rot - 6, mark.rot + 6, mark.rot - 4],
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { delay: mark.delay, duration: 0.35 },
              scale: { delay: mark.delay, duration: 2.4 + (mark.id % 5) * 0.25, repeat: Infinity, ease: "easeInOut" },
              rotate: { delay: mark.delay, duration: 3.2 + (mark.id % 4) * 0.3, repeat: Infinity, ease: "easeInOut" },
              y: { delay: mark.delay, duration: 2.8 + (mark.id % 6) * 0.2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <mark.Icon
              size={mark.size}
              strokeWidth={1.75}
              className="drop-shadow-[0_0_10px_currentColor]"
            />
          </motion.div>
        ))}
      </div>

      {CRASH_POPUPS.map((popup) => (
        <CrashPopup key={popup.title} {...popup} />
      ))}
      {EXTRA_POPUPS.slice(0, pile).map((popup) => (
        <CrashPopup key={popup.title} {...popup} />
      ))}

      <motion.div
        className="relative z-20 mx-5 flex w-full max-w-xl flex-col items-center"
        initial={{ scale: 0.92, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-[min(26rem,92vw)] overflow-hidden rounded-2xl border border-white/12 bg-[#121c26]/92 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
            Site recovery
          </p>
          <span className="flex items-center gap-2">
            <motion.span
              className={`h-1.5 w-1.5 rounded-full ${
                step === 2 ? "bg-[#7ec8e3]" : "bg-[#ff8a6a]"
              }`}
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              {step === 2 ? "OK" : "Halt"}
            </span>
          </span>
        </div>

        <div className="px-5 py-6 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={headline}
              className="font-display text-3xl font-extrabold uppercase tracking-[0.08em] text-white sm:text-4xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {headline}
            </motion.p>
          </AnimatePresence>
          <p className="mt-2 text-sm text-white/50">{sub}</p>
        </div>

        <div className="mx-5 mb-5 space-y-1.5 rounded-xl bg-black/25 px-4 py-3 font-mono text-[11px] leading-relaxed text-[#9ecfe3]">
          {REBOOT_LOGS(who).slice(0, shown).map((line) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={line.startsWith("ERR") ? "text-[#ff8a6a]" : undefined}
            >
              {line}
            </motion.p>
          ))}
          {step < 2 && (
            <motion.span
              className="inline-block h-3 w-1.5 bg-[#7ec8e3] align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.55, repeat: Infinity }}
            />
          )}
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-center justify-between font-display text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            <span>Restore</span>
            <span className="tabular-nums">{String(Math.round(bar)).padStart(3, "0")}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ff8a6a] via-[#2f7ea8] to-[#7ec8e3]"
              style={{ width: `${bar}%` }}
            />
          </div>
        </div>
        </div>

        <div className="mt-3 flex flex-col items-center">
          <motion.div
            className="relative mb-1 max-w-[12rem] rounded-2xl bg-white px-3.5 py-2 text-center shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, y: 8, scale: 0.86 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.32 }}
          >
            <p className="font-display text-[8px] font-bold uppercase tracking-[0.2em] text-[#e8613a]">
              {helperName}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[#16232f]">
              {step === 2
                ? "There. That should hold."
                : "Hold on. I am putting them back together."}
            </p>
            <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-white" />
          </motion.div>
          <RepairingPair broken={who} size={118} />
        </div>
      </motion.div>
    </motion.div>
  );
};

const Scene = ({ journey, reduced, doomed, arriving, arrivingWho, onMeltdown }) => {
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
  const bit = useBotParts();
  const bitTag = useRef();
  const bitBubble = useRef();
  const bitShadow = useRef();
  const bitPlace = useRef(new THREE.Vector3());
  const bitNudge = useRef(new THREE.Vector3());
  const victimAt = useRef(new THREE.Vector3());
  const victimLocked = useRef(false);

  const pixelParts = {
    rig,
    bob,
    chassis,
    head,
    visor,
    halo,
    shell,
    antenna,
    lamp,
    armL,
    armR,
    foreL,
    foreR,
    legL,
    legR,
    shinL,
    shinR,
  };

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
  const bitSkin = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: BIT_SHELL,
        roughness: 0.38,
        metalness: 0.35,
      }),
    []
  );
  const bitTrim = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: BIT_TEAL,
        roughness: 0.4,
        metalness: 0.3,
      }),
    []
  );

  useEffect(
    () => () => {
      skin.dispose();
      trim.dispose();
      bitSkin.dispose();
      bitTrim.dispose();
    },
    [skin, trim, bitSkin, bitTrim]
  );

  const pose = useMemo(() => makePose(), []);
  const goal = useMemo(() => makePose(), []);
  const mixed = useMemo(() => makePose(), []);
  const bitPose = useMemo(() => makePose(), []);
  const bitGoal = useMemo(() => makePose(), []);
  const bitMixed = useMemo(() => makePose(), []);
  const bitDrive = useRef({ travel: 0 });
  const weights = useMemo(() => new Float32Array(SECTIONS.length), []);
  const sceneRefs = useMemo(() => SECTIONS.map(() => createRef()), []);
  const typingEnergy = useRef(1);
  const perk = useRef(0);
  const lookX = useRef(0);
  const lookY = useRef(0);
  const bitLookX = useRef(0);
  const bitLookY = useRef(0);

  const [spoken, setSpoken] = useState(0);
  const [grump, setGrump] = useState(null);
  const spokenRef = useRef(0);
  const talk = useCompanionTalk({
    sectionIndex: spoken,
    paused: Boolean(doomed) || Boolean(grump),
  });

  // Where it currently sits on screen, in pixels, so a click can be tested
  // against it without the canvas having to accept pointer events.
  const spot = useRef({ x: 0, y: 0, r: 0 });
  const bitSpot = useRef({ x: 0, y: 0, r: 0 });
  const cross = useRef(0);
  const bitCross = useRef(0);
  const whirl = useRef(0);
  const bitWhirl = useRef(0);
  const jolt = useRef(0);
  const bitJolt = useRef(0);
  const lastPoke = useRef(0);
  const nagged = useRef(0);
  const bitNag = useRef(0);
  const calm = useRef();
  const boom = useRef(0);
  const fired = useRef(false);
  const birth = useRef(arriving ? 0 : 1);
  const burst = useRef();
  const shock = useRef();
  const shards = useRef([]);
  const shardKick = useRef(false);
  const shardVel = useMemo(
    () =>
      Array.from({ length: SHARDS }, () => {
        const v = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() * 0.7 - 0.1,
          Math.random() - 0.5
        ).normalize();
        v.multiplyScalar(2.6 + Math.random() * 4.2);
        return v;
      }),
    []
  );

  const waveLevel = useRef(0);

  useEffect(() => {
    if (grump?.text) {
      speak(grump.text, { who: grump.who || "pixel" });
    }
    return undefined;
  }, [grump]);

  useEffect(() => {
    if (!arriving) return undefined;
    const who = arrivingWho === "bit" ? "bit" : "pixel";
    setGrump({ who, text: BACK[who] });
    const t = setTimeout(() => setGrump(null), 3400);
    return () => clearTimeout(t);
  }, [arriving, arrivingWho]);

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
    const hit = (mark, event) => {
      if (!mark.r) return Infinity;
      const gapX = event.clientX - mark.x;
      const gapY = event.clientY - mark.y;
      const d = gapX * gapX + gapY * gapY;
      return d > mark.r * mark.r ? Infinity : d;
    };

    const jab = (event) => {
      if (fired.current) return;

      const pixelHit = hit(spot.current, event);
      const bitHit = hit(bitSpot.current, event);
      if (!Number.isFinite(pixelHit) && !Number.isFinite(bitHit)) return;

      const who = pixelHit <= bitHit ? "pixel" : "bit";
      const mark = who === "pixel" ? spot.current : bitSpot.current;
      const gapX = event.clientX - mark.x;
      lastPoke.current = performance.now();

      if (who === "pixel") {
        nagged.current += 1;
        cross.current = 1;
        jolt.current = 1;
        whirl.current = Math.PI * 2;
        speed.current.x += (gapX > 0 ? -1 : 1) * 2.8;
        speed.current.y += 1.5;
        const line = Math.min(nagged.current - 1, PIXEL_GRUMPS.length - 1);
        setGrump({ who: "pixel", text: PIXEL_GRUMPS[line] });
      } else {
        bitNag.current += 1;
        bitCross.current = 1;
        bitJolt.current = 1;
        bitWhirl.current = Math.PI * 2;
        bitNudge.current.x += (gapX > 0 ? -1 : 1) * 0.55;
        bitNudge.current.y += 0.28;
        const line = Math.min(bitNag.current - 1, BIT_GRUMPS.length - 1);
        setGrump({ who: "bit", text: BIT_GRUMPS[line] });
      }

      clearTimeout(calm.current);
      calm.current = setTimeout(() => setGrump(null), SULK * 1000);

      const count = who === "pixel" ? nagged.current : bitNag.current;
      if (count >= 3) {
        fired.current = true;
        const helper = who === "pixel" ? "bit" : "pixel";
        setGrump({ who: helper, text: HELP[helper] });
        onMeltdown?.({ who, x: mark.x, y: mark.y });
      }
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

    if (doomed) {
      if (!victimLocked.current) {
        victimAt.current.copy(doomed === "bit" ? bitPlace.current : place.current);
        victimLocked.current = true;
      }
    } else {
      victimLocked.current = false;
    }

    if (doomed === "bit") {
      const side = victimAt.current.x >= 0 ? -0.82 : 0.82;
      target.current.x = victimAt.current.x + side;
      target.current.y = victimAt.current.y;
      target.current.z = victimAt.current.z;
    }

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

    // After thirty quiet seconds on contact they say goodbye, then go home.
    let wave = talk?.tag === "Goodbye" || talk?.tag === "Visit" ? 1 : 0;

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

    cursorAt.current.set(
      pointer.current.x * (viewport.width / 2),
      pointer.current.y * (viewport.height / 2),
      0
    );

    let spine = pose.spine;
    let headX = pose.headX;
    let headY = 0;
    let shoulderLX = pose.shoulderLX;
    let shoulderLZ = pose.shoulderLZ;
    let elbowL = pose.elbowL;
    let shoulderRX = pose.shoulderRX;
    let shoulderRZ = pose.shoulderRZ;
    let elbowR = pose.elbowR;

    // Hero: it straightens up whenever the page starts moving. Looking at the
    // cursor is handled later, from where it actually stands.
    const hero = focus(0);
    perk.current = Math.max(
      clamp(Math.abs(journey.velocity) * 0.004, 0, 1),
      perk.current * Math.exp(-2.4 * dt)
    );
    spine += perk.current * 0.05 * hero;

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

    if (doomed) boom.current = Math.min(1, boom.current + dt / 0.52);
    else boom.current = 0;

    if (birth.current < 1) birth.current = Math.min(1, birth.current + dt / 0.85);

    const blast = boom.current;
    const pixelBlast = doomed === "pixel" ? blast : 0;
    const bitBlast = doomed === "bit" ? blast : 0;
    const grow = 1 - Math.pow(1 - birth.current, 3);
    const bounce =
      arriving && birth.current < 1
        ? 1 + Math.sin(birth.current * Math.PI) * 0.28 * (1 - birth.current)
        : 1;

    if (grow < 1) rig.current.position.y += (1 - grow) * 1.05;

    cross.current = Math.max(0, cross.current - dt / SULK);
    jolt.current *= Math.exp(-8 * dt);
    bitCross.current = Math.max(0, bitCross.current - dt / SULK);
    bitJolt.current *= Math.exp(-8 * dt);
    bitWhirl.current -= bitWhirl.current * clamp(dt * (bitBlast ? 0.4 : 3.2), 0, 1);
    if (bitBlast) bitWhirl.current += dt * 14;
    whirl.current -= whirl.current * clamp(dt * (pixelBlast ? 0.4 : 3.2), 0, 1);
    if (pixelBlast) whirl.current += dt * 14;

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

    if (doomed === "bit") {
      shoulderRX += (-1.2 - shoulderRX) * 0.6;
      elbowR += (0.4 - elbowR) * 0.6;
      headX += 0.28;
      spine += 0.18;
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

    const lookAmt =
      reduced || doomed === "pixel" || !pointer.current.seen ? 0 : 1 - sulk * 0.85;
    easeLook(place.current, cursorAt.current, lookX, lookY, dt, lookAmt);
    head.current.rotation.x = headX + lookX.current;
    head.current.rotation.y = headY + lookY.current;

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
      -0.17 * pose.sit +
      Math.sin(time * 1.6) * 0.075 * idle * (1 - pose.sit) +
      Math.sin(time * 9) * 0.05 * swing;

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
    if (getTalk().holding) {
      if (spokenRef.current !== 0) {
        spokenRef.current = 0;
        setSpoken(0);
      }
    } else if (
      nearest !== spokenRef.current &&
      (talk?.tag !== "Intro" || isAutoScrollOn())
    ) {
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
      const introducing = talk?.tag === "Intro";
      const reveal = doomed === "pixel"
        ? 0
        : Math.max(
            clamp((rest - 0.4) / 0.45, 0, 1),
            sulk,
            doomed === "bit" && grump?.who === "pixel" ? 1 : 0,
            introducing ||
              talk?.laugh ||
              talk?.who === "pixel" ||
              talk?.who === "both" ||
              Boolean(talk?.text && !talk?.who)
              ? 1
              : 0
          ) * (grow < 0.35 ? clamp(grow / 0.35, 0, 1) : 1);
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

    // Stretched thin by speed, squashed wide by a jab. A poke that goes too
    // far swells it, then it bursts instead of shrinking away.
    const stretch = reduced ? 0 : clamp(rush * 0.012, 0, 0.3);
    const squash = reduced ? 0 : jolt.current;
    let gone = 1;
    if (pixelBlast > 0.001) {
      gone = pixelBlast < 0.16 ? 1 + (pixelBlast / 0.16) * 0.95 : Math.max(0, 1.95 * (1 - (pixelBlast - 0.16) / 0.18));
    }
    const spawn = grow * bounce;
    rig.current.scale.set(
      (1 - stretch * 0.5) * (1 + squash * 0.24) * gone * spawn,
      (1 + stretch) * (1 - squash * 0.28) * gone * spawn,
      (1 - stretch * 0.5) * (1 + squash * 0.24) * gone * spawn
    );
    rig.current.rotation.z += Math.sin(time * 48) * 0.42 * pixelBlast;

    if (burst.current && doomed && !shardKick.current) {
      shardKick.current = true;
      burst.current.visible = true;
      burst.current.position.copy(doomed === "bit" ? bitPlace.current : place.current);
      shards.current.forEach((mesh, i) => {
        if (!mesh) return;
        mesh.position.set(0, 0, 0);
        mesh.visible = true;
        mesh.scale.setScalar(0.12 + Math.random() * 0.16);
        const chip =
          doomed === "bit"
            ? i % 3 === 0
              ? "#ffffff"
              : i % 3 === 1
                ? BIT_GLOW
                : BIT_TEAL
            : i % 3 === 0
              ? "#ffffff"
              : i % 3 === 1
                ? CROSS
                : ACCENT;
        mesh.material.color.set(chip);
      });
    }

    if (burst.current && shardKick.current) {
      shards.current.forEach((mesh, i) => {
        if (!mesh) return;
        mesh.position.addScaledVector(shardVel[i], dt);
        shardVel[i].y -= 6.2 * dt;
        mesh.rotation.x += dt * 10;
        mesh.rotation.z += dt * 8;
        mesh.material.opacity = Math.max(0, 1 - blast) * 0.95;
      });
      if (shock.current) {
        const ring = 0.2 + blast * 5.4;
        shock.current.scale.set(ring, ring, ring);
        shock.current.material.opacity = Math.max(0, 1 - blast) * 0.65;
      }
    }

    // A shadow pooled under the companion. The camera looks straight on rather
    // than down, so it is a flattened disc facing us rather than a floor plane.
    if (shadow.current) {
      const floor =
        anchors[from].y * (1 - blend) + anchors[to].y * blend - 0.92;
      shadow.current.position.set(place.current.x, floor, place.current.z - 0.6);
      const lift = clamp((place.current.y - floor) / 1.6, 0, 1);
      shadow.current.scale.set(0.62 - lift * 0.16, 0.15 - lift * 0.04, 1);
      shadow.current.material.opacity =
        strongest * 0.22 * (1 - lift * 0.7) * (1 - pose.sit * 0.6) * (1 - pixelBlast);
    }

    // The halo belongs to hovering. Seated at a desk it is wider than the
    // companion and cuts straight across the screen, so it packs away as it
    // sits down and comes back when it lifts off.
    const grounded = 1 - pose.sit;
    halo.current.visible = grounded > 0.02 && pixelBlast < 0.35;
    halo.current.material.opacity = 0.5 * grounded * (1 - pixelBlast);
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
    visor.current.scale.y = 0.16 * (1 - blink * 0.85) * (1 - Math.max(sulk, pixelBlast) * 0.5);
    visor.current.material.emissiveIntensity =
      1.15 + Math.sin(time * 2.2) * 0.2 + hustle + clatter * 0.4 + sulk * 1.4 + pixelBlast * 4;
    visor.current.material.color.lerpColors(ACCENT_COLOR, CROSS_COLOR, Math.max(sulk, pixelBlast));
    visor.current.material.emissive.lerpColors(ACCENT_COLOR, CROSS_COLOR, Math.max(sulk, pixelBlast));

    const darkness =
      SECTIONS[from].tone * (1 - blend) + SECTIONS[to].tone * blend;
    skin.color.lerpColors(INK_COLOR, LIGHT_COLOR, darkness);
    lamp.current.intensity = 0.7 + darkness * 1.9 + hustle + sulk + pixelBlast * 8;
    lamp.current.color.lerpColors(ACCENT_COLOR, CROSS_COLOR, Math.max(sulk, pixelBlast));

    /* ---- Bit: teacher, opposite lane, own poses --------------------- */

    if (
      bit.rig.current &&
      bit.chassis.current &&
      bit.head.current &&
      bit.armL.current &&
      bit.armR.current &&
      bit.foreL.current &&
      bit.foreR.current &&
      bit.legL.current &&
      bit.legR.current &&
      bit.shinL.current &&
      bit.shinR.current &&
      bit.bob.current
    ) {
      bitDrive.current.travel = travel;
      if (doomed === "bit") {
        bitPlace.current.copy(victimAt.current);
      } else if (doomed === "pixel") {
        const side = place.current.x >= 0 ? -0.82 : 0.82;
        const helpX = place.current.x + side;
        const pull = clamp(dt * 3.4, 0, 1);
        bitPlace.current.x += (helpX - bitPlace.current.x) * pull;
        bitPlace.current.y += (place.current.y - bitPlace.current.y) * pull;
        bitPlace.current.z = place.current.z;
      } else {
        bitPlace.current.set(-place.current.x, place.current.y, place.current.z);
      }
      bitPlace.current.x += bitNudge.current.x;
      bitPlace.current.y += bitNudge.current.y;
      bitNudge.current.multiplyScalar(Math.exp(-5.5 * dt));
      bit.rig.current.position.copy(bitPlace.current);
      if (bitTag.current) bitTag.current.position.copy(bitPlace.current);

      const teachFrom = TEACHER[TEACH_KEYS[from]] || TEACHER.lecture;
      const teachTo = TEACHER[TEACH_KEYS[to]] || TEACHER.lecture;
      mixPose(bitMixed, teachFrom, teachTo, blend);
      mixPose(bitGoal, bitMixed, TEACHER.glide, travel);
      easePose(bitPose, bitGoal, clamp(dt * (reduced ? 14 : 6.2), 0, 1));

      const giggling = talk?.laugh ? 1 : 0;
      const lecturing = (talk?.who === "bit" || talk?.who === "both" ? 1 : 0) * rest;
      const listening = (talk?.who === "pixel" ? 1 : 0) * rest;
      const bitIdle = reduced ? 0 : rest;

      let bSpine = bitPose.spine;
      let bHeadX = bitPose.headX;
      let bHeadY = 0;
      let bShoulderLX = bitPose.shoulderLX;
      let bShoulderLZ = bitPose.shoulderLZ;
      let bElbowL = bitPose.elbowL;
      let bShoulderRX = bitPose.shoulderRX;
      let bShoulderRZ = bitPose.shoulderRZ;
      let bElbowR = bitPose.elbowR;

      const lesson = focus(0);
      bShoulderRX += Math.sin(time * 1.45) * 0.22 * lesson;
      bElbowR += Math.sin(time * 1.45 + 0.6) * 0.12 * lesson;
      bHeadY += Math.sin(time * 0.55) * 0.16 * lesson;

      const paging = focus(1);
      bHeadX += Math.sin(time * 0.7) * 0.08 * paging;
      const leaf = hump((time % 5.5) / 5.5, 0.15, 0.55) * paging;
      bElbowR += leaf * 0.28;
      bShoulderRX += leaf * 0.12;

      const marking = focus(2);
      const tick = hump((time % 2.4) / 2.4, 0.18, 0.55) * marking;
      bElbowR += tick * 0.4;
      bShoulderRX += tick * 0.18;
      bHeadX += 0.06 * marking;

      const writing = focus(3);
      bShoulderRX += Math.sin(time * 3.6) * 0.14 * writing;
      bElbowR += Math.sin(time * 3.6 + 0.8) * 0.2 * writing;
      bHeadY += Math.sin(time * 0.9) * 0.1 * writing;

      const fanning = focus(4);
      bShoulderLZ += Math.sin(time * 0.55) * 0.16 * fanning;
      bShoulderRZ += Math.sin(time * 0.55 + 0.4) * 0.16 * fanning;
      bHeadY += Math.sin(time * 0.55) * 0.12 * fanning;

      const hosting = focus(5);
      bHeadX += Math.sin(time * 2.1) * 0.07 * hosting;
      bShoulderLZ += Math.sin(time * 1.3) * 0.1 * hosting;
      bSpine += Math.sin(time * 1.5) * 0.04 * hosting;

      bSpine += 0.07 * lecturing;
      bHeadX -= 0.05 * lecturing;
      bHeadX += 0.1 * listening;
      bSpine += 0.05 * listening;

      bHeadY += Math.sin(time * 18) * 0.12 * giggling;
      bSpine += Math.sin(time * 14) * 0.04 * giggling;

      const bitMad = reduced ? 0 : bitCross.current;
      const bitSulk = bitMad * bitMad * (3 - 2 * bitMad);
      if (bitSulk > 0.001) {
        bShoulderLX += (-0.5 - bShoulderLX) * bitSulk;
        bShoulderLZ += (0.85 - bShoulderLZ) * bitSulk;
        bElbowL += (1.85 - bElbowL) * bitSulk;
        bShoulderRX += (-0.5 - bShoulderRX) * bitSulk;
        bShoulderRZ += (-0.85 - bShoulderRZ) * bitSulk;
        bElbowR += (1.85 - bElbowR) * bitSulk;
        bHeadY += Math.sin((1 - bitCross.current) * 22) * 0.34 * bitSulk;
        bHeadX += 0.16 * bitSulk;
        bSpine -= 0.1 * bitSulk;
      }

      if (doomed === "pixel") {
        bShoulderRX += (-1.2 - bShoulderRX) * 0.6;
        bElbowR += (0.4 - bElbowR) * 0.6;
        bHeadX += 0.28;
        bSpine += 0.18;
      }

      if (swing > 0.001) {
        bHeadX -= 0.08 * swing;
        bSpine += 0.04 * swing;
      }

      bit.chassis.current.rotation.x = bSpine;
      bit.chassis.current.rotation.y =
        -yaw + Math.sin(time * 0.32) * 0.08 * bitIdle + travel * -0.35 + (reduced ? 0 : bitWhirl.current);

      const bitLookAmt =
        reduced || doomed === "bit" || !pointer.current.seen ? 0 : 1 - bitSulk * 0.85;
      easeLook(bitPlace.current, cursorAt.current, bitLookX, bitLookY, dt, bitLookAmt);
      bit.head.current.rotation.x = bHeadX + bitLookX.current;
      bit.head.current.rotation.y = bHeadY + bitLookY.current;

      bit.armL.current.rotation.x = bShoulderLX;
      bit.armL.current.rotation.z = bShoulderLZ;
      bit.foreL.current.rotation.x = bElbowL;
      bit.armR.current.rotation.x = bShoulderRX * (1 - swing);
      bit.armR.current.rotation.z =
        bShoulderRZ + (2.05 - bShoulderRZ) * swing + Math.sin(time * 11) * 0.4 * swing;
      bit.foreR.current.rotation.x = bElbowR * (1 - swing) + 0.3 * swing;

      bit.legL.current.rotation.x = bitPose.hip;
      bit.legR.current.rotation.x = bitPose.hip * 0.94;
      bit.shinL.current.rotation.x = bitPose.knee;
      bit.shinR.current.rotation.x = bitPose.knee * 0.96;

      bit.bob.current.position.y =
        -0.12 * bitPose.sit +
        Math.sin(time * 1.15) * 0.055 * bitIdle * (1 - bitPose.sit) +
        Math.sin(time * 8.2) * 0.04 * swing;

      const hideBit = bitBlast > 0.05 ? Math.max(0, 1 - (bitBlast - 0.05) * 2.4) : 1;
      let bitGone = 1;
      if (bitBlast > 0.001) {
        bitGone =
          bitBlast < 0.16
            ? 1 + (bitBlast / 0.16) * 0.95
            : Math.max(0, 1.95 * (1 - (bitBlast - 0.16) / 0.18));
      }
      bit.rig.current.rotation.x +=
        (-pitch * 0.55 - bit.rig.current.rotation.x) * clamp(dt * 5, 0, 1);
      bit.rig.current.rotation.z +=
        (-lean * 0.7 - bit.rig.current.rotation.z) * clamp(dt * 5, 0, 1);
      const bitSquash = reduced ? 0 : bitJolt.current;
      bit.rig.current.scale.set(
        0.9 * grow * bounce * bitGone * (1 + bitSquash * 0.24),
        0.9 * grow * bounce * bitGone * (1 - bitSquash * 0.28),
        0.9 * grow * bounce * bitGone * (1 + bitSquash * 0.24)
      );
      bit.rig.current.rotation.z += Math.sin(time * 48) * 0.42 * bitBlast;

      if (bit.halo.current) {
        bit.halo.current.visible = 1 - bitPose.sit > 0.02 && hideBit > 0.35;
        bit.halo.current.material.opacity = 0.42 * (1 - bitPose.sit) * hideBit;
        bit.halo.current.rotation.z -= dt * (0.18 + hustle * 0.6);
        bit.halo.current.rotation.x = 1.05 + Math.sin(time * 0.4) * 0.1;
      }
      if (bit.shell.current) {
        bit.shell.current.rotation.y -= dt * 0.16;
        bit.shell.current.material.opacity =
          (0.05 + travel * 0.16) * (1 - bitPose.sit) * hideBit;
      }
      if (bit.antenna.current) {
        bit.antenna.current.rotation.z =
          clamp(speed.current.x * 0.04, -0.5, 0.5) +
          Math.sin(time * 1.4) * 0.08 * bitIdle -
          0.12 * lecturing;
      }

      const bitBlinkPhase = ((time + 1.7) % 6.2) / 0.16;
      const bitBlink = bitBlinkPhase < 1 ? Math.sin(bitBlinkPhase * Math.PI) : 0;
      if (bit.visor.current) {
        bit.visor.current.scale.y =
          0.26 * (1 - bitBlink * 0.8) * (1 - Math.max(bitSulk, bitBlast) * 0.5);
        bit.visor.current.material.emissiveIntensity =
          1.05 +
          Math.sin(time * 1.7) * 0.16 +
          lecturing * 0.25 +
          giggling * 0.55 +
          bitSulk * 1.4 +
          bitBlast * 4;
        const heat = Math.max(bitSulk, bitBlast);
        bit.visor.current.material.color.lerpColors(
          BIT_GLOW_COLOR,
          heat > 0.01 ? CROSS_COLOR : BIT_TEAL_COLOR,
          heat > 0.01 ? heat : giggling
        );
        bit.visor.current.material.emissive.lerpColors(
          BIT_GLOW_COLOR,
          heat > 0.01 ? CROSS_COLOR : BIT_TEAL_COLOR,
          heat > 0.01 ? heat : giggling
        );
      }

      bitSkin.color.lerpColors(BIT_DARK, BIT_LIT, darkness);
      if (bit.lamp.current) {
        bit.lamp.current.intensity = 0.55 + darkness * 1.5 + lecturing * 0.4;
        bit.lamp.current.color.lerpColors(BIT_GLOW_COLOR, BIT_TEAL_COLOR, giggling);
      }

      if (bitShadow.current && shadow.current) {
        const floor =
          anchors[from].y * (1 - blend) + anchors[to].y * blend - 0.92;
        bitShadow.current.position.set(
          bitPlace.current.x,
          floor,
          bitPlace.current.z - 0.6
        );
        bitShadow.current.scale.set(0.5 * hideBit, 0.12 * hideBit, 0.85 * hideBit);
        bitShadow.current.material.opacity =
          strongest * 0.18 * hideBit * (1 - bitBlast);
      }

      if (bitBubble.current) {
        const introducing = talk?.tag === "Intro";
        const show =
          doomed === "bit" || bitBlast > 0.2
            ? 0
            : grump?.who === "bit"
              ? 1
              : (talk?.laugh || talk?.who === "bit" || talk?.who === "both" ? 1 : 0) *
                (grow < 0.35 ? clamp(grow / 0.35, 0, 1) : 1) *
                (introducing ? 1 : clamp((rest - 0.25) / 0.5, 0, 1));
        bitBubble.current.style.opacity = String(show);
        bitBubble.current.style.transform = `translateY(${(1 - show) * 10}px) scale(${
          0.86 + show * 0.14
        })`;
      }
    }

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

    scratch.copy(bitPlace.current).project(state.camera);
    bitSpot.current.x = (scratch.x * 0.5 + 0.5) * state.size.width;
    bitSpot.current.y = (-scratch.y * 0.5 + 0.5) * state.size.height;
    scratch.set(bitPlace.current.x, bitPlace.current.y + 0.75, bitPlace.current.z);
    scratch.project(state.camera);
    bitSpot.current.r = Math.abs(
      (-scratch.y * 0.5 + 0.5) * state.size.height - bitSpot.current.y
    );

    if (pointer.current.seen) {
      const overPixelX = ((pointer.current.x + 1) / 2) * state.size.width - spot.current.x;
      const overPixelY = ((1 - pointer.current.y) / 2) * state.size.height - spot.current.y;
      const overBitX = ((pointer.current.x + 1) / 2) * state.size.width - bitSpot.current.x;
      const overBitY = ((1 - pointer.current.y) / 2) * state.size.height - bitSpot.current.y;
      const over =
        overPixelX * overPixelX + overPixelY * overPixelY < spot.current.r * spot.current.r ||
        overBitX * overBitX + overBitY * overBitY < bitSpot.current.r * bitSpot.current.r;
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

      <mesh ref={bitShadow} scale={[0.48, 0.12, 1]}>
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
            grump={grump}
            talk={talk}
          />
        </Html>
      </group>

      <group ref={bitTag}>
        <Html center position={[0, 1.5, 0]} style={{ pointerEvents: "none" }}>
          <CloudBubble
            ref={bitBubble}
            speaker="bit"
            section={SECTIONS[spoken]}
            talk={talk}
            grump={grump}
          />
        </Html>
      </group>

      <BotFigure parts={pixelParts} skin={skin} trim={trim} glow={ACCENT} pale={PALE} look="pixel">
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
      </BotFigure>

      <BotFigure parts={bit} skin={bitSkin} trim={bitTrim} glow={BIT_GLOW} pale={BIT_GLOW} look="bit">
        <TeacherGear weights={weights} drive={bitDrive} />
        <mesh position={[0.02, 0.08, 0.2]} rotation={[0.4, 0, 0.12]}>
          <boxGeometry args={[0.12, 0.22, 0.018]} />
          <meshBasicMaterial color={BIT_GLOW} />
        </mesh>
      </BotFigure>

      <group ref={burst} visible={false}>
        {Array.from({ length: SHARDS }, (_, i) => (
          <mesh
            key={i}
            ref={(node) => {
              shards.current[i] = node;
            }}
          >
            <boxGeometry args={[0.14, 0.08, 0.06]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? CROSS : ACCENT}
              transparent
              opacity={0.95}
              toneMapped={false}
            />
          </mesh>
        ))}
        <mesh ref={shock}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
};

const Companion = () => {
  const journey = useMemo(() => new Journey(), []);
  const [enabled, setEnabled] = useState(false);
  const [doomed, setDoomed] = useState(null);
  const [rebooting, setRebooting] = useState(false);
  const [life, setLife] = useState(0);
  const [blastAt, setBlastAt] = useState(null);
  const boomWho = useRef("pixel");
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

  useEffect(() => {
    if (!doomed) return undefined;

    document.body.style.overflow = "hidden";

    const reboot = setTimeout(() => {
      setRebooting(true);
      window.scrollTo({ top: 0, behavior: "auto" });
      window.history.replaceState(null, "", "#top");
    }, 720);

    const respawn = setTimeout(() => {
      document.body.style.overflow = "";
      setDoomed(null);
      setRebooting(false);
      setLife((n) => n + 1);
    }, 3600);

    return () => {
      document.body.style.overflow = "";
      clearTimeout(reboot);
      clearTimeout(respawn);
    };
  }, [doomed]);

  if (!enabled) return null;

  return (
    <>
      <div className={`fixed inset-0 pointer-events-none ${doomed ? "z-[70]" : "z-40"}`}>
        <Canvas
          key={life}
          dpr={reduced ? [1, 1] : [1, 1.35]}
          camera={{ position: [0, 0, 10], fov: 45 }}
          gl={{
            antialias: !reduced,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
          }}
          style={{ background: "transparent", pointerEvents: "none" }}
        >
          <Scene
            journey={journey}
            reduced={reduced}
            doomed={doomed}
            arriving={life > 0}
            arrivingWho={boomWho.current}
            onMeltdown={(origin) => {
              boomWho.current = origin.who;
              setBlastAt(origin);
              setDoomed(origin.who);
            }}
          />
        </Canvas>
      </div>
      <AnimatePresence>
        {doomed && !rebooting && <MeltdownAlert origin={blastAt} />}
      </AnimatePresence>
      <AnimatePresence>{rebooting && <RebootScene who={doomed} />}</AnimatePresence>
    </>
  );
};

export default Companion;
