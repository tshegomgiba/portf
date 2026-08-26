import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PixelSprite from "./PixelSprite";
import { bootExperience } from "./experience";

const Preloader = () => {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame;
    let settled = false;
    const started = performance.now();

    // Creep toward 100 while assets load, then finish once the page is ready.
    const tick = () => {
      const elapsed = performance.now() - started;
      const ceiling = settled ? 100 : 92;
      setCount((value) =>
        Math.min(ceiling, value + Math.max(0.6, (ceiling - value) * 0.045))
      );

      if (settled && elapsed > 700) return;
      frame = requestAnimationFrame(tick);
    };

    const finish = () => {
      settled = true;
      setTimeout(() => {
        setDone(true);
        bootExperience();
      }, 420);
    };

    frame = requestAnimationFrame(tick);

    if (document.readyState === "complete") {
      setTimeout(finish, 180);
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    const failsafe = setTimeout(finish, 2200);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(failsafe);
      window.removeEventListener("load", finish);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#16232f]"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <span className="font-display text-5xl font-extrabold tracking-tight text-white">
              TM<span className="text-[#7ec8e3]">.</span>
            </span>
            <span className="mt-3 font-display text-[10px] font-bold uppercase tracking-[0.4em] text-white/45">
              Full Stack Developer
            </span>
          </motion.div>

          <div className="relative mt-20 w-56">
            {/* The companion rides the leading edge of the bar as it fills. */}
            <div
              className="absolute bottom-px -translate-x-1/2"
              style={{ left: `${count}%` }}
            >
              <motion.div
                className="absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1"
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.4, ease: "easeOut" }}
              >
                <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-[#16232f]">
                  Hello
                </span>
                <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-white" />
              </motion.div>

              <PixelSprite walking waving />
            </div>

            <div className="h-px w-full overflow-hidden bg-white/15">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2f7ea8] to-[#7ec8e3]"
                style={{ width: `${count}%` }}
              />
            </div>
          </div>

          <span className="mt-4 font-display text-xs tracking-[0.25em] text-white/35">
            {String(Math.round(count)).padStart(3, "0")}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
