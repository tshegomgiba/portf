import React from "react";

// Pale on dark backgrounds, ink on light ones, matching how the 3D companion
// shifts its shell tone from section to section.
export const PALE_SKIN = { shell: "#dbeef7", shade: "#9fc4d8", glow: "#7ec8e3" };
export const INK_SKIN = { shell: "#1d3346", shade: "#2c4356", glow: "#2f7ea8" };
export const BIT_PALE = { shell: "#d8f4ee", shade: "#8ec9be", glow: "#7ed9c0" };
export const BIT_INK = { shell: "#1a3d42", shade: "#2d5c62", glow: "#4db8a4" };

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
  laughing = false,
  kit = null,
  kind = "pixel",
  shell = PALE_SKIN.shell,
  shade = PALE_SKIN.shade,
  glow = PALE_SKIN.glow,
}) => {
  const teacher = kind === "bit";
  return (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 40 52"
    fill="none"
    aria-hidden="true"
    className={`bot-sprite${walking ? " bot-walk" : ""}${waving ? " bot-wave" : ""}${
      laughing ? " bot-laugh" : ""
    }${kit ? ` bot-teach bot-teach-${kit}` : ""}`}
  >
    {teacher ? (
      <>
        <rect x="19.2" y="4" width="1.6" height="6.5" rx="0.8" fill={shade} opacity="0.7" />
        <circle cx="20" cy="3" r="2.5" fill={glow} className="bot-glow" />
      </>
    ) : (
      <>
        <rect x="12.2" y="5.2" width="15.6" height="3.4" rx="1.2" fill={shade} />
        <rect x="11.4" y="6.5" width="2.2" height="6" rx="1" fill={shade} transform="rotate(-28 12.5 9.5)" />
        <rect x="26.4" y="6.5" width="2.2" height="6" rx="1" fill={shade} transform="rotate(28 27.5 9.5)" />
        <circle cx="11.2" cy="6.2" r="1.8" fill={glow} className="bot-glow" />
        <circle cx="28.8" cy="6.2" r="1.8" fill={glow} className="bot-glow" />
      </>
    )}

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

    {kit === "chalk" && (
      <g className="bot-kit bot-kit-board">
        <rect x="1" y="18" width="12" height="9" rx="1" fill="#1a3d42" />
        <rect x="2" y="19.2" width="10" height="6.6" rx="0.5" fill="#3d9b8f" opacity="0.85" />
      </g>
    )}

    <rect
      x={teacher ? "13.4" : "12.2"}
      y="22.5"
      width={teacher ? "13.2" : "15.6"}
      height="15"
      rx={teacher ? "6.6" : "4.2"}
      fill={shell}
    />
    <rect
      x={teacher ? "14.8" : "14.2"}
      y="33.4"
      width={teacher ? "10.4" : "11.6"}
      height="2.4"
      rx="1.2"
      fill={glow}
      opacity="0.85"
    />
    {teacher && kit && (
      <rect x="16.2" y="25.2" width="7.6" height="3.2" rx="0.8" fill={glow} opacity="0.95" />
    )}
    {!teacher && (
      <>
        <rect x="15.4" y="25.6" width="9.2" height="4.2" rx="1" fill={glow} opacity="0.7" />
        <rect x="12.8" y="32.2" width="14.4" height="2.2" rx="1" fill={glow} opacity="0.9" />
        <g transform="translate(28.4 31.2) rotate(38)">
          <rect x="-0.8" y="0" width="1.6" height="8" rx="0.6" fill={shade} />
          <rect x="-2.4" y="7.2" width="4.8" height="2.2" rx="0.6" fill={glow} />
        </g>
      </>
    )}

    {teacher ? (
      <circle cx="20" cy="15" r="7.8" fill={shell} />
    ) : (
      <rect x="11.6" y="7.2" width="16.8" height="15.4" rx="3.6" fill={shell} />
    )}
    {teacher ? (
      <ellipse cx="21.6" cy="15.4" rx="3.7" ry="2.5" fill={glow} className="bot-blink" />
    ) : (
      <>
        <rect x="12.4" y="13.4" width="15.2" height="4.2" rx="1.2" fill={shade} opacity="0.55" />
        <rect x="15.2" y="13.8" width="11.4" height="3.4" rx="1.2" fill={glow} className="bot-blink" />
      </>
    )}

    {kit === "book" && (
      <g className="bot-kit bot-kit-book">
        <rect x="7" y="27.5" width="7.4" height="9.2" rx="0.7" fill="#3d9b8f" />
        <rect x="14.6" y="27.5" width="7.4" height="9.2" rx="0.7" fill="#e8f7f3" />
        <rect x="14.2" y="27.2" width="0.9" height="9.8" rx="0.4" fill={glow} />
      </g>
    )}
    {kit === "grade" && (
      <g className="bot-kit bot-kit-clip">
        <rect x="8.5" y="26" width="8.2" height="11" rx="0.8" fill="#3d9b8f" />
        <rect x="9.4" y="28" width="6.4" height="8" rx="0.4" fill="#e8f7f3" />
        <rect x="10.4" y="30" width="3.2" height="1.1" rx="0.4" fill={glow} />
      </g>
    )}
    {kit === "review" && (
      <g className="bot-kit bot-kit-papers">
        <rect x="7" y="26.5" width="9" height="11" rx="0.6" fill={glow} opacity="0.7" transform="rotate(-12 11.5 32)" />
        <rect x="10" y="26" width="9" height="11" rx="0.6" fill="#e8f7f3" />
      </g>
    )}
    {kit === "invite" && (
      <g className="bot-kit bot-kit-plaque">
        <rect x="26.5" y="24" width="11" height="5.4" rx="1" fill="#3d9b8f" />
        <rect x="28" y="25.4" width="8" height="1.1" rx="0.4" fill="#e8f7f3" />
        <rect x="28" y="27.2" width="5.5" height="1.1" rx="0.4" fill="#e8f7f3" opacity="0.7" />
      </g>
    )}

    {/* Near arm, drawn last so it reads in front of the body */}
    <g className="bot-arm-near">
      <rect x="-1.5" y="-1.5" width="3" height="11" rx={teacher ? "1.5" : "0.8"} fill={shell} />
      {teacher ? (
        <circle cx="0" cy="10.5" r="2.3" fill={glow} />
      ) : (
        <rect x="-2.1" y="8.6" width="4.2" height="3.4" rx="0.7" fill={glow} />
      )}
      {kit === "lecture" && (
        <rect x="-0.55" y="10.2" width="1.1" height="8.5" rx="0.5" fill="#3d9b8f" className="bot-kit-pointer" />
      )}
    </g>
  </svg>
  );
};

/**
 * Pixel sitting on a crate, putting itself back together. Used on the reboot
 * overlay after a self destruct, where a second WebGL canvas would be wasteful.
 */
export const RepairingPixel = ({
  size = 120,
  kind = "pixel",
  shell = PALE_SKIN.shell,
  shade = PALE_SKIN.shade,
  glow = PALE_SKIN.glow,
}) => {
  const teacher = kind === "bit";
  return (
  <svg
    width={size}
    height={size * 1.12}
    viewBox="0 0 80 92"
    fill="none"
    aria-hidden="true"
    className="bot-fix"
  >
    <ellipse cx="40" cy="86" rx="22" ry="3.4" fill="#000" opacity="0.38" />

    {/* Crate stays planted. The body sits on the lid, not beside it. */}
    <rect x="24" y="64" width="32" height="14" rx="2.4" fill={shade} />
    <rect x="24" y="64" width="32" height="3.4" rx="1.5" fill={shell} opacity="0.5" />
    <rect x="27" y="78" width="4.2" height="8" rx="1" fill={shade} />
    <rect x="48.8" y="78" width="4.2" height="8" rx="1" fill={shade} />

    {/* Far thigh and shin, tucked under the seat then down to the floor */}
    <g className="bot-fix-leg-l">
      <rect x="-2.2" y="-1.6" width="4.4" height="16" rx="2.2" fill={shade} />
      <g transform="translate(0 14.5) rotate(-62)">
        <rect x="-2" y="-1" width="4" height="13" rx="2" fill={shell} />
        <rect x="-3.6" y="10.6" width="8.4" height="3.3" rx="1.2" fill={glow} />
      </g>
    </g>
    <g className="bot-fix-leg-r">
      <rect x="-2.2" y="-1.6" width="4.4" height="16" rx="2.2" fill={shell} />
      <g transform="translate(0 14.5) rotate(62)">
        <rect x="-2" y="-1" width="4" height="13" rx="2" fill={shell} />
        <rect x="-4.8" y="10.6" width="8.4" height="3.3" rx="1.2" fill={glow} />
      </g>
    </g>

    {/* Hips planted on the crate lid */}
    <rect x="28" y="40" width="24" height="26" rx="11" fill={shell} />
    <rect x="31.5" y="58.5" width="17" height="3.4" rx="1.7" fill={glow} opacity="0.9" />

    <g className="bot-fix-arm-far">
      <rect x="-1.7" y="-1.4" width="3.4" height="13" rx="1.7" fill={shade} />
      <circle cx="0" cy="12.4" r="2.3" fill={glow} />
    </g>

    <g className="bot-fix-head">
      {teacher ? (
        <>
          <rect x="38.4" y="16" width="1.7" height="6.2" rx="0.85" fill={shade} opacity="0.75" />
          <circle cx="39.2" cy="15" r="2.4" fill={glow} className="bot-glow" />
          <circle cx="40" cy="29" r="9.6" fill={shell} />
          <ellipse cx="42.4" cy="30.4" rx="4.3" ry="2.7" fill={glow} className="bot-blink" />
        </>
      ) : (
        <>
          <rect x="31.2" y="16.4" width="17.6" height="3.6" rx="1.2" fill={shade} />
          <rect x="30.5" y="18" width="2.2" height="6" rx="1" fill={shade} transform="rotate(-32 31.6 21)" />
          <rect x="47.2" y="18" width="2.2" height="6" rx="1" fill={shade} transform="rotate(32 48.3 21)" />
          <circle cx="30.4" cy="17.4" r="1.8" fill={glow} className="bot-glow" />
          <circle cx="49.6" cy="17.4" r="1.8" fill={glow} className="bot-glow" />
          <rect x="31.2" y="20.6" width="17.6" height="16.8" rx="3.2" fill={shell} />
          <rect x="32.2" y="27.8" width="15.6" height="4.2" rx="1.2" fill={shade} opacity="0.55" />
          <rect x="34.6" y="28.6" width="13.2" height="4" rx="1.5" fill={glow} className="bot-blink" />
        </>
      )}
    </g>

    <g className="bot-fix-arm-near">
      <rect x="-1.8" y="-1.5" width="3.6" height="12.5" rx="1.8" fill={shell} />
      <g className="bot-fix-wrench">
        <rect x="-1.15" y="9.2" width="2.3" height="11" rx="1" fill={glow} />
        <path
          d="M-3.5 20.4h7v3.6c0 1.6-1.5 2.8-3.5 2.8s-3.5-1.2-3.5-2.8z"
          fill={glow}
        />
        <circle cx="0" cy="22.6" r="1.2" fill={shell} />
      </g>
    </g>

    <g className="bot-fix-sparks" fill={glow}>
      <rect x="44" y="42" width="2.2" height="2.2" rx="0.4" transform="rotate(45 45.1 43.1)" />
      <rect x="50" y="38" width="1.6" height="1.6" rx="0.3" transform="rotate(45 50.8 38.8)" />
      <rect x="47.5" y="47" width="1.4" height="1.4" rx="0.3" transform="rotate(45 48.2 47.7)" />
    </g>
  </svg>
  );
};

/**
 * The one who did not explode stands beside the crate and puts the other back
 * together. Used on the reboot overlay.
 */
export const RepairingPair = ({ broken = "pixel", size = 118 }) => {
  const helper = broken === "pixel" ? "bit" : "pixel";
  const helperSkin = helper === "bit" ? BIT_PALE : PALE_SKIN;
  const brokenSkin = broken === "bit" ? BIT_PALE : PALE_SKIN;

  return (
    <div className="flex items-end gap-1">
      <PixelSprite
        size={Math.round(size * 0.42)}
        kind={helper}
        kit={helper === "bit" ? "lecture" : null}
        waving
        {...helperSkin}
      />
      <RepairingPixel size={size} kind={broken} {...brokenSkin} />
    </div>
  );
};

export default PixelSprite;
