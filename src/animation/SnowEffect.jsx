import { useEffect, useState } from 'react';

const SnowEffect = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const createFlake = (id) => ({
      id,
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.35,
      drift: Math.random() * 2 - 1,
    });

    const initialSnowflakes = [];
    for (let i = 0; i < 100; i++) {
      initialSnowflakes.push({
        ...createFlake(i),
        y: Math.random() * window.innerHeight,
      });
    }
    setSnowflakes(initialSnowflakes);

    const animateSnow = () => {
      setSnowflakes(prevSnowflakes =>
        prevSnowflakes.map(snowflake => {
          let newY = snowflake.y + snowflake.speed;
          let newX = snowflake.x + snowflake.drift * 0.3;

          if (newY > window.innerHeight + 10) {
            return {
              ...snowflake,
              y: -10,
              x: Math.random() * window.innerWidth,
            };
          }

          if (newX < -10) newX = window.innerWidth + 10;
          if (newX > window.innerWidth + 10) newX = -10;

          return {
            ...snowflake,
            y: newY,
            x: newX,
          };
        })
      );
    };

    const interval = setInterval(animateSnow, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map(snowflake => (
          <div
            key={snowflake.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${snowflake.x}px`,
              top: `${snowflake.y}px`,
              width: `${snowflake.size}px`,
              height: `${snowflake.size}px`,
              opacity: snowflake.opacity,
              boxShadow: '0 0 5px rgba(47, 126, 168, 0.55), 0 0 3px rgba(255, 255, 255, 0.9)',
              filter: 'blur(0.4px)',
            }}
          />
        ))}
      </div>
    </>
  );
};

export default SnowEffect;
