import React, { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { Code, Palette, Smartphone, Server } from "lucide-react";
import CountUp from "./CountUp";
import { stats } from "../data/stats";

const About = () => {
  useEffect(() => {
    Aos.init({ duration: 1000, once: true });
  }, []);

  const skills = [
    { icon: Code, name: "Frontend Development", level: 85 },
    { icon: Server, name: "Backend Development", level: 70 },
    { icon: Palette, name: "UI/UX Design", level: 80 },
    { icon: Smartphone, name: "Mobile Development", level: 75 },
  ];

  const focus = [
    "WordPress development",
    "CRM automation",
    "Responsive web apps",
    "UI/UX & wireframing",
    "SEO basics",
    "Agile / Scrum",
  ];

  return (
    <section
      id="about"
      className="relative py-16 md:py-28 overflow-hidden bg-[#dfe8f1]"
    >
      <div className="absolute inset-0 grain opacity-60 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-[#7ec8e3]/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
          <div data-aos="fade-right">
            <p className="eyebrow mb-5">01 / About</p>
            <h2 className="display-title text-4xl md:text-6xl mb-8">
              Code with
              <br />
              <span className="text-[#2f7ea8]">intent.</span>
            </h2>
            <div className="rule mb-8" />
            <p className="text-[#4a6076] leading-relaxed text-lg font-light">
              Detail-oriented Software Developer with a Diploma in Information
              Technology (Software Development) and hands-on experience in
              WordPress development, web applications, CRM automation, and
              responsive website development.
            </p>
            <p className="text-[#4a6076] leading-relaxed mt-4 font-light">
              I build and maintain modern websites with React, TypeScript, and
              Tailwind CSS, working comfortably on my own or directly with
              clients, with a strong focus on performance, usability, and
              problem-solving. Based in Pretoria &amp; Johannesburg.
            </p>

            <div className="flex flex-wrap gap-2 mt-8">
              {focus.map((item, i) => (
                <motion.span
                  key={item}
                  className="text-xs text-[#4a6076] border border-[#16232f]/15 rounded-full px-3 py-1.5"
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  {item}
                </motion.span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <p className="display-title text-3xl md:text-4xl text-[#16232f]">
                    <CountUp to={stat.value} delay={i * 0.12} />
                  </p>
                  <p className="text-xs text-[#4a6076] mt-1 tracking-wide">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div data-aos="fade-left">
            <p className="eyebrow mb-6 text-[#4a6076]">Capabilities</p>
            <div className="space-y-3">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <motion.div
                    key={index}
                    className="ink-card rounded-2xl p-5"
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-center mb-4">
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#16232f] text-white mr-4">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-[#16232f] font-medium">
                        {skill.name}
                      </span>
                      <span className="ml-auto font-display text-sm font-bold text-[#2f7ea8]">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-[#16232f]/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-[#2f7ea8] to-[#7ec8e3] h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1,
                          delay: 0.2 + index * 0.1,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
