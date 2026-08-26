import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import PixelSprite, { BIT_INK, BIT_PALE } from "./PixelSprite";

/**
 * Bit on phones: mint teacher, own kit per section, own bubble.
 */
const Sidekick = ({
  talk,
  tone = 0,
  walking = false,
  size = 34,
  align = "center",
  kit = "lecture",
  gazeRef,
  sending = false,
}) => {
  const mine = Boolean(talk?.laugh || talk?.who === "bit" || talk?.who === "both");
  const skin = tone ? BIT_PALE : BIT_INK;
  const items =
    align === "end" ? "items-end" : align === "start" ? "items-start" : "items-center";

  return (
    <div className={`flex flex-col ${items} pointer-events-none select-none`}>
      <AnimatePresence>
        {mine && talk?.text && (
          <motion.div
            key={`${talk.who}-${talk.text}`}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="mb-1.5 max-w-[min(14rem,calc(100vw-7rem))] rounded-2xl bg-white px-3 py-2 text-left shadow-[0_10px_24px_-8px_rgba(13,23,32,0.55)]"
          >
            <p
              className={`font-display text-[8px] font-bold uppercase tracking-[0.18em] ${
                talk.tag === "Unhinged" || talk.laugh ? "text-[#e8613a]" : "text-[#2f8f7e]"
              }`}
            >
              Bit{talk.tag ? ` / ${talk.tag}` : ""}
            </p>
            <p className="mt-0.5 line-clamp-4 text-[10.5px] font-medium leading-snug text-[#16232f]">
              {talk.laugh ? "Ha ha." : talk.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        ref={gazeRef}
        className="origin-bottom"
        style={{ transformStyle: "preserve-3d" }}
      >
        <PixelSprite
          size={size}
          walking={walking || sending}
          waving={(mine || sending) && !talk?.laugh}
          laughing={Boolean(talk?.laugh)}
          kind="bit"
          kit={kit}
          {...skin}
        />
      </div>
    </div>
  );
};

export default Sidekick;
