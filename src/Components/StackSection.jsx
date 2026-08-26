import React from "react";

/**
 * Wraps a section so the next one slides up and covers it.
 *
 * The panel is held against the bottom of the screen, so once you have scrolled
 * to the end of a section it stops moving and stays there. The spacer underneath
 * it is what gives the panel room to be held, and the next slot is pulled up by
 * exactly that much, so the following section starts climbing the screen at the
 * same moment. The two cancel out and the page is no longer than it was.
 *
 * `index` sets the painting order. Each panel has to sit above the one it is
 * covering, and while document order would usually see to that on its own, it
 * stops being reliable the moment a section creates a stacking context. The
 * numbers stay small so every fixed overlay on the page still clears them.
 *
 * The last section takes no spacer: nothing comes along to cover it, so it has
 * no reason to be held.
 */
const StackSection = ({ children, index = 0, last = false }) => (
  <div className="stack-slot">
    <div className="stack-panel" style={{ zIndex: index + 1 }}>
      {children}
    </div>
    {!last && <div className="stack-spacer" aria-hidden="true" />}
  </div>
);

export default StackSection;
