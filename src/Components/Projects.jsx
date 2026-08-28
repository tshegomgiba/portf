import React from "react";
import { motion } from "framer-motion";
import { projects } from "../data/projects";
import { liveProjectCount, numberWord } from "../data/stats";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  const statusColor = (status) => {
    switch (status) {
      case "Live":
        return "bg-emerald-500";
      case "Completed":
        return "bg-[#7ec8e3]";
      case "In Progress":
        return "bg-amber-500";
      case "Coming Soon":
        return "bg-[#4a6076]";
      default:
        return "bg-[#4a6076]";
    }
  };

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-[#dfe8f1] px-5 py-16 md:px-6 md:py-28 lg:px-10"
    >
      <div className="pointer-events-none absolute inset-0 grain opacity-60" />
      <div className="pointer-events-none absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-[#7ec8e3]/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between"
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
          <p className="max-w-sm font-light text-[#4a6076] md:text-right">
            {numberWord(liveProjectCount)} live{" "}
            {liveProjectCount === 1 ? "build" : "builds"} spanning competitive
            gaming, professional services, and a personal passion project.
          </p>
        </motion.div>

        <div className="rule mb-14" />

        <div className="mx-auto grid max-w-5xl grid-cols-1 justify-items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-7 [perspective:1200px]">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              statusColor={statusColor(project.status)}
            />
          ))}
        </div>

        <motion.div
          className="mt-12 text-center md:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="mb-6 font-light text-[#4a6076]">
            Interested in collaborating?
          </p>
          <motion.a
            href="#contact"
            className="inline-block rounded-full bg-[#16232f] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2f7ea8]"
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
