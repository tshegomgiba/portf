import { useMemo } from "react";

const SnowEffect = () => {
  const flakes = useMemo(() => {
    if (typeof window === "undefined") return [];
    const phone = window.innerWidth < 768;
    const count = phone ? 18 : 56;
    return Array.from({ length: count }, (_, id) => ({
      id,
      left: `${Math.random() * 100}%`,
      size: phone ? 2 + Math.random() * 2.4 : 2 + Math.random() * 4,
      duration: 11 + Math.random() * 14,
      delay: -(Math.random() * 16),
      opacity: 0.28 + Math.random() * 0.4,
      drift: `${(Math.random() * 48 - 24).toFixed(1)}px`,
    }));
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
