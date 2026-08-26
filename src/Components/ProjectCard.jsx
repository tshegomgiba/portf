import React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { FiGithub, FiCode, FiExternalLink, FiStar } from "react-icons/fi";
import { openWatchedSite } from "../animation/openSite";

const TILT = 14;
const DEPTH = 8;
const REST_X = -0.14;
const REST_Y = 0.1;

const ProjectCard = ({ project, index, statusColor }) => {
  const reduced = useReducedMotion();
  const pointX = useMotionValue(REST_X);
  const pointY = useMotionValue(REST_Y);
  const settings = { stiffness: 240, damping: 22, mass: 0.55 };

  const rotateX = useSpring(useTransform(pointY, [-0.5, 0.5], [TILT, -TILT]), settings);
  const rotateY = useSpring(useTransform(pointX, [-0.5, 0.5], [-TILT, TILT]), settings);
  const sheenX = useTransform(pointX, [-0.5, 0.5], ["125%", "-25%"]);
  const sheenY = useTransform(pointY, [-0.5, 0.5], ["125%", "-25%"]);

  const track = (event) => {
    if (reduced || event.pointerType === "touch") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointX.set((event.clientX - box.left) / box.width - 0.5);
    pointY.set((event.clientY - box.top) / box.height - 0.5);
  };

  const reset = () => {
    pointX.set(REST_X);
    pointY.set(REST_Y);
  };

  return (
    <div
      className="relative w-72 max-w-full"
      style={{ perspective: 920, perspectiveOrigin: "50% 42%" }}
    >
      <motion.div
        data-pixel={project.title === "HiStakes" ? "deep" : undefined}
        className="group relative"
        style={
          reduced
            ? undefined
            : {
                rotateX,
                rotateY,
                transformPerspective: 920,
                transformStyle: "preserve-3d",
              }
        }
        onPointerMove={track}
        onPointerLeave={reset}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={reduced ? { y: -8, scale: 1.02 } : { scale: 1.03 }}
      >
        <span
          className="pointer-events-none absolute -inset-x-3 top-8 h-[88%] rounded-[2rem] bg-[#16232f]/30 blur-2xl"
          style={{ transform: "translateZ(-42px)" }}
        />

        {Array.from({ length: DEPTH }, (_, layer) => (
          <span
            key={layer}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              background:
                layer === DEPTH - 1
                  ? "#5a7186"
                  : `linear-gradient(180deg, #8aa0b6, #6d8498)`,
              transform: `translateZ(${-2.4 * (layer + 1)}px)`,
              opacity: 0.55 + layer * 0.05,
            }}
          />
        ))}

        <div
          className="relative ink-card ink-card-3d w-full overflow-hidden rounded-3xl"
          style={{ transform: "translateZ(16px)" }}
        >
          <motion.span
            className="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.58), transparent 58%)",
              backgroundPositionX: sheenX,
              backgroundPositionY: sheenY,
              backgroundSize: "170% 170%",
            }}
          />

          <div className="shine relative h-44 overflow-hidden">
            <img
              src={project.image}
              alt={`${project.title} screenshot`}
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16232f]/60 via-transparent to-[#16232f]/25" />

            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-[#16232f]/85 py-1.5 pl-2.5 pr-3 backdrop-blur-sm">
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
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#16232f]">
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

          <div className="p-6 pt-12">
            <h3 className="mb-2.5 font-display text-lg font-bold text-[#16232f] transition-colors group-hover:text-[#2f7ea8]">
              {project.title}
            </h3>
            <p className="mb-5 line-clamp-3 text-sm font-light leading-relaxed text-[#4a6076]">
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
                {project.link.includes("github.com") ? (
                  <>
                    <FiGithub className="h-4 w-4" />
                    View code
                  </>
                ) : (
                  <>
                    <FiExternalLink className="h-4 w-4" />
                    Visit site
                  </>
                )}
              </motion.a>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#4a6076]/70">
                <FiCode className="h-4 w-4" />
                Coming soon
              </span>
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
      </motion.div>
    </div>
  );
};

export default ProjectCard;
