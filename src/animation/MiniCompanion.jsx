import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PixelSprite, { INK_SKIN, PALE_SKIN } from "./PixelSprite";
import Sidekick from "./Sidekick";
import { SECTIONS } from "./journey";
import { useCompanionTalk } from "./useCompanionTalk";
import { getTalk } from "./dialogue";

const KITS = ["lecture", "book", "grade", "chalk", "review", "invite"];

/**
 * The phone sized pair. The 3D scene stays off below 768px, so Pixel and Bit
 * flatten into sprites, share one caption, and keep animation cheap.
 */
const MiniCompanion = () => {
  const [enabled, setEnabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [walking, setWalking] = useState(false);
  const [away, setAway] = useState(false);
  const [paused, setPaused] = useState(false);
  const seen = useRef(-1);
  const talk = useCompanionTalk({
    sectionIndex: index,
    enabled,
    paused: away,
    lite: true,
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const check = () => setEnabled(media.matches);
    check();
    media.addEventListener("change", check);
    return () => media.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const across = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const at = SECTIONS.findIndex(({ id }) => id === entry.target.id);
          if (at < 0) return;
          if (entry.isIntersecting) across.add(at);
          else across.delete(at);
        });

        if (across.size) {
          const next = Math.max(...across);
          if (getTalk().holding && next !== 0) return;
          if (getTalk().starting && next !== 0) return;
          setIndex(next);
        }
      },
      { rootMargin: "-42% 0px -42% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || seen.current === index) return undefined;

    const first = seen.current === -1;
    seen.current = index;
    if (first) return undefined;

    setWalking(true);
    const stop = setTimeout(() => setWalking(false), 480);
    return () => clearTimeout(stop);
  }, [index, enabled]);

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

  useEffect(() => {
    if (!enabled) return undefined;
    const sync = () => setPaused(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [enabled]);

  if (!enabled) return null;

  const section = SECTIONS[index];
  const skin = section.tone ? PALE_SKIN : INK_SKIN;
  const pixelLine = Boolean(
    talk?.laugh || talk?.who === "pixel" || talk?.who === "both" || (talk?.text && !talk?.who)
  );
  const speaker =
    talk?.who === "bit" ? "Bit" : talk?.who === "both" || talk?.laugh ? "Pixel & Bit" : "Pixel";
  const line = talk?.laugh ? "Ha ha." : talk?.text;

  return (
    <div
      className={`mini-bots pointer-events-none fixed z-40 flex justify-start${
        paused ? " bot-paused" : ""
      }`}
      style={{
        left: "max(0.75rem, env(safe-area-inset-left))",
        bottom:
          "calc(var(--control-dock-space) + env(safe-area-inset-bottom, 0px))",
        contain: "layout style",
      }}
    >
      <motion.div
        animate={{ opacity: away ? 0 : 1, y: away ? 12 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex max-w-[min(20rem,calc(100vw-1.5rem))] flex-col items-start"
      >
        <AnimatePresence mode="wait">
          {line && !away && (
            <motion.div
              key={`${speaker}-${line}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mb-1.5 w-full rounded-2xl bg-white px-3 py-2 shadow-[0_10px_24px_-8px_rgba(13,23,32,0.55)]"
            >
              <p
                className={`font-display text-[8px] font-bold uppercase tracking-[0.18em] ${
                  talk.tag === "Unhinged" || talk.laugh ? "text-[#e8613a]" : "text-[#2f7ea8]"
                }`}
              >
                {speaker}
                {talk.tag ? ` / ${talk.tag}` : ""}
              </p>
              <p className="mt-0.5 line-clamp-3 text-[12px] font-medium leading-snug text-[#16232f]">
                {line}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <PixelSprite
            size={38}
            walking={walking && talk?.tag !== "Visit"}
            waving={
              (pixelLine || talk?.tag === "Goodbye" || talk?.tag === "Visit") &&
              !talk?.laugh
            }
            laughing={Boolean(talk?.laugh)}
            {...skin}
          />
          <Sidekick
            talk={away ? null : talk}
            tone={section.tone}
            walking={walking}
            size={36}
            kit={KITS[index]}
            sending={talk?.tag === "Visit"}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default MiniCompanion;
