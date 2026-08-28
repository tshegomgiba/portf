import { useEffect, useMemo } from "react";

const SnowEffect = () => {
  const flakes = useMemo(() => {
    if (typeof window === "undefined") return [];
    const phone = window.innerWidth < 768;
    const count = phone ? 8 : 56;
    return Array.from({ length: count }, (_, id) => ({
      id,
      left: `${Math.random() * 100}%`,
      size: phone ? 2 + Math.random() * 2 : 2 + Math.random() * 4,
      duration: 11 + Math.random() * 14,
      delay: -(Math.random() * 16),
      opacity: 0.28 + Math.random() * 0.4,
      drift: `${(Math.random() * 48 - 24).toFixed(1)}px`,
    }));
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
          className="snow-flake"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            "--drift": flake.drift,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default SnowEffect;
