import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const CountUp = ({
  to,
  from = 0,
  duration = 1.4,
  delay = 0,
  suffix = "",
  className = "",
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!inView) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setValue(to);
      return;
    }

    let frame;
    let start;

    const tick = (now) => {
      if (start === undefined) start = now;
      const progress = Math.min((now - start) / (duration * 1000), 1);
      setValue(Math.round(from + (to - from) * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [inView, from, to, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
};

export default CountUp;
