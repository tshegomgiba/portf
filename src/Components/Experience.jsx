import React, { useEffect, useState } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, GraduationCap, Award, ExternalLink } from "lucide-react";
import {
  timeline,
  entries,
  education,
  certifications,
} from "../data/experience";
import { openWatchedSite } from "../animation/openSite";

const Experience = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: true,
      disable: () => window.matchMedia("(max-width: 767px)").matches,
    });
  }, []);

  const current = entries[active];

  return (
    <section
      id="experience"
      className="relative py-16 md:py-28 px-5 md:px-6 lg:px-10 overflow-hidden bg-[#cfdcea]"
    >
      <div className="absolute inset-0 grain opacity-60 pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#7ec8e3]/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <p className="eyebrow mb-4">02 / Experience</p>
            <h2 className="display-title text-4xl md:text-6xl">
              Where I've
              <br />
              <span className="text-[#2f7ea8]">worked</span>
            </h2>
          </div>
          <p className="text-[#4a6076] font-light max-w-sm md:text-right">
            Internships and rotations across full stack development, CRM
            automation, and WordPress delivery.
          </p>
        </motion.div>

        <div className="rule mb-14" />

        {/* Company switcher */}
        <div className="grid lg:grid-cols-[19rem_1fr] gap-8">
          {/* Selector rail */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {timeline.map((group) => (
              <div key={group.heading}>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-3.5 h-3.5 text-[#2f7ea8]" />
                  <p className="font-display text-[11px] tracking-[0.18em] uppercase font-bold text-[#4a6076]">
                    {group.heading}
                  </p>
                </div>
                <p className="text-[11px] text-[#2f7ea8] font-semibold mb-3 pl-[1.375rem]">
                  {group.period}
                  {group.roles.length > 1 && ` · ${group.roles.length} companies`}
                </p>

                <div className="space-y-2">
                  {group.roles.map((role) => {
                    const index = entries.findIndex(
                      (entry) => entry.company === role.company
                    );
                    const isActive = index === active;

                    return (
                      <motion.div
                        key={role.company}
                        className={`relative w-full flex items-center gap-3 p-3 rounded-2xl ${
                          isActive
                            ? "bg-[#16232f] border border-[#16232f]"
                            : "frost-tile"
                        }`}
                        whileHover={{ x: isActive ? 0 : 4 }}
                        transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      >
                        <button
                          type="button"
                          onClick={() => setActive(index)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span
                            className={`flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 p-2 ${
                              role.lightLogo
                                ? isActive
                                  ? "bg-white/10 border border-white/20"
                                  : "bg-[#16232f]"
                                : "bg-white/90 border border-white/60"
                            }`}
                          >
                            <img
                              src={role.logo}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block font-display text-sm font-bold leading-snug ${
                                isActive ? "text-white" : "text-[#16232f]"
                              }`}
                            >
                              {role.company}
                            </span>
                            <span
                              className={`block text-[11px] mt-0.5 truncate ${
                                isActive ? "text-[#b8e0f0]" : "text-[#4a6076]"
                              }`}
                            >
                              {role.period}
                            </span>
                          </span>
                        </button>
                        {role.url && (
                          <a
                            href={role.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) =>
                              openWatchedSite(event, role.url, role.company)
                            }
                            aria-label={`Open ${role.company} website`}
                            className={`flex-shrink-0 p-1.5 rounded-lg ${
                              isActive
                                ? "text-white/55 hover:text-white"
                                : "text-[#4a6076]/70 hover:text-[#2f7ea8]"
                            }`}
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Detail panel */}
          <motion.div
            className="ink-card rounded-3xl p-7 md:p-9 min-h-[22rem]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.company}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.a
                      href={current.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) =>
                        openWatchedSite(event, current.url, current.company)
                      }
                      aria-label={`Open ${current.company} website`}
                      className={`flex items-center justify-center w-16 h-16 rounded-2xl flex-shrink-0 p-3 ${
                        current.lightLogo
                          ? "bg-[#16232f]"
                          : "bg-white/90 border border-white/60"
                      }`}
                      whileHover={{ scale: 1.08, rotate: -3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <img
                        src={current.logo}
                        alt={`${current.company} logo`}
                        className="w-full h-full object-contain"
                      />
                    </motion.a>
                    <div>
                      <h4 className="font-display text-xl md:text-2xl font-bold text-[#16232f] leading-snug">
                        <a
                          href={current.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) =>
                            openWatchedSite(event, current.url, current.company)
                          }
                          className="inline-flex items-center gap-2 hover:text-[#2f7ea8] transition-colors"
                        >
                          {current.company}
                          <ExternalLink size={16} className="opacity-45" />
                        </a>
                      </h4>
                      <p className="text-[#2f7ea8] text-sm font-medium mt-1">
                        {current.title}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-medium text-[#4a6076] border border-[#16232f]/15 rounded-full px-3 py-1.5">
                      {current.period}
                    </span>
                    <span className="block text-[10px] tracking-[0.15em] uppercase font-display font-bold text-[#4a6076]/70 mt-2">
                      {current.groupHeading}
                    </span>
                  </div>
                </div>

                <div className="rule my-7" />

                <ul className="space-y-4">
                  {current.points.map((point, i) => (
                    <motion.li
                      key={point}
                      className="flex gap-4 text-[#4a6076] font-light leading-relaxed"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
                    >
                      <span className="font-display text-xs font-bold text-[#2f7ea8] pt-1 flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Education + Certifications */}
        <div className="mt-16">
          <div className="rule mb-10" />

          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-[#2f7ea8]" />
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a6076]">
                  Education
                </p>
              </div>

              {education.map((item) => {
                const [from, to] = item.period.split(/\s+[–-]\s+/);
                return (
                  <motion.div
                    key={item.school}
                    className="group shine relative flex cursor-default overflow-hidden rounded-2xl border border-white/50 shadow-[0_14px_32px_-28px_rgba(22,35,47,0.55)]"
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  >
                    <div className="flex w-16 flex-shrink-0 flex-col items-center justify-center bg-[#16232f] px-2 py-4 text-center">
                      <GraduationCap className="h-4 w-4 text-[#7ec8e3] transition-transform duration-300 group-hover:rotate-[-12deg] group-hover:scale-110" />
                      <p className="mt-2 font-display text-[11px] font-bold tabular-nums text-white">
                        {from}
                      </p>
                      {to && (
                        <>
                          <span className="my-0.5 block h-3 w-px bg-[#7ec8e3]/50 transition-all duration-300 group-hover:h-4 group-hover:bg-[#7ec8e3]" />
                          <p className="font-display text-[11px] font-bold tabular-nums text-white">
                            {to}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 bg-white/45 px-4 py-3.5 backdrop-blur-md transition-colors duration-300 group-hover:bg-white/70">
                      <p className="font-display text-[15px] font-bold leading-snug text-[#16232f] transition-colors duration-300 group-hover:text-[#2f7ea8]">
                        {item.school}
                      </p>
                      <p className="mt-1 text-[12px] font-light leading-snug text-[#4a6076]">
                        {item.award}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              className="lg:col-span-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-[#2f7ea8]" />
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a6076]">
                  Certifications
                </p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={cert.name}
                    className="group shine frost-tile relative flex cursor-default items-start gap-3 overflow-hidden rounded-2xl px-3.5 py-3"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, delay: index * 0.05 },
                    }}
                    whileHover={{
                      y: -4,
                      scale: 1.025,
                      transition: { type: "spring", stiffness: 400, damping: 22 },
                    }}
                    whileTap={{ scale: 0.985 }}
                    viewport={{ once: true }}
                  >
                    <span className="mt-0.5 font-display text-[11px] font-bold tabular-nums text-[#2f7ea8] transition-transform duration-300 group-hover:scale-110">
                      {cert.year}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-snug text-[#16232f] transition-colors duration-300 group-hover:text-[#2f7ea8]">
                        {cert.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-light text-[#4a6076]">
                        {cert.issuer}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
