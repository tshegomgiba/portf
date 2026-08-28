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

const Control = ({ active, onClick, children, ...rest }) => {
  const action = useRef(onClick);
  action.current = onClick;
  const last = useRef(0);
  const [down, setDown] = useState(false);

  const fire = (event) => {
    event.stopPropagation();
    if (event.type === "pointerup") {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      ) {
        return;
      }
    }
    const now = performance.now();
    if (now - last.current < 280) return;
    last.current = now;
    action.current();
  };

  return (
    <button
      type="button"
      onClick={fire}
      onPointerUp={fire}
      onPointerDown={() => setDown(true)}
      onPointerCancel={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      className={`control-hit${active ? " is-on" : ""}${down ? " is-down" : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
};

const AtmosphereToggle = () => {
  const [sound, setSound] = useState(isAtmosphereOn);
  const [repeat, setRepeat] = useState(isRepeatOn);
  const [tour, setTour] = useState(isAutoScrollOn);
  const [hint, setHint] = useState(false);
  const [flashed, setFlashed] = useState(null);
  const [typing, setTyping] = useState(false);
  const said = useRef(false);
  const timers = useRef([]);

  useEffect(() => watchAtmosphere(setSound), []);
  useEffect(() => watchRepeat(setRepeat), []);
  useEffect(() => watchAutoScroll(setTour), []);

  useEffect(() => {
    const check = () =>
      setTyping(["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName));
    window.addEventListener("focusin", check);
    window.addEventListener("focusout", check);
    return () => {
      window.removeEventListener("focusin", check);
      window.removeEventListener("focusout", check);
    };
  }, []);

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
    <nav
      data-control-dock
      aria-label="Experience controls"
      className={`control-dock${typing ? " is-away" : ""}`}
      style={{
        left: "max(0.65rem, env(safe-area-inset-left))",
        right: "max(0.65rem, env(safe-area-inset-right))",
        bottom: "max(0.45rem, env(safe-area-inset-bottom))",
      }}
    >
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="control-hint"
          >
            <div className="rounded-2xl border border-white/15 bg-[#16232f]/95 px-3 py-2.5 shadow-[0_18px_40px_-18px_rgba(13,23,32,0.9)] backdrop-blur-md">
              <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-[#7ec8e3]">
                Controls
              </p>
              <p className="mt-1 text-[12px] leading-snug text-white/80">
                Restart begins again. Tour walks the page. Repeat and Sound
                stay here.
              </p>
            </div>
            <span className="control-hint-arrow" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="control-rail" role="toolbar" aria-label="Playback">
        <Control
          active={flashed === "restart"}
          data-experience-restart
          onClick={restart}
          title="Tap to restart the experience from the beginning"
          aria-label="Restart the experience from the first line"
        >
          <RotateCcw size={15} />
          <span className="control-tag">Restart</span>
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
          <span className="control-tag">Tour</span>
        </Control>
        <Control
          active={repeat}
          data-repeat-toggle
          onClick={() => {
            hideHint();
            setRepeat(toggleRepeat());
          }}
          title={repeat ? "Stop repeating Pixel" : "Repeat Pixel lines"}
          aria-label={repeat ? "Stop repeating Pixel" : "Repeat Pixel lines"}
          aria-pressed={repeat}
        >
          <Repeat size={15} />
          <span className="control-tag">Repeat</span>
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
          <span className="control-tag">{sound ? "Sound" : "Muted"}</span>
        </Control>
      </div>
    </nav>
  );
};

export default AtmosphereToggle;
