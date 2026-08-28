import { useEffect, useMemo } from "react";

const SnowEffect = () => {
  const flakes = useMemo(() => {
    if (typeof window === "undefined") return [];
    const phone = window.innerWidth < 768;
    const falling = phone ? 7 : 32;
    const landing = phone ? 14 : 40;
    const make = (id, settle) => ({
      id,
      settle,
      left: `${Math.random() * 100}%`,
      size: phone ? 2 + Math.random() * 2.4 : 2 + Math.random() * 4.2,
      duration: settle ? 8 + Math.random() * 7 : 11 + Math.random() * 14,
      delay: settle ? Math.random() * 10 : -(Math.random() * 16),
      opacity: 0.3 + Math.random() * 0.45,
      drift: `${(Math.random() * 48 - 24).toFixed(1)}px`,
      rest: `${4 + Math.random() * 16}px`,
    });
    return [
      ...Array.from({ length: falling }, (_, id) => make(`fall-${id}`, false)),
      ...Array.from({ length: landing }, (_, id) => make(`land-${id}`, true)),
    ];
  }, []);

  useEffect(() => {
    const layer = document.querySelector(".snow-layer");
    if (!layer) return undefined;
    let rest;
    const hush = () => {
      layer.classList.add("is-scrolling");
      window.clearTimeout(rest);
      rest = window.setTimeout(() => layer.classList.remove("is-scrolling"), 140);
    };
    window.addEventListener("scroll", hush, { passive: true });
    return () => {
      window.clearTimeout(rest);
      window.removeEventListener("scroll", hush);
    };
  }, []);

  return (
    <div className="snow-layer" aria-hidden="true">
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className={`snow-flake${flake.settle ? " snow-flake-settle" : ""}`}
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            "--drift": flake.drift,
            "--rest": flake.rest,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default SnowEffect;
