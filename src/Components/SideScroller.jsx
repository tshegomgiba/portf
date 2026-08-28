import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { isScrollLocked } from "../animation/scrollLock";

const STOPS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "projects", label: "Work" },
  { id: "contact", label: "Contact" },
];

const NAV_OFFSET = 72;

const maxScroll = () =>
  Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );

const SideScroller = () => {
  const trackRef = useRef(null);
  const drag = useRef(false);
  const [progress, setProgress] = useState(0);
  const [thumb, setThumb] = useState(0.18);
  const [marks, setMarks] = useState([]);
  const [active, setActive] = useState("top");
  const [hint, setHint] = useState("");

  const measure = () => {
    const max = maxScroll();
    const page = document.documentElement.scrollHeight || 1;
    const view = window.innerHeight || 1;
    setProgress(max <= 0 ? 0 : window.scrollY / max);
    setThumb(Math.min(0.45, Math.max(0.14, view / page)));
    setMarks(
      STOPS.map((stop) => {
        const node = document.getElementById(stop.id);
        if (!node) return { ...stop, at: 0 };
        const top = node.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        return {
          ...stop,
          at: max <= 0 ? 0 : Math.min(1, Math.max(0, top / max)),
        };
      })
    );
  };

  useEffect(() => {
    measure();
    const onScroll = () => {
      const max = maxScroll();
      setProgress(max <= 0 ? 0 : window.scrollY / max);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    const later = window.setTimeout(measure, 400);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.clearTimeout(later);
    };
  }, []);

  const goRatio = (ratio, smooth) => {
    if (isScrollLocked()) return;
    const next = Math.min(1, Math.max(0, ratio));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: next * maxScroll(),
      behavior: smooth && !reduced ? "smooth" : "auto",
    });
  };

  const goSection = (id) => {
    if (isScrollLocked() && id !== "top") return;
    const node = document.getElementById(id);
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = node.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: reduced ? "auto" : "smooth",
    });
    window.history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  const ratioFromEvent = (clientY) => {
    const box = trackRef.current?.getBoundingClientRect();
    if (!box) return 0;
    const pad = box.height * thumb * 0.5;
    const span = Math.max(1, box.height - pad * 2);
    return (clientY - box.top - pad) / span;
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    if (isScrollLocked()) return;
    drag.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    goRatio(ratioFromEvent(event.clientY), false);
  };

  const onPointerMove = (event) => {
    if (!drag.current) return;
    goRatio(ratioFromEvent(event.clientY), false);
  };

  const onPointerUp = () => {
    drag.current = false;
  };

  useEffect(() => {
    const seen = new Set();
    const spotter = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        });
        const top = STOPS.map(({ id }) => id).filter((id) => seen.has(id)).pop();
        if (top) setActive(top);
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    STOPS.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) spotter.observe(node);
    });
    return () => spotter.disconnect();
  }, []);

  return (
    <div
      className="side-scroller pointer-events-none fixed top-1/2 z-[58] hidden -translate-y-[58%] flex-col items-center md:flex"
      style={{ right: "max(0.7rem, env(safe-area-inset-right))" }}
      aria-hidden="false"
    >
      <div
        ref={trackRef}
        role="scrollbar"
        aria-label="Page scroll"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") goRatio(progress + 0.08, true);
          if (event.key === "ArrowUp") goRatio(progress - 0.08, true);
          if (event.key === "Home") goSection("top");
          if (event.key === "End") goSection("contact");
        }}
        className="pointer-events-auto relative h-[38vh] w-3 cursor-pointer touch-none rounded-full border border-white/20 bg-[#16232f]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-2 rounded-t-full bg-gradient-to-b from-white/80 to-transparent" />

        <motion.span
          className="pointer-events-none absolute left-1/2 w-[7px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#b8e0f0] via-[#7ec8e3] to-[#2f7ea8] shadow-[0_0_14px_rgba(126,200,227,0.85)]"
          style={{
            height: `${thumb * 100}%`,
            top: `${progress * (1 - thumb) * 100}%`,
          }}
        />

        {marks.map((mark) => (
          <button
            key={mark.id}
            type="button"
            aria-label={mark.label}
            aria-current={active === mark.id ? "true" : undefined}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => goSection(mark.id)}
            onMouseEnter={() => setHint(mark.label)}
            onMouseLeave={() => setHint("")}
            className="absolute left-1/2 z-10 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ top: `${mark.at * 100}%` }}
          >
            <span
              className={`block rounded-full border transition-all duration-200 ${
                active === mark.id
                  ? "h-2.5 w-2.5 border-white bg-[#7ec8e3] shadow-[0_0_10px_rgba(126,200,227,0.95)]"
                  : "h-1.5 w-1.5 border-white/50 bg-[#16232f]/80"
              }`}
            />
          </button>
        ))}
      </div>

      <span
        className={`pointer-events-none mt-3 font-display text-[9px] font-bold uppercase tracking-[0.2em] text-[#2f7ea8] transition-opacity duration-200 ${
          hint ? "opacity-100" : "opacity-0"
        }`}
      >
        {hint || "Home"}
      </span>
    </div>
  );
};

export default SideScroller;
