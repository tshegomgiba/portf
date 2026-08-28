/**
 * Holds the page at the hero until Pixel finishes the opening line
 * "Keep scrolling and we'll follow you down."
 */

let locked = false;
let failsafe = 0;

const KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

const onControl = (node) =>
  Boolean(
    node?.closest?.(
      "[data-control-dock], [data-auto-scroll], [data-experience-restart], [data-sound-toggle], [data-repeat-toggle], button, a[href]:not([href^='#'])"
    )
  );

const freeze = () => {
  if (!locked) return;
  if (window.scrollY !== 0) window.scrollTo(0, 0);
};

const onWheel = (event) => {
  if (!locked) return;
  event.preventDefault();
};

const onTouchMove = (event) => {
  if (!locked) return;
  if (onControl(event.target)) return;
  event.preventDefault();
};

const onKey = (event) => {
  if (!locked) return;
  if (!KEYS.has(event.key)) return;
  if (event.key === " " && onControl(event.target)) return;
  event.preventDefault();
};

const onHashLink = (event) => {
  if (!locked) return;
  const link = event.target?.closest?.("a[href^='#']");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href === "#" || href === "#top") return;
  event.preventDefault();
};

const onHash = () => {
  if (!locked) return;
  if (window.location.hash && window.location.hash !== "#top") {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }
  window.scrollTo(0, 0);
};

export const isScrollLocked = () => locked;

export const lockScroll = () => {
  if (typeof window === "undefined") return;
  if (locked) return;
  locked = true;
  document.documentElement.classList.add("intro-lock");
  document.body.classList.add("intro-lock");
  window.scrollTo(0, 0);

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("keydown", onKey, { capture: true });
  window.addEventListener("scroll", freeze, { passive: true });
  window.addEventListener("click", onHashLink, true);
  window.addEventListener("hashchange", onHash);

  window.clearTimeout(failsafe);
  failsafe = window.setTimeout(unlockScroll, 28000);
};

export const unlockScroll = () => {
  if (typeof window === "undefined") return;
  if (!locked) return;
  locked = false;
  window.clearTimeout(failsafe);
  failsafe = 0;
  document.documentElement.classList.remove("intro-lock");
  document.body.classList.remove("intro-lock");

  window.removeEventListener("wheel", onWheel);
  window.removeEventListener("touchmove", onTouchMove);
  window.removeEventListener("keydown", onKey, { capture: true });
  window.removeEventListener("scroll", freeze);
  window.removeEventListener("click", onHashLink, true);
  window.removeEventListener("hashchange", onHash);
};
