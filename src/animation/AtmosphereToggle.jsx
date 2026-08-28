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
  `flex h-11 min-w-[6.75rem] md:h-10 md:min-w-0 items-center justify-center gap-2 rounded-full border px-3 backdrop-blur-md select-none [-webkit-tap-highlight-color:transparent] transition-[background-color,color,box-shadow,border-color] duration-150 ${
    active
      ? "border-[#7ec8e3]/70 bg-[#2f7ea8] text-white shadow-[0_0_0_2px_rgba(126,200,227,0.35)]"
      : "border-white/15 bg-[#16232f]/80 text-white/70"
  }`;

const tag = "font-display text-[9px] font-bold uppercase tracking-[0.16em]";

const Control = ({ active, onClick, children, ...rest }) => {
  const [down, setDown] = useState(false);
  const lift = () => setDown(false);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 520, damping: 26 }}
      onClick={onClick}
      onPointerDown={() => setDown(true)}
      onPointerUp={lift}
      onPointerCancel={lift}
      onPointerLeave={lift}
      className={`${pill(active)} ${
        down ? "brightness-125 ring-2 ring-[#7ec8e3]/80" : ""
      }`}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

const AtmosphereToggle = () => {
  const [sound, setSound] = useState(isAtmosphereOn);
  const [repeat, setRepeat] = useState(isRepeatOn);
  const [tour, setTour] = useState(isAutoScrollOn);
  const [hint, setHint] = useState(false);
  const [flashed, setFlashed] = useState(null);
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
      timers.current.push(setTimeout(() => setHint(false), 10000));
    };

    timers.current.push(setTimeout(raise, 2800));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const flash = (id) => {
    setFlashed(id);
    window.setTimeout(() => {
      setFlashed((now) => (now === id ? null : now));
    }, 420);
  };

  const hideHint = () => setHint(false);

  const muteAll = () => {
    hideHint();
    const next = toggleAtmosphere();
    setSound(next);
    if (!next) cutSpeech();
  };

  const restart = () => {
    hideHint();
    flash("restart");
    restartExperience();
  };

  return (
    <div
      className="fixed z-[65] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 [touch-action:manipulation] sm:max-w-none"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-[min(16.75rem,calc(100vw-2rem))]"
          >
            <div className="rounded-2xl border border-white/15 bg-[#16232f]/95 px-3 py-2.5 shadow-[0_18px_40px_-18px_rgba(13,23,32,0.9)] backdrop-blur-md">
              <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-[#7ec8e3]">
                Controls
              </p>
              <p className="mt-1 text-[12px] leading-snug text-white/80">
                Tap Restart to begin again. Tour walks the page. Repeat and
                Sound stay in this corner.
              </p>
            </div>
            <span className="absolute right-6 top-full h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-white/15 bg-[#16232f]/95" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
        <Control
          active={flashed === "restart"}
          data-experience-restart
          onClick={restart}
          title="Tap to restart the experience from the beginning"
          aria-label="Restart the experience from the first line"
        >
          <RotateCcw size={15} />
          <span className={tag}>Restart</span>
        </Control>
        <Control
          active={tour}
          data-auto-scroll
          onClick={() => {
            hideHint();
            setTour(toggleAutoScroll());
          }}
          title={tour ? "Stop page by page tour" : "Auto scroll, page by page"}
          aria-label={
            tour ? "Stop page by page tour" : "Auto scroll the site, page by page"
          }
          aria-pressed={tour}
        >
          <ChevronsDown size={16} />
          <span className={tag}>Tour</span>
        </Control>
        <Control
          active={repeat}
          onClick={() => {
            hideHint();
            setRepeat(toggleRepeat());
          }}
          title={repeat ? "Stop repeating Pixel" : "Repeat Pixel lines"}
          aria-label={repeat ? "Stop repeating Pixel" : "Repeat Pixel lines"}
          aria-pressed={repeat}
        >
          <Repeat size={15} />
          <span className={tag}>Repeat</span>
        </Control>
        <Control
          active={sound}
          data-sound-toggle
          onClick={muteAll}
          title={sound ? "Mute all sound" : "Unmute sound"}
          aria-label={
            sound ? "Mute all sound, including Pixel and Bit" : "Unmute sound"
          }
          aria-pressed={!sound}
        >
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className={tag}>{sound ? "Sound" : "Muted"}</span>
        </Control>
      </div>
    </div>
  );
};

export default AtmosphereToggle;
