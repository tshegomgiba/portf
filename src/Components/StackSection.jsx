import React, { useEffect, useRef } from "react";

const MOBILE = "(max-width: 767px)";

let screen = 0;

const screenHeight = () => {
  if (screen) return screen;

  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;left:0;right:0;top:0;height:100svh;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  screen = probe.getBoundingClientRect().height || document.documentElement.clientHeight;
  probe.remove();
  return screen;
};

/**
 * Wraps a section so the next one slides up and covers it.
 *
 * Desktop keeps the original hold: the panel sticks to the bottom of its own
 * slot, a spacer gives it room, and the next slot is pulled up by the same
 * amount. Each slot is its own containing block, so a panel can only stay
 * held inside its own stretch of the page.
 *
 * On a phone the slot itself is sticky against the top of the screen, with
 * each one painted above the last. That is the stacked-card effect. `--pin`
 * is 0 for a screen-tall section (it holds at once) and a negative offset
 * for a taller one (you can read it first, then the last screenful holds
 * while the next card climbs over it). That offset is a measured height, not
 * a scroll listener.
 */
const StackSection = ({ children, index = 0, last = false }) => {
  const slot = useRef(null);

  useEffect(() => {
    const el = slot.current;
    if (!el) return undefined;

    const apply = () => {
      if (!window.matchMedia(MOBILE).matches) {
        el.style.removeProperty("--pin");
        return;
      }

      const view = screenHeight();
      const pin = Math.min(0, Math.round(view - el.offsetHeight));
      el.style.setProperty("--pin", `${pin}px`);
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);

    const onResize = () => {
      screen = 0;
      apply();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return (
    <div ref={slot} className="stack-slot" style={{ zIndex: index + 1 }}>
      <div className="stack-panel">{children}</div>
      {!last && <div className="stack-spacer" aria-hidden="true" />}
    </div>
  );
};

export default StackSection;
