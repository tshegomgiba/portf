import * as THREE from "three";
import { projects } from "../data/projects";

/**
 * The hologram thrown up off the companion's laptop.
 *
 * It runs the loop a developer actually runs: write the code, then open the
 * thing you built and look at it. The addresses are the real ones from the
 * projects list and the pages are the real screenshots, so the companion is
 * browsing the same sites the Work section links to, and adding a project to
 * the data file adds it to the rotation here.
 */

const W = 512;
const H = 320;
const CHROME = 46;
const VIEW = H - CHROME;

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

/** One pass of the loop, in seconds. */
const BEATS = [
  ["code", 7.2],
  ["open", 0.5],
  ["type", 1.5],
  ["load", 1.2],
  ["view", 4.4],
  ["leave", 0.5],
];

const CYCLE = BEATS.reduce((total, [, span]) => total + span, 0);

const beatAt = (clock) => {
  let start = 0;
  for (const [name, span] of BEATS) {
    if (clock < start + span) return { name, at: (clock - start) / span };
    start += span;
  }
  return { name: "leave", at: 1 };
};

// Shown the way a browser shows them: no protocol, no trailing slash.
const SITES = projects.map(({ link, image }) => ({
  image,
  address: (({ host, pathname }) => (host + pathname).replace(/\/$/, ""))(new URL(link)),
}));

const ease = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export const makeScreen = () => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const shots = SITES.map(({ image }) => {
    const img = new Image();
    img.src = image;
    return img;
  });

  let slot = 0;
  let clock = 0;
  let blink = 0;
  let since = 0;
  let last = "";

  /* ---- painting ---------------------------------------------------- */

  const pill = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  };

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

  /** The grey blocks a page shows itself as before the real thing arrives. */
  const skeleton = (alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#16232f";
    pill(0, CHROME, W, 42, 0);
    [
      [28, CHROME + 66, 300, 20],
      [28, CHROME + 96, 190, 20],
      [28, CHROME + 142, 210, 74],
      [252, CHROME + 142, 232, 74],
    ].forEach(([x, y, w, h]) => pill(x, y, w, h, 6));
    ctx.restore();
  };

  const page = (alpha) => {
    const shot = shots[slot];
    if (!shot.complete || !shot.naturalWidth) return;

    // Filled edge to edge: a letterboxed screenshot would read as a picture of
    // a site rather than a site.
    const scale = Math.max(W / shot.naturalWidth, VIEW / shot.naturalHeight);
    const w = shot.naturalWidth * scale;
    const h = shot.naturalHeight * scale;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.rect(0, CHROME, W, VIEW);
    ctx.clip();
    ctx.drawImage(shot, (W - w) / 2, CHROME + (VIEW - h) / 2, w, h);
    ctx.restore();
  };

  const pointer = (x, y, click) => {
    if (click > 0) {
      ctx.strokeStyle = "#7ec8e3";
      ctx.globalAlpha = 1 - click;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 6 + click * 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#16232f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 17);
    ctx.lineTo(x + 4.6, y + 12.8);
    ctx.lineTo(x + 7.4, y + 18.6);
    ctx.lineTo(x + 10, y + 17.4);
    ctx.lineTo(x + 7.2, y + 11.8);
    ctx.lineTo(x + 12.6, y + 11.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const browser = (name, at) => {
    const site = SITES[slot];

    // The window drops in, and folds away again on the way back to the editor.
    const slide =
      name === "open" ? 1 - ease(at) : name === "leave" ? ease(at) : 0;
    const dim = name === "leave" ? ease(at) : 1;

    ctx.fillStyle = "#0b1620";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(0, -slide * H);

    /* page */
    if (name === "load") skeleton(ease(clamp01(at * 2.5)) * 0.9);
    if (name === "view") {
      skeleton(0.9 * (1 - clamp01(at * 4)));
      page(ease(clamp01(at * 3.4)));

      // Reaches for something on the page, clicks, then rests.
      const reach = ease(clamp01((at - 0.16) / 0.3));
      const x = W - 74 + (0.34 * W - (W - 74)) * reach;
      const y = H - 44 + (CHROME + VIEW * 0.46 - (H - 44)) * reach;
      pointer(x, y, clamp01((at - 0.46) / 0.26));
    }
    if (name === "leave") page(1 - dim);

    /* chrome */
    ctx.fillStyle = "#16232f";
    ctx.fillRect(0, 0, W, CHROME);
    lights(23);

    ctx.fillStyle = "#0b1620";
    pill(78, 11, W - 96, 24, 12);

    // Padlock, so the bar reads as an address bar at a glance.
    ctx.strokeStyle = "#9ee6b4";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(93, 20.5, 3.2, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "#9ee6b4";
    pill(89.5, 20.5, 7, 6.5, 1.5);

    const shown =
      name === "type"
        ? site.address.slice(0, Math.ceil(ease(at) * site.address.length))
        : site.address;

    ctx.font = "15px monospace";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#dfe8f1";
    ctx.fillText(shown, 106, 23);

    if (name === "type" && Math.floor(blink * 2.4) % 2 === 0) {
      ctx.fillStyle = "#7ec8e3";
      ctx.fillRect(107 + ctx.measureText(shown).width, 14, 2, 18);
    }

    if (name === "load") {
      ctx.fillStyle = "#7ec8e3";
      ctx.fillRect(0, CHROME - 3, W * ease(at), 3);
    }

    ctx.restore();
  };

  /* ---- driving ----------------------------------------------------- */

  /**
   * @param {number} delta   seconds since the last frame
   * @param {number} energy  how hard the companion is typing, 0 to 1
   */
  const advance = (delta, energy) => {
    // The editor only fills up while its hands are on the keys, so the code
    // stops when it reaches for the mug. The browser runs on its own.
    clock += delta * (beatAt(clock).name === "code" ? energy : 1);
    if (clock >= CYCLE) {
      clock -= CYCLE;
      slot = (slot + 1) % SITES.length;
    }

    const beat = beatAt(clock);
    blink += delta;
    since += delta;

    // Uploading a 512 by 320 canvas to the GPU is not free, so the editor is
    // only repainted on a new character or a caret flip. The browser is always
    // moving and gets a steady, unhurried refresh instead.
    if (beat.name === "code") {
      const typed = Math.min(Math.floor(beat.at * CODE_LENGTH * 1.3), CODE_LENGTH);
      const caret = Math.floor(blink * 2) % 2 === 0;
      const key = `code ${typed} ${caret}`;

      if (key !== last) {
        editor(typed, caret);
        texture.needsUpdate = true;
        last = key;
      }
    } else if (since > 1 / 22) {
      browser(beat.name, beat.at);
      texture.needsUpdate = true;
      since = 0;
      last = beat.name;
    }
  };

  editor(0, true);

  return { texture, advance, dispose: () => texture.dispose() };
};
