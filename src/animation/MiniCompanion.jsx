import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PixelSprite, { INK_SKIN, PALE_SKIN } from "./PixelSprite";
import Sidekick from "./Sidekick";
import { SECTIONS } from "./journey";
import { useCompanionTalk } from "./useCompanionTalk";
import { getTalk } from "./dialogue";
import { isAutoScrollOn } from "./autoScroll";

const gazeAt = (el, x, y) => {
  if (!el) return;
  const box = el.getBoundingClientRect();
  const dx = (x - (box.left + box.width / 2)) / 72;
  const dy = (y - (box.top + box.height / 2)) / 72;
  const yaw = Math.max(-1, Math.min(1, dx)) * 28;
  const pitch = Math.max(-1, Math.min(1, dy)) * -18;
  el.style.transform = `rotateY(${yaw}deg) rotateX(${pitch}deg)`;
};

/**
 * The phone sized pair. The 3D scene is off below 768px, so Pixel and Bit
 * flatten into sprites, stay in the bottom left, and still take turns talking.
 */
const MiniCompanion = () => {
  const [enabled, setEnabled] = useState(false);
  const [index, setIndex] = useState(0);
  const [walking, setWalking] = useState(false);
  const [away, setAway] = useState(false);
  const seen = useRef(-1);
  const pixelGaze = useRef(null);
  const bitGaze = useRef(null);
  const talk = useCompanionTalk({
    sectionIndex: index,
    enabled,
    paused: away,
  });

  useEffect(() => {
    const check = () => setEnabled(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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
          if (getTalk().current?.tag === "Intro" && next !== 0 && !isAutoScrollOn()) return;
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
    setWalking(!first);

    const stop = setTimeout(() => setWalking(false), 1000);
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
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const follow = (event) => {
      gazeAt(pixelGaze.current, event.clientX, event.clientY);
      gazeAt(bitGaze.current, event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", follow, { passive: true });
    return () => window.removeEventListener("pointermove", follow);
  }, [enabled]);

  if (!enabled) return null;

  const section = SECTIONS[index];
  const skin = section.tone ? PALE_SKIN : INK_SKIN;
  const pixelLine = Boolean(
    talk?.laugh || talk?.who === "pixel" || talk?.who === "both" || (talk?.text && !talk?.who)
  );

  return (
    <div
      className="pointer-events-none fixed left-3 z-40 flex justify-start"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        animate={{ opacity: away ? 0 : 1, y: away ? 18 : 0 }}
        className="flex items-end gap-1.5"
      >
        <div className="flex max-w-[min(16rem,calc(100vw-6.5rem))] flex-col items-start">
          <AnimatePresence mode="wait">
            {pixelLine && talk?.text && !away && (
              <motion.div
                key={`pixel-${talk.text}`}
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-1.5 max-w-full rounded-2xl bg-white px-3 py-2 shadow-[0_10px_24px_-8px_rgba(13,23,32,0.55)]"
              >
                <p
                  className={`font-display text-[8px] font-bold uppercase tracking-[0.18em] ${
                    talk.tag === "Unhinged" || talk.laugh ? "text-[#e8613a]" : "text-[#2f7ea8]"
                  }`}
                >
                  Pixel{talk.tag ? ` / ${talk.tag}` : ""}
                </p>
                <p className="mt-0.5 line-clamp-4 text-[10.5px] font-medium leading-snug text-[#16232f]">
                  {talk.laugh ? "Ha ha." : talk.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={pixelGaze} className="origin-bottom">
            <PixelSprite
              size={26}
              walking={walking || talk?.tag === "Visit"}
              waving={
                (!walking || talk?.tag === "Visit") &&
                (pixelLine || talk?.tag === "Goodbye" || talk?.tag === "Visit") &&
                !talk?.laugh
              }
              waving={
                !walking &&
                (pixelLine || talk?.tag === "Goodbye" || talk?.tag === "Visit") &&
                !talk?.laugh
              }
              laughing={Boolean(talk?.laugh)}
              {...skin}
            />
          </div>
        </div>

        <Sidekick
          talk={away ? null : talk}
          tone={section.tone}
          walking={walking}
          size={24}
          align="start"
          kit={["lecture", "book", "grade", "chalk", "review", "invite"][index]}
          gazeRef={bitGaze}
          sending={talk?.tag === "Visit"}
        />
      </motion.div>
    </div>
  );
};

export default MiniCompanion;
