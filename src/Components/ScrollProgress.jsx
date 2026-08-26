import React, { useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const [percent, setPercent] = useState(0);

  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  useMotionValueEvent(progress, "change", (value) =>
    setPercent(Math.round(value * 100))
  );

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[65] h-[3px] bg-[#16232f]/15 pointer-events-none">
        <motion.div
          className="relative h-full origin-left bg-gradient-to-r from-[#2f7ea8] via-[#7ec8e3] to-[#b8e0f0]"
          style={{ scaleX: progress }}
        >
          <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_3px_rgba(126,200,227,0.9)]" />
        </motion.div>
      </div>

      {/* Percentage badge, kept out of the way until the reader starts moving. */}
      <motion.div
        // Hidden on phones, where the companion occupies the bottom corners.
        className="fixed bottom-6 left-6 z-[65] pointer-events-none hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-[#16232f]/80 px-3 py-1.5 backdrop-blur-md"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: percent > 2 ? 1 : 0, y: percent > 2 ? 0 : 12 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ec8e3] opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7ec8e3]" />
        </span>
        <span className="font-display text-[11px] font-bold tracking-[0.18em] text-white tabular-nums">
          {String(percent).padStart(2, "0")}%
        </span>
      </motion.div>
    </>
  );
};

export default ScrollProgress;
