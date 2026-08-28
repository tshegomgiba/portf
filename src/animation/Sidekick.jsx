import React from "react";
import PixelSprite, { BIT_INK, BIT_PALE } from "./PixelSprite";

/**
 * Bit on phones: mint teacher, own kit per section. Speech lives on the
 * shared MiniCompanion bubble so two captions do not fight for width.
 */
const Sidekick = ({
  talk,
  tone = 0,
  walking = false,
  size = 34,
  kit = "lecture",
  sending = false,
}) => {
  const mine = Boolean(talk?.laugh || talk?.who === "bit" || talk?.who === "both");
  const skin = tone ? BIT_PALE : BIT_INK;

  return (
    <div className="pointer-events-none select-none">
      <PixelSprite
        size={size}
        walking={walking && !sending}
        waving={(mine || sending) && !talk?.laugh}
        laughing={Boolean(talk?.laugh)}
        kind="bit"
        kit={kit}
        {...skin}
      />
    </div>
  );
};

export default Sidekick;
