import * as THREE from "three";

/**
 * The hologram thrown up off the companion's laptop on Experience.
 * It stays an editor: the companion types, pauses, and starts the next pass.
 * The live project screenshots live on the Work gallery, not here.
 */

const W = 512;
const H = 320;

const SYNTAX = {
  kw: "#7ec8e3",
  fn: "#ffd479",
  str: "#9ee6b4",
  op: "#8aa0b4",
  txt: "#dfe8f1",
  cmt: "#5f7d92",
};

const CODE = [
  [["// portfolio.build", "cmt"]],
  [["import", "kw"], [" { ship } ", "txt"], ["from", "kw"], [" 'core'", "str"]],
  [],
  [["export", "kw"], [" async ", "kw"], ["function", "kw"], [" build", "fn"], ["() {", "op"]],
  [["  const", "kw"], [" ui = ", "txt"], ["await", "kw"], [" render", "fn"], ["()", "op"]],
  [["  ui.", "txt"], ["mount", "fn"], ["(", "op"], ["'#root'", "str"], [")", "op"]],
  [["  return", "kw"], [" ship", "fn"], ["(ui)", "op"]],
  [["}", "op"]],
];

const CODE_LENGTH = CODE.reduce(
  (total, line) => total + line.reduce((n, [text]) => n + text.length, 0) + 1,
  0
);

const CODE_TIME = 7.2;
const HOLD = 1.6;

export const makeScreen = () => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  let clock = 0;
  let blink = 0;
  let last = "";

  const lights = (y) => {
    ["#e8836a", "#ffd479", "#7ec8e3"].forEach((dot, i) => {
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(24 + i * 22, y, 5.5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const editor = (typed, caret) => {
    ctx.fillStyle = "#0b1620";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#16232f";
    ctx.fillRect(0, 0, W, 34);
    lights(17);

    ctx.font = "17px monospace";
    ctx.textBaseline = "middle";
    const charW = ctx.measureText("M").width;

    let budget = typed;
    let y = 58;
    let caretX = 44;
    let caretY = y;

    for (let row = 0; row < CODE.length; row += 1) {
      ctx.fillStyle = "#2c4356";
      ctx.fillText(String(row + 1).padStart(2, " "), 12, y);

      let x = 44;
      for (const [text, tone] of CODE[row]) {
        if (budget <= 0) break;
        const slice = text.slice(0, budget);
        ctx.fillStyle = SYNTAX[tone];
        ctx.fillText(slice, x, y);
        x += slice.length * charW;
        budget -= slice.length;
      }

      caretX = x;
      caretY = y;
      if (budget <= 0) break;

      budget -= 1;
      y += 30;
    }

    if (caret) {
      ctx.fillStyle = "#7ec8e3";
      ctx.fillRect(caretX + 1, caretY - 10, 2, 20);
    }
  };

  /**
   * @param {number} delta   seconds since the last frame
   * @param {number} energy  how hard the companion is typing, 0 to 1
   */
  const advance = (delta, energy) => {
    clock += delta * (energy || 1);
    const span = CODE_TIME + HOLD;
    if (clock >= span) clock -= span;

    blink += delta;

    const at = Math.min(clock / CODE_TIME, 1);
    const typed = Math.min(Math.floor(at * CODE_LENGTH * 1.3), CODE_LENGTH);
    const caret = clock < CODE_TIME && Math.floor(blink * 2) % 2 === 0;
    const key = `code ${typed} ${caret}`;

    if (key !== last) {
      editor(typed, caret);
      texture.needsUpdate = true;
      last = key;
    }
  };

  editor(0, true);

  return { texture, advance, dispose: () => texture.dispose() };
};
