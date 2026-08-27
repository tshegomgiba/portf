/**
 * Optional page-by-page tour. Each section is a stop. After a pause, it
 * moves to the next one. A real finger scroll turns it off. Programmatic
 * motion does not.
 */

import { SECTIONS } from "./journey";
import { getTalk } from "./dialogue";

const NAV = 72;
const MIN_STAY = 3500;
const REST = 2000;
const MAX_STAY = 26000;
const DRAG = 72;

const pages = () => SECTIONS.map(({ id }) => id);

let on = false;
let timer;
let motion;
let guided = false;
let guidedUntil = 0;
let lastAct = 0;
let at = 0;
let touchY = null;
let touchFromControls = false;
const listeners = new Set();

const tell = () => listeners.forEach((fn) => fn(on));

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const phone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

const viewH = () =>
  window.visualViewport?.height ?? window.innerHeight;

const navOffset = () => {
  const bar = document.querySelector("header");
  if (!bar) return NAV;
  return Math.max(NAV, Math.round(bar.getBoundingClientRect().height));
};

const onControls = (node) =>
  Boolean(
    node?.closest?.(
      "[data-auto-scroll], [data-experience-restart], [data-sound-toggle]"
    )
  );

const currentIndex = () => {
  const ids = pages();
  const focus = window.scrollY + viewH() * 0.32;
  let found = 0;
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (focus >= top - 24) found = i;
  });
  return found;
};

const cancelMotion = () => {
  if (motion) {
    cancelAnimationFrame(motion);
    motion = null;
  }
};

const settle = (ms) => {
  guided = true;
  guidedUntil = performance.now() + ms;
  window.setTimeout(() => {
    if (performance.now() >= guidedUntil - 16) guided = false;
  }, ms);
};

const animateScroll = (top, ms) => {
  cancelMotion();
  const from = window.scrollY;
  const start = performance.now();
  settle(ms + 280);
  const tick = (now) => {
    if (!on) {
      motion = null;
      return;
    }
    const t = Math.min(1, (now - start) / ms);
    const ease = 1 - (1 - t) ** 3;
    window.scrollTo(0, from + (top - from) * ease);
    if (t < 1) {
      motion = requestAnimationFrame(tick);
      return;
    }
    motion = null;
    guided = false;
  };
  motion = requestAnimationFrame(tick);
};

const goTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - navOffset()
  );
  const slow = phone();
  const ms = reduced() ? 0 : slow ? 920 : 700;

  if (ms === 0) {
    settle(200);
    window.scrollTo(0, top);
    guided = false;
  } else if (slow) {
    // iOS often drops window.scrollTo({ behavior: "smooth" }) after a tap.
    animateScroll(top, ms);
  } else {
    settle(ms + 400);
    window.scrollTo({ top, behavior: "smooth" });
    window.setTimeout(() => {
      guided = false;
    }, ms + 200);
  }

  window.setTimeout(() => {
    window.history.replaceState(null, "", `#${id}`);
  }, slow ? ms + 40 : 0);
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
  cancelMotion();
  guided = false;
  touchY = null;
  tell();
};

const step = () => {
  if (!on) return;
  const ids = pages();
  const next = at + 1;
  if (next >= ids.length) {
    stop();
    return;
  }
  at = next;
  goTo(ids[at]);
  schedule();
};

const bump = () => {
  lastAct = performance.now();
};

const schedule = () => {
  clear();
  const started = performance.now();
  lastAct = started;
  const wait = () => {
    if (!on) return;
    const now = performance.now();
    const elapsed = now - started;
    let busy = false;
    try {
      const talk = getTalk();
      busy = talk.busy || talk.starting || talk.waiting;
    } catch {
      busy = false;
    }
    if (busy) lastAct = now;
    else {
      try {
        if (getTalk().next()) {
          lastAct = now;
          timer = window.setTimeout(wait, 180);
          return;
        }
      } catch {
        /* talk may not be open yet */
      }
    }

    const quiet = now - lastAct;
    const ready = elapsed >= MIN_STAY && !busy && quiet >= REST;
    const overtime = elapsed >= MAX_STAY && !busy;
    if (ready || overtime) {
      step();
      return;
    }
    timer = window.setTimeout(wait, busy ? 280 : 180);
  };
  timer = window.setTimeout(wait, 180);
};

export const stopAutoScroll = () => {
  if (on) stop();
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
  at = currentIndex();
  const ids = pages();
  const begin = () => {
    if (!on) return;
    if (at >= ids.length - 1) {
      at = 0;
      goTo(ids[0]);
    }
    schedule();
  };

  // Let the tap that started the tour finish so iOS does not cancel the scroll.
  if (phone()) window.setTimeout(begin, 80);
  else begin();
  return true;
};

if (typeof window !== "undefined") {
  const interrupt = () => {
    if (!on || guided || performance.now() < guidedUntil) return;
    try {
      if (getTalk().waiting) return;
    } catch {
      /* talk may not be open yet */
    }
    stop();
  };

  window.addEventListener("wheel", interrupt, { passive: true });

  window.addEventListener(
    "touchstart",
    (event) => {
      touchFromControls = onControls(event.target);
      touchY = event.touches?.[0]?.clientY ?? null;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!on || touchFromControls) return;
      const y = event.touches?.[0]?.clientY;
      if (y == null || touchY == null) return;
      if (Math.abs(y - touchY) > DRAG) interrupt();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      touchY = null;
      touchFromControls = false;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchcancel",
    () => {
      touchY = null;
      touchFromControls = false;
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (onControls(event.target)) return;
      if (on && !guided) bump();
    },
    { passive: true }
  );

  window.addEventListener("keydown", (event) => {
    if (
      ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(
        event.key
      )
    ) {
      interrupt();
      return;
    }
    if (on) bump();
  });

  window.addEventListener("click", (event) => {
    if (onControls(event.target)) return;
    if (event.target?.closest?.("nav, a[href^='#']")) {
      interrupt();
      return;
    }
    if (on) bump();
  });
}
