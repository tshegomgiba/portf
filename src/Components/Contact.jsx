import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Send,
  ArrowUpRight,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { profile } from "../data/profile";

// Web3Forms access keys are public client keys. Keep a fallback so a Vercel
// build that did not pick up `.env.production` still reaches the inbox.
const ACCESS_KEY = (
  import.meta.env.VITE_WEB3FORMS_KEY ||
  "619de087-0c8c-4cd2-b2f4-402f8d1c36f2"
).trim();

const CosmicContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const stars = useMemo(() => {
    const count = typeof window !== "undefined" && window.innerWidth < 768 ? 16 : 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      delay: Math.random() * 2,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ACCESS_KEY) {
      setStatus({
        state: "error",
        message:
          "The form is not configured yet. Email me directly using the link on the right.",
      });
      return;
    }

    setStatus({ state: "sending", message: "" });

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Portfolio message from ${formData.name}`,
          from_name: "Tshegofatso Ashleigh Mgiba portfolio",
          name: formData.name,
          email: formData.email,
          message: formData.message,
          // Lets the inbox tell localhost from the hosted site.
          page: window.location.href,
          botcheck: e.target.botcheck?.checked ? "true" : "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({
          state: "success",
          message: "Message sent. I will get back to you shortly.",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus({
          state: "error",
          message: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setStatus({
        state: "error",
        message:
          "Could not reach the server. Check your connection and try again.",
      });
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (status.state !== "idle") setStatus({ state: "idle", message: "" });
  };

  return (
    <section
      id="contact"
      className="relative pt-16 pb-32 md:py-28 px-5 md:px-6 lg:px-10 overflow-hidden bg-[#16232f]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(126,200,227,0.15),transparent_50%)] pointer-events-none" />

      {/* Twinkle stars */}
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
              opacity: [0.15, 0.75, 0.15],
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

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow mb-4 text-[#7ec8e3]">05 / Contact</p>
          <h2 className="display-title text-4xl md:text-7xl text-white">
            Let's build
            <br />
            <span className="text-white/40">something.</span>
          </h2>
        </motion.div>

        <div className="h-px w-full bg-white/15 mb-14" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <label className="block text-[11px] tracking-[0.25em] uppercase text-white/45 mb-2 font-display font-semibold">
                Your name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full bg-transparent border-b border-white/25 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#7ec8e3] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.25em] uppercase text-white/45 mb-2 font-display font-semibold">
                Email address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="w-full bg-transparent border-b border-white/25 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#7ec8e3] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.25em] uppercase text-white/45 mb-2 font-display font-semibold">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell me about your project..."
                rows={4}
                className="w-full bg-transparent border-b border-white/25 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#7ec8e3] transition-colors resize-none"
                required
              />
            </div>

            <input
              type="checkbox"
              name="botcheck"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              style={{ display: "none" }}
            />

            <motion.button
              type="submit"
              data-pixel="hire"
              disabled={status.state === "sending"}
              className="inline-flex items-center gap-2 bg-white text-[#16232f] font-semibold py-3.5 px-8 rounded-full hover:bg-[#7ec8e3] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={status.state === "sending" ? {} : { scale: 1.03 }}
              whileTap={status.state === "sending" ? {} : { scale: 0.97 }}
            >
              {status.state === "sending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending
                </>
              ) : (
                <>
                  <Send size={16} /> Send message
                </>
              )}
            </motion.button>

            <AnimatePresence mode="wait">
              {(status.state === "success" || status.state === "error") && (
                <motion.p
                  key={status.state}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-2 text-sm ${
                    status.state === "success"
                      ? "text-[#7ec8e3]"
                      : "text-red-300"
                  }`}
                >
                  {status.state === "success" ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  )}
                  {status.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <motion.a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-[#7ec8e3]/50 hover:bg-white/[0.09] transition-all group"
              whileHover={{ y: -4 }}
            >
              <div className="p-2.5 rounded-xl bg-white/10">
                <Mail className="text-[#7ec8e3]" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.2em] uppercase text-white/40 font-display font-semibold">
                  Email
                </p>
                <p className="text-white text-sm truncate">
                  {profile.email}
                </p>
              </div>
              <ArrowUpRight className="ml-auto text-white/30 group-hover:text-[#7ec8e3] transition-colors" size={18} />
            </motion.a>

            <motion.a
              href={profile.phoneHref}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-[#7ec8e3]/50 hover:bg-white/[0.09] transition-all group"
              whileHover={{ y: -4 }}
            >
              <div className="p-2.5 rounded-xl bg-white/10">
                <Phone className="text-[#7ec8e3]" size={20} />
              </div>
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-white/40 font-display font-semibold">
                  Phone
                </p>
                <p className="text-white text-sm">{profile.phone}</p>
              </div>
              <ArrowUpRight className="ml-auto text-white/30 group-hover:text-[#7ec8e3] transition-colors" size={18} />
            </motion.a>

            {profile.whatsapp && (
              <motion.a
                href={profile.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-[#7ec8e3]/50 hover:bg-white/[0.09] transition-all group"
                whileHover={{ y: -4 }}
              >
                <div className="p-2.5 rounded-xl bg-white/10">
                  <FaWhatsapp className="text-[#7ec8e3]" size={20} />
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-white/40 font-display font-semibold">
                    WhatsApp
                  </p>
                  <p className="text-white text-sm">{profile.phone}</p>
                </div>
                <ArrowUpRight className="ml-auto text-white/30 group-hover:text-[#7ec8e3] transition-colors" size={18} />
              </motion.a>
            )}

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.05] border border-white/10">
              <div className="p-2.5 rounded-xl bg-white/10">
                <MapPin className="text-[#7ec8e3]" size={20} />
              </div>
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-white/40 font-display font-semibold">
                  Location
                </p>
                <p className="text-white text-sm">
                  {profile.location}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="font-display text-white font-bold mb-2">
                Currently available
              </p>
              <p className="text-white/55 text-sm font-light leading-relaxed">
                {profile.availability}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="h-px w-full bg-white/15 mt-20 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-xs">
          <p className="font-display font-bold text-white/70">
            TM<span className="text-[#7ec8e3]">.</span>
          </p>
          <p>© {new Date().getFullYear()} Tshegofatso Ashleigh Mgiba. All rights reserved.</p>
        </div>
      </div>
    </section>
  );
};

export default CosmicContactForm;
