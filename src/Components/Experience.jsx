import React, { useEffect, useState } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, GraduationCap, Award, Languages } from "lucide-react";
import {
  timeline,
  entries,
  education,
  certifications,
  languages,
} from "../data/experience";

const Experience = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    Aos.init({ duration: 1000, once: true });
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
                      <motion.button
                        key={role.company}
                        onClick={() => setActive(index)}
                        className={`relative w-full text-left flex items-center gap-3 p-3 rounded-2xl ${
                          isActive
                            ? "bg-[#16232f] border border-[#16232f]"
                            : "frost-tile"
                        }`}
                        whileHover={{ x: isActive ? 0 : 4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 350, damping: 22 }}
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
                            alt={`${role.company} logo`}
                            className="w-full h-full object-contain"
                          />
                        </span>
                        <span className="min-w-0">
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
                      </motion.button>
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
                    <motion.div
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
                    </motion.div>
                    <div>
                      <h4 className="font-display text-xl md:text-2xl font-bold text-[#16232f] leading-snug">
                        {current.company}
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
        <div className="grid lg:grid-cols-2 gap-8 mt-16">
          <motion.div
            className="ink-card rounded-3xl p-7"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            data-aos="fade-right"
          >
            <div className="flex items-center gap-2.5 mb-6">
              <GraduationCap className="w-5 h-5 text-[#2f7ea8]" />
              <h3 className="font-display text-lg font-bold text-[#16232f]">
                Education
              </h3>
            </div>

            <div className="space-y-5">
              {education.map((item) => (
                <div key={item.school}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium text-[#16232f]">{item.school}</p>
                    <span className="text-xs text-[#4a6076] whitespace-nowrap">
                      {item.period}
                    </span>
                  </div>
                  <p className="text-sm text-[#4a6076] font-light mt-1">
                    {item.award}
                  </p>
                </div>
              ))}
            </div>

            <div className="rule my-6" />

            <div className="flex items-center gap-2.5 mb-4">
              <Languages className="w-5 h-5 text-[#2f7ea8]" />
              <h3 className="font-display text-lg font-bold text-[#16232f]">
                Languages
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span
                  key={lang.name}
                  className="text-xs text-[#4a6076] border border-[#16232f]/15 rounded-full px-3 py-1.5"
                >
                  {lang.name} · <span className="text-[#2f7ea8]">{lang.level}</span>
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="ink-card rounded-3xl p-7"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            data-aos="fade-left"
          >
            <div className="flex items-center gap-2.5 mb-6">
              <Award className="w-5 h-5 text-[#2f7ea8]" />
              <h3 className="font-display text-lg font-bold text-[#16232f]">
                Certifications
              </h3>
            </div>

            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  className="flex items-baseline justify-between gap-3 pb-3 border-b border-[#16232f]/10 last:border-0 last:pb-0"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  <div>
                    <p className="text-sm font-medium text-[#16232f]">
                      {cert.name}
                    </p>
                    <p className="text-xs text-[#4a6076] font-light mt-0.5">
                      {cert.issuer}
                    </p>
                  </div>
                  <span className="font-display text-xs font-bold text-[#2f7ea8]">
                    {cert.year}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
