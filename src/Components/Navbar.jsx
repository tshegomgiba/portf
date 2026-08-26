import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Download } from "lucide-react";
import { profile } from "../data/profile";

const links = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Stack", href: "#stack" },
  { label: "Work", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

// Roughly the height of the bar, so a section does not land underneath it.
const NAV_OFFSET = 72;

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  /**
   * Scroll to a section by hand rather than letting the browser follow the
   * href. On mobile the open menu locks scrolling on the body, and a plain
   * anchor jump fires while that lock is still on, so the page never moves and
   * only the address bar changes. Releasing the lock first also lets us stop
   * the section landing behind the fixed bar.
   */
  const go = (event, href) => {
    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    setOpen(false);
    document.body.style.overflow = "";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Sticky slots report their painted box from getBoundingClientRect, so
    // walk offsetParent for the place they occupy in the document.
    const slot = target.closest(".stack-slot") ?? target;
    let top = 0;
    for (let node = slot; node; node = node.offsetParent) {
      top += node.offsetTop;
    }
    top -= NAV_OFFSET;

    requestAnimationFrame(() => {
      window.scrollTo({ top: Math.max(top, 0), behavior: reduced ? "auto" : "smooth" });
      window.history.replaceState(null, "", href);
    });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Highlight whichever section is sitting across the middle of the screen.
    // Two of them cross the middle at once while one covers the other, so keep
    // the whole set and pick the one furthest down the page, which is the one
    // drawn on top.
    const seen = new Set();

    const spotter = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const href = `#${entry.target.id}`;
          if (entry.isIntersecting) seen.add(href);
          else seen.delete(href);
        });

        const top = links.filter(({ href }) => seen.has(href)).pop();
        if (top) setActive(top.href);
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    links.forEach(({ href }) => {
      const section = document.querySelector(href);
      if (section) spotter.observe(section);
    });

    return () => spotter.disconnect();
  }, []);

  // Never leave the menu open behind a resize into the desktop layout.
  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
        scrolled || open
          ? "bg-[#dfe8f1]/85 backdrop-blur-md border-b border-[#16232f]/10 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <a
          href="#top"
          onClick={(event) => go(event, "#top")}
          className={`font-display font-extrabold tracking-tight text-lg transition-colors ${
            scrolled || open ? "text-[#16232f]" : "text-white"
          }`}
        >
          TM<span className="text-[#7ec8e3]">.</span>
        </a>

        <ul className="hidden md:flex items-center gap-5 lg:gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(event) => go(event, link.href)}
                className={`relative text-sm font-medium tracking-wide transition-colors ${
                  scrolled
                    ? "text-[#4a6076] hover:text-[#2f7ea8]"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                {active === link.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-1.5 left-0 right-0 h-px bg-[#7ec8e3]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <motion.a
            href={profile.cv}
            download
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full transition-colors ${
              scrolled || open
                ? "border border-[#16232f]/20 text-[#16232f] hover:border-[#2f7ea8] hover:text-[#2f7ea8]"
                : "border border-white/30 text-white hover:bg-white/15"
            }`}
          >
            <Download size={13} />
            CV
          </motion.a>

          <motion.a
            href="#contact"
            onClick={(event) => go(event, "#contact")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className={`text-xs font-semibold px-5 py-2.5 rounded-full transition-colors ${
              scrolled || open
                ? "bg-[#16232f] text-white hover:bg-[#2f7ea8]"
                : "bg-white/15 text-white border border-white/30 backdrop-blur-sm hover:bg-white/25"
            }`}
          >
            Hire me
          </motion.a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`md:hidden p-2 -mr-2 transition-colors ${
              scrolled || open ? "text-[#16232f]" : "text-white"
            }`}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden overflow-hidden"
          >
            <ul className="px-6 pt-4 pb-6 space-y-1">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                >
                  <a
                    href={link.href}
                    onClick={(event) => go(event, link.href)}
                    className={`flex items-center justify-between py-3 border-b border-[#16232f]/10 font-display font-semibold transition-colors ${
                      active === link.href
                        ? "text-[#2f7ea8]"
                        : "text-[#16232f] hover:text-[#2f7ea8]"
                    }`}
                  >
                    {link.label}
                    <span className="font-display text-[10px] tracking-[0.2em] text-[#4a6076]/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </a>
                </motion.li>
              ))}

              <motion.li
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="pt-4"
              >
                <a
                  href={profile.cv}
                  download
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#16232f]"
                >
                  <Download size={15} className="text-[#2f7ea8]" />
                  Download CV
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  );
};

export default Navbar;
