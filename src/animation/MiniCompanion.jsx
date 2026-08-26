import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PixelSprite, { INK_SKIN, PALE_SKIN } from "./PixelSprite";
import { SECTIONS } from "./journey";

/**
 * The phone sized companion. The 3D one is switched off below 768px, where a
 * full screen WebGL canvas would cost too much battery and there is no room
 * beside the content for it to work in. This is the same character flattened:
 * it tracks the section you are reading, walks across to the other corner as
 * you move between sections, and says its piece when it arrives.
 */
const MiniCompanion = () => {
  const [enabled, setEnabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [walking, setWalking] = useState(false);
  const [saying, setSaying] = useState(false);
  const [away, setAway] = useState(false);
  const seen = useRef(-1);

  useEffect(() => {
    const check = () => setEnabled(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Whichever section is crossing the middle of the screen is the one it is in.
  useEffect(() => {
    if (!enabled) return undefined;

    // Sections overlap while one covers another, so hold the whole set and
    // follow the one furthest down the page, which is the one on top.
    const across = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const at = SECTIONS.findIndex(({ id }) => id === entry.target.id);
          if (at < 0) return;
          if (entry.isIntersecting) across.add(at);
          else across.delete(at);
        });

        if (across.size) setIndex(Math.max(...across));
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [enabled]);

  // Walk over to the new corner on arrival, speak, then settle down quietly.
  useEffect(() => {
    if (!enabled || seen.current === index) return undefined;

    const first = seen.current === -1;
    seen.current = index;
    setWalking(!first);
    setSaying(true);

    const stop = setTimeout(() => setWalking(false), 1000);
    const quiet = setTimeout(() => setSaying(false), 4600);

    return () => {
      clearTimeout(stop);
      clearTimeout(quiet);
    };
  }, [index, enabled]);

  // Step out of the way while the contact form is being filled in.
  useEffect(() => {
    if (!enabled) return undefined;

    const check = () =>
      setAway(["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName));

    window.addEventListener("focusin", check);
    window.addEventListener("focusout", check);

    return () => {
      window.removeEventListener("focusin", check);
      window.removeEventListener("focusout", check);
    };
  }, [enabled]);

  if (!enabled) return null;

  const section = SECTIONS[index];
  // Same left and right rhythm the 3D companion follows down the page.
  const right = index % 2 === 1;
  const skin = section.tone ? PALE_SKIN : INK_SKIN;

  return (
    <div
      className={`pointer-events-none fixed inset-x-3 bottom-3 z-30 flex ${
        right ? "justify-end" : "justify-start"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        animate={{ opacity: away ? 0 : 1, y: away ? 24 : 0 }}
        className={`flex flex-col ${right ? "items-end" : "items-start"}`}
      >
        <AnimatePresence mode="wait">
          {saying && !away && (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-1.5 max-w-[11rem] rounded-2xl bg-white px-3 py-2 shadow-[0_10px_24px_-8px_rgba(13,23,32,0.55)]"
            >
              <p className="font-display text-[8px] font-bold uppercase tracking-[0.18em] text-[#2f7ea8]">
                {section.note} / {section.label}
              </p>
              <p className="mt-0.5 text-[10.5px] font-medium leading-snug text-[#16232f]">
                {section.lines[0]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <PixelSprite size={30} walking={walking} waving={!walking && saying} {...skin} />
      </motion.div>
    </div>
  );
};

export default MiniCompanion;
