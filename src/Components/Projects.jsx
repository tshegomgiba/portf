import React from "react";
import { motion } from "framer-motion";
import { FiGithub, FiCode, FiExternalLink, FiStar } from "react-icons/fi";
import { projects } from "../data/projects";
import { liveProjectCount, numberWord } from "../data/stats";
import { openWatchedSite } from "../animation/openSite";

const Projects = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Live": return "bg-emerald-500";
      case "Completed": return "bg-[#7ec8e3]";
      case "In Progress": return "bg-amber-500";
      case "Coming Soon": return "bg-[#4a6076]";
      default: return "bg-[#4a6076]";
    }
  };

  return (
    <section
      id="projects"
      className="relative py-16 md:py-28 px-5 md:px-6 lg:px-10 overflow-hidden bg-[#dfe8f1]"
    >
      <div className="absolute inset-0 grain opacity-60 pointer-events-none" />
      <div className="absolute top-40 right-0 w-[28rem] h-[28rem] rounded-full bg-[#7ec8e3]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <p className="eyebrow mb-4">04 / Work</p>
            <h2 className="display-title text-4xl md:text-6xl">
              Selected
              <br />
              <span className="text-[#2f7ea8]">projects</span>
            </h2>
          </div>
          <p className="text-[#4a6076] font-light max-w-sm md:text-right">
            {numberWord(liveProjectCount)} live{" "}
            {liveProjectCount === 1 ? "build" : "builds"} spanning competitive
            gaming, professional services, and a personal passion project.
          </p>
        </motion.div>

        <div className="rule mb-14" />

        {/* Cards are wide enough to sit three across on a desktop, and capped
            to the row so a 320px phone shrinks one instead of clipping it. */}
        <div className="flex flex-wrap justify-center gap-5 md:gap-7">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              data-pixel={project.title === "HiStakes" ? "deep" : undefined}
              className="relative group w-72 max-w-full"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="relative ink-card w-full rounded-3xl overflow-hidden">
                <div className="shine relative h-44 overflow-hidden">
                  <img
                    src={project.image}
                    alt={`${project.title} screenshot`}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16232f]/60 via-transparent to-[#16232f]/25" />

                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#16232f]/85 backdrop-blur-sm rounded-full pl-2.5 pr-3 py-1.5">
                    <span className="relative flex items-center justify-center">
                      <span className={`absolute w-2.5 h-2.5 rounded-full opacity-60 animate-ping ${getStatusColor(project.status)}`} />
                      <span className={`relative w-1.5 h-1.5 rounded-full ${getStatusColor(project.status)}`} />
                    </span>
                    <span className="text-[11px] text-white font-semibold tracking-wide">
                      {project.status}
                    </span>
                  </div>

                  {project.featured && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/95 text-[#16232f] px-2.5 py-1 rounded-full text-[10px] font-semibold">
                      <FiStar className="w-3 h-3 text-[#2f7ea8]" />
                      Featured
                    </div>
                  )}

                  <span className="absolute bottom-4 right-4 z-10 font-display text-xs font-bold text-white/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.link && (
                      <motion.a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) =>
                          openWatchedSite(event, project.link, project.title)
                        }
                        className="p-3 bg-white rounded-full text-[#16232f] shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Brand mark straddling the image edge */}
                <motion.div
                  className="absolute top-[9.5rem] left-5 z-20 w-16 h-16 rounded-2xl bg-white/95 border border-white/70 shadow-[0_12px_28px_-14px_rgba(22,35,47,0.6)] flex items-center justify-center p-2.5"
                  whileHover={{ scale: 1.08, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <img
                    src={project.logo}
                    alt={`${project.title} logo`}
                    className="w-full h-full object-contain"
                  />
                </motion.div>

                <div className="p-6 pt-12">
                  <h3 className="font-display text-lg font-bold text-[#16232f] mb-2.5 group-hover:text-[#2f7ea8] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-[#4a6076] text-sm leading-relaxed mb-5 line-clamp-3 font-light">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium text-[#4a6076] border border-[#16232f]/15"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-[#4a6076] border border-[#16232f]/15">
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
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#16232f] border-b-2 border-[#2f7ea8] pb-0.5 hover:text-[#2f7ea8] transition-colors"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {project.link.includes("github.com") ? (
                        <>
                          <FiGithub className="w-4 h-4" />
                          View code
                        </>
                      ) : (
                        <>
                          <FiExternalLink className="w-4 h-4" />
                          Visit site
                        </>
                      )}
                    </motion.a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#4a6076]/70">
                      <FiCode className="w-4 h-4" />
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12 md:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-[#4a6076] mb-6 font-light">
            Interested in collaborating?
          </p>
          <motion.a
            href="#contact"
            className="inline-block px-8 py-3.5 bg-[#16232f] text-white rounded-full text-sm font-semibold hover:bg-[#2f7ea8] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Let's work together
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
