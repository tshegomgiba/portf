import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "./journey";
import { getTalk } from "./dialogue";
import { hush, isRepeatOn, watchRepeat } from "./voice";
import { isAutoScrollOn } from "./autoScroll";

const HIRE = '[data-pixel="hire"], #contact button[type="submit"]';
const DEEP = '[data-pixel="deep"]';

/**
 * Drives Pixel's scenes from where the visitor is, how long they stay, and
 * whether they hover the hire path. Speech follows each beat.
 */
export const useCompanionTalk = ({
  sectionIndex = 0,
  enabled = true,
  paused = false,
} = {}) => {
  const [beat, setBeat] = useState(null);
  const lastAct = useRef(
    typeof performance === "undefined" ? 0 : performance.now()
  );
  const idleShown = useRef(false);
  const nextIdle = useRef(0);
  const prevSection = useRef(sectionIndex);
  const hireLock = useRef(0);

  const section = SECTIONS[sectionIndex]?.id ?? "top";

  useEffect(() => getTalk().on(setBeat), []);

  useEffect(() => {
    if (!enabled) return undefined;

    if (prevSection.current !== sectionIndex) {
      const was = SECTIONS[prevSection.current]?.id;
      if (was === "contact" && section !== "contact") getTalk().leftContact();
      prevSection.current = sectionIndex;
    }

    getTalk().enter(section, sectionIndex);
    idleShown.current = false;
    nextIdle.current = 0;
    if (section === "contact") lastAct.current = performance.now();
    return undefined;
  }, [section, sectionIndex, enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const bump = () => {
      lastAct.current = performance.now();
    };
    const acts = ["pointerdown", "wheel", "keydown", "touchstart", "click"];
    acts.forEach((act) => window.addEventListener(act, bump, { passive: true }));
    return () => acts.forEach((act) => window.removeEventListener(act, bump));
  }, [enabled]);

  useEffect(() => {
    if (!enabled || paused) return undefined;
    const started = performance.now();
    let repeating = isRepeatOn();
    const stopRepeat = watchRepeat((on) => {
      repeating = on;
    });

    const tick = window.setInterval(() => {
      const talk = getTalk();
      const now = performance.now();
      const touring = isAutoScrollOn();
      if (touring) return;

      const idle =
        repeating ||
        (document.hasFocus() &&
          now - lastAct.current > 8000 &&
          !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName));

      if (section !== "contact") talk.linger(section, (now - started) / 1000, false);

      if (!idle || talk.current?.tag === "Goodbye") {
        idleShown.current = false;
        nextIdle.current = 0;
        return;
      }

      if (!idleShown.current || now >= nextIdle.current) {
        idleShown.current = true;
        nextIdle.current = now + 12000;
        talk.idle();
      }
    }, 1600);

    return () => {
      clearInterval(tick);
      stopRepeat();
    };
  }, [section, enabled, paused]);

  useEffect(() => {
    if (!enabled || paused || section !== "contact") return undefined;

    let sent = false;
    const tick = window.setInterval(() => {
      const talk = getTalk();
      const form = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      const idleFor = performance.now() - lastAct.current;

      if (talk.current?.tag === "Goodbye") {
        if (form || idleFor < 280) {
          talk.hush();
          sent = false;
        }
        return;
      }

      if (sent) return;

      if (form || !document.hasFocus() || idleFor < 30000 || talk.busy) return;

      sent = true;
      talk.goodbye(() => {
        if (!sent) return;
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }, 400);

    return () => {
      clearInterval(tick);
      if (sent && getTalk().current?.tag === "Goodbye") getTalk().hush();
    };
  }, [section, enabled, paused]);

  useEffect(() => {
    if (!enabled || paused) return undefined;
    const talk = getTalk();
    let over = false;
    const bound = new Set();

    const enter = () => {
      const now = performance.now();
      if (now - hireLock.current < 2200) return;
      hireLock.current = now;
      over = true;
      talk.hire(true);
    };
    const leave = () => {
      if (!over) return;
      over = false;
      talk.hire(false);
    };
    const peek = () => talk.inspect();

    const bind = (selector, onEnter, onLeave) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (bound.has(el)) return;
        bound.add(el);
        el.addEventListener("pointerenter", onEnter);
        if (onLeave) el.addEventListener("pointerleave", onLeave);
      });
    };

    const attach = () => {
      bind(HIRE, enter, leave);
      bind(DEEP, peek);
    };

    attach();
    const root = document.getElementById("contact") || document.body;
    const watch = new MutationObserver(attach);
    watch.observe(root, { childList: true, subtree: true });

    return () => {
      watch.disconnect();
      bound.forEach((el) => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("pointerenter", peek);
      });
    };
  }, [enabled, paused]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onFocus = () => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        getTalk().hello();
      }
    };
    window.addEventListener("focusin", onFocus);
    return () => window.removeEventListener("focusin", onFocus);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (paused) {
      getTalk().hush();
      hush();
      return undefined;
    }
    return undefined;
  }, [paused, enabled]);

  return beat;
};
