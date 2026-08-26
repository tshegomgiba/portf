import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMonitor, FiX } from "react-icons/fi";

const SEEN = "desktop-hint";

/**
 * A quiet word to anyone arriving on a phone. The 3D companion, its scenes and
 * the cursor work are all switched off below 768px, so there is a good deal of
 * the site a small screen never shows. Said once per visit, and only once.
 */
const DesktopHint = () => {
  const [show, setShow] = useState(false);
  const said = useRef(false);
  const timers = useRef([]);

  useEffect(() => {
    // Storage is unavailable in some private browsing modes, and a missing
    // banner matters less than a crash.
    try {
      said.current = !!sessionStorage.getItem(SEEN);
    } catch {
      /* carry on without remembering */
    }

    let ready = false;

    const raise = () => {
      if (!ready || said.current || window.innerWidth >= 768) return;

      // Only counted as said once it is actually on screen. Marking it any
      // earlier means the second of React's two development mounts finds the
      // flag already set and stays quiet.
      said.current = true;
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {
        /* carry on without remembering */
      }

      setShow(true);
      timers.current.push(setTimeout(() => setShow(false), 7000));
    };

    // Wait for the loading screen to clear rather than guessing at a delay.
    const start = () => {
      ready = true;
      timers.current.push(setTimeout(raise, 1200));
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    // A window that only becomes narrow later still counts, which covers a
    // turned phone and a desktop browser being dragged smaller.
    window.addEventListener("resize", raise);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      window.removeEventListener("load", start);
      window.removeEventListener("resize", raise);
    };
  }, []);

  const dismiss = () => {
    timers.current.forEach(clearTimeout);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-x-4 top-24 z-[55] md:hidden"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-[#16232f]/95 px-4 py-3 shadow-[0_18px_40px_-18px_rgba(13,23,32,0.9)] backdrop-blur-md">
            <motion.span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7ec8e3]/15 text-[#7ec8e3]"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <FiMonitor className="h-4 w-4" />
            </motion.span>

            <div className="min-w-0 flex-1">
              <p className="font-display text-[9px] font-bold uppercase tracking-[0.22em] text-[#7ec8e3]">
                Best on desktop
              </p>
              <p className="mt-1 text-[12px] leading-snug text-white/75">
                Pixel and Bit still come along. The 3D tour is waiting on a
                larger screen.
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-white/45 transition-colors hover:text-white"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DesktopHint;
