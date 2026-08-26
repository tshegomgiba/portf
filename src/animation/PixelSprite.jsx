import React from "react";

// Pale on dark backgrounds, ink on light ones, matching how the 3D companion
// shifts its shell tone from section to section.
export const PALE_SKIN = { shell: "#dbeef7", shade: "#9fc4d8", glow: "#7ec8e3" };
export const INK_SKIN = { shell: "#1d3346", shade: "#2c4356", glow: "#2f7ea8" };

/**
 * A flat stand in for the 3D companion, for the two places a WebGL canvas is
 * the wrong tool: the loading screen, which is on show while the Three.js
 * bundle is still downloading, and phones, where a full canvas would cost more
 * battery than the character is worth.
 */
const PixelSprite = ({
  size = 40,
  walking = false,
  waving = false,
  shell = PALE_SKIN.shell,
  shade = PALE_SKIN.shade,
  glow = PALE_SKIN.glow,
}) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 40 52"
    fill="none"
    aria-hidden="true"
    className={`bot-sprite${walking ? " bot-walk" : ""}${waving ? " bot-wave" : ""}`}
  >
    <rect x="19.2" y="4" width="1.6" height="6.5" rx="0.8" fill={shade} opacity="0.7" />
    <circle cx="20" cy="3" r="2.5" fill={glow} className="bot-glow" />

    {/* Far side limbs sit behind the body */}
    <g className="bot-arm-far">
      <rect x="-1.5" y="-1.5" width="3" height="12.5" rx="1.5" fill={shade} />
    </g>
    <g className="bot-leg-back">
      <rect x="-1.7" y="-1.5" width="3.4" height="15" rx="1.7" fill={shade} />
    </g>
    <g className="bot-leg-front">
      <rect x="-1.7" y="-1.5" width="3.4" height="15" rx="1.7" fill={shell} />
    </g>

    <rect x="13.4" y="22.5" width="13.2" height="15" rx="6.6" fill={shell} />
    <rect x="14.8" y="33.4" width="10.4" height="2.4" rx="1.2" fill={glow} opacity="0.85" />

    <circle cx="20" cy="15" r="7.8" fill={shell} />
    <ellipse cx="21.6" cy="15.4" rx="3.7" ry="2.5" fill={glow} className="bot-blink" />

    {/* Near arm, drawn last so it reads in front of the body */}
    <g className="bot-arm-near">
      <rect x="-1.5" y="-1.5" width="3" height="11" rx="1.5" fill={shell} />
      <circle cx="0" cy="10.5" r="2.3" fill={glow} />
    </g>
  </svg>
);

export default PixelSprite;
