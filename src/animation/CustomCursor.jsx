import { useEffect, useRef, useState } from "react";

const LINK_TARGETS = "a, button, [role='button'], summary, label[for]";
const TEXT_TARGETS = "input, textarea, [contenteditable='true']";

const CustomCursor = () => {
  const dot = useRef(null);
  const ring = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Trackpads and mice only. Touch screens keep their native behaviour.
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    setActive(true);
    document.documentElement.classList.add("cursor-hidden");

    const aim = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const lag = { ...aim };
    let frame;
    let press = 1;

    const move = (event) => {
      aim.x = event.clientX;
      aim.y = event.clientY;

      const target = event.target;
      if (!ring.current || !target?.closest) return;

      ring.current.classList.toggle("is-link", !!target.closest(LINK_TARGETS));
      ring.current.classList.toggle("is-text", !!target.closest(TEXT_TARGETS));
    };

    const down = () => {
      press = 0.7;
    };
    const up = () => {
      press = 1;
    };
    const leave = () => {
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
    };
    const enter = () => {
      if (dot.current) dot.current.style.opacity = "1";
      if (ring.current) ring.current.style.opacity = "1";
    };

    const render = () => {
      // The ring trails the dot, which gives the cursor a sense of weight.
      lag.x += (aim.x - lag.x) * 0.18;
      lag.y += (aim.y - lag.y) * 0.18;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${aim.x}px, ${aim.y}px, 0)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0) scale(${press})`;
      }

      frame = requestAnimationFrame(render);
    };

    render();

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("cursor-hidden");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, []);

  if (!active) return null;

  return (
    <>
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </>
  );
};

export default CustomCursor;
