import React, { useEffect, useRef, useState } from "react";

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
  const started = useRef(false);
  const [value, setValue] = useState(from);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    started.current = false;
    setValue(from);

    let frame;
    let timer;

    const play = () => {
      if (started.current) return;
      started.current = true;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setValue(to);
        return;
      }

      let start;
      const tick = (now) => {
        if (start === undefined) start = now;
        const progress = Math.min((now - start) / (duration * 1000), 1);
        setValue(Math.round(from + (to - from) * easeOutCubic(progress)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };

      timer = setTimeout(() => {
        frame = requestAnimationFrame(tick);
      }, delay * 1000);
    };

    const visible = () => {
      const rect = el.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    if (visible()) play();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [from, to, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
};

export default CountUp;
