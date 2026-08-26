import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsDown, Repeat, RotateCcw, Volume2, VolumeX } from "lucide-react";
import {
  isAtmosphereOn,
  toggleAtmosphere,
  watchAtmosphere,
} from "./atmosphere";
import { cutSpeech, isRepeatOn, toggleRepeat, watchRepeat } from "./voice";
import {
  isAutoScrollOn,
  toggleAutoScroll,
  watchAutoScroll,
} from "./autoScroll";
import { restartExperience } from "./experience";

const HINT = "restart-hint";

const pill = (active) =>
  `flex h-11 md:h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-3 backdrop-blur-md transition-colors hover:bg-[#16232f] ${
    active
      ? "bg-[#2f7ea8] text-white"
      : "bg-[#16232f]/80 text-white/70 hover:text-white"
  }`;

const tag = "font-display text-[9px] font-bold uppercase tracking-[0.16em]";

const AtmosphereToggle = () => {
  const [sound, setSound] = useState(isAtmosphereOn);
  const [repeat, setRepeat] = useState(isRepeatOn);
  const [tour, setTour] = useState(isAutoScrollOn);
  const [hint, setHint] = useState(false);
  const said = useRef(false);
  const timers = useRef([]);

  useEffect(() => watchAtmosphere(setSound), []);
  useEffect(() => watchRepeat(setRepeat), []);
  useEffect(() => watchAutoScroll(setTour), []);

  useEffect(() => {
    try {
      said.current = !!sessionStorage.getItem(HINT);
    } catch {
      /* private browsing */
    }

    const raise = () => {
      if (said.current) return;
      said.current = true;
      try {
        sessionStorage.setItem(HINT, "1");
      } catch {
        /* carry on without remembering */
      }
      setHint(true);
      timers.current.push(setTimeout(() => setHint(false), 9000));
    };

    timers.current.push(setTimeout(raise, 2800));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const muteAll = () => {
    const next = toggleAtmosphere();
    setSound(next);
    if (!next) cutSpeech();
  };

  const restart = () => {
    setHint(false);
    restartExperience();
  };

  return (
    <div
      className="fixed z-[65] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-1.5 [touch-action:manipulation] sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="relative">
        <AnimatePresence>
          {hint && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute bottom-full left-1/2 mb-3 w-52 -translate-x-1/2 sm:left-0 sm:translate-x-0"
            >
              <div className="rounded-2xl border border-white/15 bg-[#16232f]/95 px-3 py-2.5 shadow-[0_18px_40px_-18px_rgba(13,23,32,0.9)] backdrop-blur-md">
                <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-[#7ec8e3]">
                  Restart
                </p>
                <p className="mt-1 text-[12px] leading-snug text-white/80">
                  Click the restart button to start the experience over from the
                  first line.
                </p>
              </div>
              <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-white/15 bg-[#16232f]/95 sm:left-5" />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          data-experience-restart
          onClick={restart}
          title="Click to restart the experience from the beginning"
          aria-label="Restart the experience from the first line"
          className={pill(false)}
        >
          <RotateCcw size={15} />
          <span className={tag}>Restart</span>
        </button>
      </div>
      <button
        type="button"
        data-auto-scroll
        onClick={() => setTour(toggleAutoScroll())}
        title={tour ? "Stop page by page tour" : "Auto scroll, page by page"}
        aria-label={tour ? "Stop page by page tour" : "Auto scroll the site, page by page"}
        aria-pressed={tour}
        className={pill(tour)}
      >
        <ChevronsDown size={16} />
        <span className={tag}>Tour</span>
      </button>
      <button
        type="button"
        onClick={() => setRepeat(toggleRepeat())}
        title={repeat ? "Stop repeating Pixel" : "Repeat Pixel lines"}
        aria-label={repeat ? "Stop repeating Pixel" : "Repeat Pixel lines"}
        aria-pressed={repeat}
        className={pill(repeat)}
      >
        <Repeat size={15} />
        <span className={tag}>Repeat</span>
      </button>
      <button
        type="button"
        onClick={muteAll}
        data-sound-toggle
        title={sound ? "Mute all sound" : "Unmute sound"}
        aria-label={sound ? "Mute all sound, including Pixel and Bit" : "Unmute sound"}
        aria-pressed={!sound}
        className={pill(sound)}
      >
        {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span className={tag}>{sound ? "Sound" : "Muted"}</span>
      </button>
    </div>
  );
};

export default AtmosphereToggle;
