import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { techStack } from "../../data/stack";
import TechTile from "./TechTile";

const TechSphere = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <motion.section
      id="stack"
      className="relative overflow-hidden bg-[#16232f]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Scrolling gradient band */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2f7ea8] via-[#7ec8e3] to-[#2f7ea8] opacity-[0.12] animate-loop-scroll pointer-events-none" />

      {/* Twinkle dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.15, 0.7, 0.15],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <motion.p
              className="eyebrow mb-4 text-[#7ec8e3]"
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              03 / Stack
            </motion.p>
            <motion.h2
              className="display-title text-4xl md:text-6xl text-white"
              initial={{ y: -40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Tools of
              <br />
              <span className="text-white/40">the trade</span>
            </motion.h2>
          </div>
          <motion.p
            className="text-white/55 font-light max-w-xs md:text-right"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Technologies I reach for when building products end to end.
          </motion.p>
        </div>

        <div className="h-px w-full bg-white/15 mb-8 md:mb-12" />

        {/* Four across leaves roughly 27px of room inside a tile on a 320px
            phone, which is not enough for a word like PostgreSQL. */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
          {techStack.map((tech, index) => (
            <TechTile key={tech.name} tech={tech} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TechSphere;
