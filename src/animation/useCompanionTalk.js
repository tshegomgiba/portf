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
  lite = false,
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
      if (touring || talk.waiting) return;

      const idle =
        repeating ||
        (document.hasFocus() &&
          now - lastAct.current > (lite ? 14000 : 8000) &&
          !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName));

      if (section !== "contact") talk.linger(section, (now - started) / 1000, false);

      if (!idle || talk.current?.tag === "Goodbye") {
        idleShown.current = false;
        nextIdle.current = 0;
        return;
      }

      if (!idleShown.current || now >= nextIdle.current) {
        idleShown.current = true;
        nextIdle.current = now + (lite ? 16000 : 12000);
        talk.idle();
      }
    }, lite ? 2400 : 1600);

    return () => {
      clearInterval(tick);
      stopRepeat();
    };
  }, [section, enabled, paused, lite]);

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
    }, lite ? 900 : 400);

    return () => {
      clearInterval(tick);
      if (sent && getTalk().current?.tag === "Goodbye") getTalk().hush();
    };
  }, [section, enabled, paused, lite]);

  useEffect(() => {
    if (!enabled || paused) return undefined;
    const talk = getTalk();
    let over = false;
    const bound = [];

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
    const peek = (event) => {
      if (event?.target?.closest?.("a, button")) return;
      talk.inspect();
    };

    const listen = (el, type, fn) => {
      el.addEventListener(type, fn);
      bound.push([el, type, fn]);
    };

    const seen = new Set();
    const attach = () => {
      document.querySelectorAll(HIRE).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (lite) listen(el, "click", enter);
        else {
          listen(el, "pointerenter", enter);
          listen(el, "pointerleave", leave);
        }
      });
      document.querySelectorAll(DEEP).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        listen(el, lite ? "click" : "pointerenter", peek);
      });
    };

    attach();
    const roots = lite
      ? ["projects", "contact"].map((id) => document.getElementById(id)).filter(Boolean)
      : [document.getElementById("contact") || document.body];
    const watchers = roots.map((root) => {
      const watch = new MutationObserver(attach);
      watch.observe(root, { childList: true, subtree: true });
      return watch;
    });

    return () => {
      watchers.forEach((watch) => watch.disconnect());
      bound.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
    };
  }, [enabled, paused, lite]);

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
