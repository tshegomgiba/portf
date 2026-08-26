import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const TILT = 24;

const TechTile = ({ tech, index }) => {
  const Icon = tech.icon;

  const pointX = useMotionValue(0);
  const pointY = useMotionValue(0);

  const settings = { stiffness: 260, damping: 18, mass: 0.5 };
  const rotateX = useSpring(useTransform(pointY, [-0.5, 0.5], [TILT, -TILT]), settings);
  const rotateY = useSpring(useTransform(pointX, [-0.5, 0.5], [-TILT, TILT]), settings);

  // The sheen slides across the face in the opposite direction to the tilt.
  const sheenX = useTransform(pointX, [-0.5, 0.5], ["120%", "-20%"]);
  const sheenY = useTransform(pointY, [-0.5, 0.5], ["120%", "-20%"]);

  const track = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    pointX.set((event.clientX - box.left) / box.width - 0.5);
    pointY.set((event.clientY - box.top) / box.height - 0.5);
  };

  const reset = () => {
    pointX.set(0);
    pointY.set(0);
  };

  return (
    <motion.div
      className="group relative rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#7ec8e3]/50 hover:bg-white/[0.09] transition-colors duration-300"
      style={{
        rotateX,
        rotateY,
        transformPerspective: 700,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={track}
      onPointerLeave={reset}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
        type: "spring",
        stiffness: 120,
      }}
      whileHover={{ scale: 1.1, y: -5 }}
    >
      {/* Contact shadow that grounds the tile as it lifts. */}
      <span
        className="pointer-events-none absolute inset-3 rounded-2xl opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: tech.hex, transform: "translateZ(-32px)" }}
      />

      <motion.span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.22), transparent 60%)",
          backgroundPositionX: sheenX,
          backgroundPositionY: sheenY,
          backgroundSize: "180% 180%",
          transform: "translateZ(1px)",
        }}
      />

      <div
        className="relative flex flex-col items-center p-3 sm:p-4"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Icon
          className={`text-3xl md:text-4xl ${tech.color} group-hover:animate-pulse`}
          style={{
            transform: "translateZ(34px)",
            filter: `drop-shadow(0 8px 12px ${tech.hex}55)`,
          }}
        />
        <span
          className="text-[10px] md:text-[11px] text-white/60 mt-2.5 text-center font-medium"
          style={{ transform: "translateZ(18px)" }}
        >
          {tech.name}
        </span>
      </div>
    </motion.div>
  );
};

export default TechTile;
