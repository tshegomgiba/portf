import React, { useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiCode, FiExternalLink, FiStar } from "react-icons/fi";
import { openWatchedSite } from "../animation/openSite";

const TILT = 12;

const ProjectCard = ({ project, index, statusColor }) => {
  const skipTilt = useMemo(() => {
    if (typeof window === "undefined") return true;
    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    );
  }, []);

  const pointX = useMotionValue(0);
  const pointY = useMotionValue(0);
  const settings = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(
    useTransform(pointY, [-0.5, 0.5], [TILT, -TILT]),
    settings
  );
  const rotateY = useSpring(
    useTransform(pointX, [-0.5, 0.5], [-TILT, TILT]),
    settings
  );
  const sheenX = useTransform(pointX, [-0.5, 0.5], ["110%", "-10%"]);
  const sheenY = useTransform(pointY, [-0.5, 0.5], ["110%", "-10%"]);

  const track = (event) => {
    if (skipTilt) return;
    const box = event.currentTarget.getBoundingClientRect();
    pointX.set((event.clientX - box.left) / box.width - 0.5);
    pointY.set((event.clientY - box.top) / box.height - 0.5);
  };

  const reset = () => {
    pointX.set(0);
    pointY.set(0);
  };

  return (
    <motion.div
      data-pixel={project.title === "HiStakes" ? "deep" : undefined}
      className="group relative w-72 max-w-full"
      style={{ perspective: 920 }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <motion.div
        className="relative"
        style={{
          rotateX: skipTilt ? 0 : rotateX,
          rotateY: skipTilt ? 0 : rotateY,
          transformPerspective: 920,
          transformStyle: "preserve-3d",
        }}
        onPointerMove={track}
        onPointerLeave={reset}
        whileHover={skipTilt ? { y: -6 } : { y: -10 }}
      >
        <span
          className="pointer-events-none absolute inset-x-3 top-8 bottom-0 rounded-[1.75rem] bg-[#16232f]/30 opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-75"
          style={{ transform: "translateZ(-36px)" }}
        />

        <div
          className="relative ink-card w-full rounded-3xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.span
            className="pointer-events-none absolute inset-0 z-30 rounded-3xl opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.7), transparent 58%)",
              backgroundPositionX: sheenX,
              backgroundPositionY: sheenY,
              backgroundSize: "160% 160%",
              transform: "translateZ(48px)",
            }}
          />

          <div
            className="shine relative h-44 overflow-hidden rounded-t-3xl"
            style={{ transform: "translateZ(18px)" }}
          >
            <img
              src={project.image}
              alt={`${project.title} screenshot`}
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16232f]/60 via-transparent to-[#16232f]/25" />

            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-[#16232f]/85 py-1.5 pl-2.5 pr-3 backdrop-blur-sm">
              <span className="relative flex items-center justify-center">
                <span
                  className={`absolute h-2.5 w-2.5 rounded-full opacity-60 animate-ping ${statusColor}`}
                />
                <span className={`relative h-1.5 w-1.5 rounded-full ${statusColor}`} />
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-white">
                {project.status}
              </span>
            </div>

            {project.featured && (
              <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#16232f]">
                <FiStar className="h-3 w-3 text-[#2f7ea8]" />
                Featured
              </div>
            )}

            <span className="absolute bottom-4 right-4 z-10 font-display text-xs font-bold text-white/60">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {project.link && (
                <motion.a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) =>
                    openWatchedSite(event, project.link, project.title)
                  }
                  className="rounded-full bg-white p-3 text-[#16232f] shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiExternalLink className="h-4 w-4" />
                </motion.a>
              )}
            </div>
          </div>

          <motion.div
            className="absolute left-5 top-[9.5rem] z-20 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/95 p-2.5 shadow-[0_12px_28px_-14px_rgba(22,35,47,0.6)]"
            style={{ transform: "translateZ(42px)" }}
            whileHover={{ scale: 1.08, rotate: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <img
              src={project.logo}
              alt={`${project.title} logo`}
              className="h-full w-full object-contain"
            />
          </motion.div>

          <div className="p-6 pt-12" style={{ transform: "translateZ(22px)" }}>
            <h3 className="mb-2.5 font-display text-lg font-bold text-[#16232f] transition-colors group-hover:text-[#2f7ea8]">
              {project.title}
            </h3>
            <p className="mb-5 text-sm font-light leading-relaxed text-[#4a6076]">
              {project.description}
            </p>

            <div className="mb-5 flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[#16232f]/15 px-2.5 py-1 text-[10px] font-medium text-[#4a6076]"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="rounded-full border border-[#16232f]/15 px-2.5 py-1 text-[10px] font-medium text-[#4a6076]">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>

            {project.link ? (
              <motion.a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) =>
                  openWatchedSite(event, project.link, project.title)
                }
                className="inline-flex items-center gap-2 border-b-2 border-[#2f7ea8] pb-0.5 text-sm font-semibold text-[#16232f] transition-colors hover:text-[#2f7ea8]"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiExternalLink className="h-4 w-4" />
                Visit site
              </motion.a>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#4a6076]/70">
                <FiCode className="h-4 w-4" />
                Coming soon
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard;
