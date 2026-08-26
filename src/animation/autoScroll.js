/**
 * Optional page-by-page tour. Each section is a stop. After a pause, it
 * moves to the next one. Manual scrolling turns it off so it never fights
 * the reader.
 */

import { SECTIONS } from "./journey";
import { getTalk } from "./dialogue";

const NAV = 72;
const DWELL = 9000;
const MAX_WAIT = 18000;

const pages = () => SECTIONS.map(({ id }) => id);

let on = false;
let timer;
let guided = false;
let guidedUntil = 0;
const listeners = new Set();

const tell = () => listeners.forEach((fn) => fn(on));

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const currentIndex = () => {
  const ids = pages();
  const focus = window.scrollY + window.innerHeight * 0.42;
  let at = 0;
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (focus >= top - 24) at = i;
  });
  return at;
};

const goTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV;
  guided = true;
  guidedUntil = performance.now() + 1400;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: reduced() ? "auto" : "smooth",
  });
  window.history.replaceState(null, "", `#${id}`);
};

const clear = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const stop = () => {
  on = false;
  clear();
  guided = false;
  tell();
};

const step = () => {
  if (!on) return;
  const ids = pages();
  const next = currentIndex() + 1;
  if (next >= ids.length) {
    stop();
    return;
  }
  goTo(ids[next]);
  schedule();
};

const schedule = () => {
  clear();
  const started = performance.now();
  const wait = () => {
    if (!on) return;
    const elapsed = performance.now() - started;
    let busy = false;
    try {
      busy = getTalk().busy;
    } catch {
      busy = false;
    }
    if (elapsed >= DWELL && (!busy || elapsed >= MAX_WAIT)) {
      step();
      return;
    }
    timer = window.setTimeout(wait, 420);
  };
  timer = window.setTimeout(wait, 420);
};

export const isAutoScrollOn = () => on;

export const watchAutoScroll = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const toggleAutoScroll = () => {
  if (on) {
    stop();
    return false;
  }

  on = true;
  tell();

  const ids = pages();
  if (currentIndex() >= ids.length - 1) goTo(ids[0]);
  schedule();
  return true;
};

if (typeof window !== "undefined") {
  const interrupt = () => {
    if (!on || guided || performance.now() < guidedUntil) return;
    stop();
  };

  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("touchstart", interrupt, { passive: true });
  window.addEventListener("pointerdown", (event) => {
    if (event.target?.closest?.("[data-auto-scroll]")) return;
    if (event.pointerType === "mouse" && event.button === 0) return;
    interrupt();
  }, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (
      ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(
        event.key
      )
    ) {
      interrupt();
    }
  });
  window.addEventListener("click", (event) => {
    if (event.target?.closest?.("[data-auto-scroll]")) return;
    if (event.target?.closest?.("nav, a[href^='#']")) interrupt();
  });
}
