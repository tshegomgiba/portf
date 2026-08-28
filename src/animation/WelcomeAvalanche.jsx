import { useMemo } from "react";
import { motion } from "framer-motion";

const ICE = ["#ffffff", "#f3fbff", "#d7eef7", "#b8e0f0", "#eaf6fb"];

const WelcomeAvalanche = ({ play, lite }) => {
  const still = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, [play]);

  const chunks = useMemo(() => {
    if (!play) return [];
    const count = lite ? 36 : 68;
    return Array.from({ length: count }, (_, i) => {
      const slab = i % 4 === 0;
      const shard = i % 3 === 0;
      return {
        id: `${play}-${i}`,
        left: 4 + Math.random() * 92,
        delay: Math.random() * 0.55,
        duration: 1.85 + Math.random() * 1.25,
        width: slab ? 16 + Math.random() * 28 : shard ? 7 + Math.random() * 10 : 4 + Math.random() * 9,
        height: slab ? 9 + Math.random() * 14 : shard ? 14 + Math.random() * 18 : 4 + Math.random() * 9,
        startRot: Math.random() * 70 - 35,
        spin: (Math.random() > 0.5 ? 1 : -1) * (140 + Math.random() * 260),
        drift: (Math.random() - 0.5) * 110,
        opacity: 0.42 + Math.random() * 0.5,
        radius: shard ? 2 : slab ? 4 + Math.random() * 7 : 999,
        color: ICE[i % ICE.length],
      };
    });
  }, [play, lite]);

  if (!play || still) return null;

  return (
    <motion.div
      key={play}
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 3.4, times: [0, 0.78, 1], ease: "easeOut" }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-x-[-10%] -top-1/4 h-[70%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.42),rgba(184,224,240,0.16)_45%,transparent_72%)] blur-2xl"
        initial={{ y: "-30%", opacity: 0 }}
        animate={{ y: ["-30%", "55%"], opacity: [0, 0.7, 0] }}
        transition={{ duration: 2.3, times: [0, 0.32, 1], ease: [0.22, 0.8, 0.2, 1] }}
      />

      {chunks.map((chunk) => (
        <motion.span
          key={chunk.id}
          className="absolute top-[-8%] shadow-[0_0_10px_rgba(184,224,240,0.55)]"
          style={{
            left: `${chunk.left}%`,
            width: chunk.width,
            height: chunk.height,
            borderRadius: chunk.radius,
            opacity: chunk.opacity,
            background: chunk.color,
          }}
          initial={{
            y: 0,
            x: 0,
            rotate: chunk.startRot,
            scale: 0.7,
          }}
          animate={{
            y: "115vh",
            x: chunk.drift,
            rotate: chunk.startRot + chunk.spin,
            scale: [0.7, 1, 0.85],
          }}
          transition={{
            duration: chunk.duration,
            delay: chunk.delay,
            ease: [0.33, 0.02, 0.55, 1],
          }}
        />
      ))}
    </motion.div>
  );
};

export default WelcomeAvalanche;
