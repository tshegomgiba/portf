import React, { useEffect, useMemo, lazy, Suspense } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import Aos from 'aos';
import 'aos/dist/aos.css';
import img1 from '../images/portrait.webp';
import heroBg from '../images/pexels-stywo-1054218.webp';
import HeroBgAnimation from '../Hero/HeroBgAnimation';
import { motion } from 'framer-motion';
import Stars from "../animation/stars";
import { Typewriter } from "react-simple-typewriter";
import { profile, socialLinks } from "../data/profile";

const SOCIAL_ICONS = {
  github: FaGithub,
  linkedin: FaLinkedin,
  email: FaEnvelope,
};

// Three.js is a heavy bundle, so it loads after the hero paints.
const HeroOrb = lazy(() => import("../animation/HeroOrb"));

const Hero = () => {
  const twinkleStars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        delay: Math.random() * 2,
      })),
    []
  );

  useEffect(() => {
    Aos.init({ duration: 1000, once: true });
  }, []);

  return (
    <motion.div id="top" className="relative min-h-screen min-h-[100svh] overflow-hidden bg-[#16232f]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1720]/45 via-[#16232f]/25 to-[#16232f]/70" />

      {/* Twinkling stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {twinkleStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full shadow-lg"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
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

      <div className="absolute inset-0 grain opacity-[0.35] pointer-events-none" />
      {/* Centre scrim keeps the headline readable over the peaks */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,23,32,0.4)_0%,rgba(13,23,32,0.15)_45%,transparent_75%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen min-h-[100svh] px-6 md:px-12 lg:px-20 pt-24 pb-16 md:pt-28 md:pb-20 text-center">
        {/* Portrait composition */}
        <div
          className="relative flex items-center justify-center w-full max-w-lg h-56 sm:h-64 md:h-72"
          data-aos="fade-up"
        >
          {/* Decorative animation layers sit behind the portrait */}
          <div className="absolute inset-0 pointer-events-none">
            <Stars />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-70 scale-[0.55] sm:scale-[0.65] md:scale-75">
            <HeroBgAnimation />
          </div>

          {/* 3D shell orbiting the portrait */}
          <div className="absolute -inset-x-8 -inset-y-20 sm:-inset-y-24 pointer-events-none">
            <Suspense fallback={null}>
              <HeroOrb />
            </Suspense>
          </div>

          {/* Slow rotating ring */}
          <motion.span
            className="absolute rounded-full border border-dashed border-[#7ec8e3]/40 w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative z-10 group">
            <span className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#7ec8e3]/40 via-transparent to-white/20 blur-md" />
            <img
              className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full object-cover shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ring-2 ring-white/40 transition-transform duration-500 group-hover:scale-105"
              src={img1}
              alt="Tshegofatso Mgiba"
            />
          </div>
        </div>

        <p className="eyebrow mt-8 text-[#7ec8e3]" data-aos="fade-up">
          Full Stack Developer
        </p>

        <h1
          className="display-title text-3xl sm:text-4xl md:text-5xl mt-3 text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.55)]"
          data-aos="zoom-in"
        >
          Tshegofatso <span className="text-[#b8e0f0]">Mgiba</span>
        </h1>

        <div className="mt-5 flex items-center gap-4 w-full max-w-md" data-aos="fade-up">
          <span className="h-px flex-1 bg-white/25" />
          <p className="font-display text-sm md:text-base text-[#b8e0f0] whitespace-nowrap">
            <Typewriter
              words={["Tshegofatso Mgiba", "Full Stack Developer"]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={150}
              deleteSpeed={80}
              delaySpeed={2000}
            />
          </p>
          <span className="h-px flex-1 bg-white/25" />
        </div>

        <p
          className="mt-6 text-sm md:text-base text-white/70 max-w-2xl leading-relaxed font-light"
          data-aos="fade-left"
        >
          Detail-oriented Software Developer building modern, responsive
          websites and web applications with React, TypeScript, and Tailwind
          CSS, plus WordPress development and CRM automation.
        </p>

        <p className="mt-4 text-xs tracking-[0.2em] uppercase text-white/40 font-display" data-aos="fade-up">
          Pretoria &amp; Johannesburg · South Africa
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4" data-aos="fade-up">
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3 rounded-full bg-white text-[#16232f] text-sm font-semibold hover:bg-[#b8e0f0] transition-colors"
          >
            View my work
          </motion.a>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            Get in touch
          </motion.a>
          <motion.a
            href={profile.cv}
            download
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white/75 hover:text-white transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Download CV
          </motion.a>
        </div>

        <div
          className="flex justify-center gap-7 mt-8 text-2xl"
          data-aos="fade-down"
        >
          {socialLinks.map(({ key, label, href }) => {
            const Icon = SOCIAL_ICONS[key];
            const external = href.startsWith("http");

            return (
              <motion.a
                key={key}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="text-white/60 hover:text-white transition-colors duration-300"
                aria-label={label}
              >
                <Icon />
              </motion.a>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 pointer-events-none">
        <motion.div
          className="flex flex-col items-center gap-3"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="relative h-11 w-7 rounded-full border border-white/40">
            <span className="absolute inset-x-0 top-2 flex justify-center">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[#7ec8e3] shadow-[0_0_8px_rgba(126,200,227,0.9)]"
                animate={{ y: [0, 14, 0], opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </span>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            aria-hidden="true"
            className="text-white/45"
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Hero;
