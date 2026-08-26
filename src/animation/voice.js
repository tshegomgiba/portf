/**
 * Pixel and Bit use the same browser voice setup: the voice that already
 * sounds natural, at Pixel's pitch and pace. Chrome only unlocks speech
 * after a click.
 */

import { duckAtmosphere, liftAtmosphere, isAtmosphereOn, watchAtmosphere } from "./atmosphere";

let armed = false;
let talking = null;
let pending = null;
let pixelVoice = null;
let bitVoice = null;
let voicesReady = false;
let queue = [];
let busy = false;
let gen = 0;

const REPEAT_KEY = "pixel-repeat";
let repeating =
  typeof window !== "undefined" && window.localStorage.getItem(REPEAT_KEY) === "1";
const repeatWatchers = new Set();

let muted = !isAtmosphereOn();

const cutSpeech = () => {
  if (talking) talking.volume = 0;
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  window.setTimeout(() => window.speechSynthesis.cancel(), 0);
};

if (typeof window !== "undefined") {
  watchAtmosphere((playing) => {
    muted = !playing;
    if (muted) cutSpeech();
  });
}

export const isSpeechMuted = () => muted;

const tellRepeat = () => repeatWatchers.forEach((fn) => fn(repeating));

export const isRepeatOn = () => repeating;

export const watchRepeat = (fn) => {
  repeatWatchers.add(fn);
  return () => repeatWatchers.delete(fn);
};

export const toggleRepeat = () => {
  repeating = !repeating;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REPEAT_KEY, repeating ? "1" : "0");
  }
  if (!repeating) hush();
  tellRepeat();
  return repeating;
};

const TONE = {
  pixel: { pitch: 1.22, rate: 1.08 },
  bit: { pitch: 1.22, rate: 1.08 },
};

const SAME = {
  pixel: { pitch: 1.22, rate: 1.08 },
  bit: { pitch: 1.22, rate: 1.08 },
};

const arm = () => {
  if (armed || typeof window === "undefined" || !window.speechSynthesis) return;
  armed = true;
  const kick = new SpeechSynthesisUtterance(" ");
  kick.volume = 0;
  window.speechSynthesis.speak(kick);
  window.speechSynthesis.cancel();
};

const englishPool = () => {
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => /^en/i.test(voice.lang));
  return english.length ? english : voices;
};

const MALE = /male|david|mark|george|daniel|thomas|guy|fred|ravi|ryan|james|john|matthew|steffan/i;

const quality = (voice) => {
  const n = `${voice.name} ${voice.lang}`;
  if (MALE.test(n)) return -8;
  if (/online|natural|neural/i.test(n)) return 10;
  if (/microsoft zira/i.test(n)) return 9;
  if (/microsoft (jenny|aria|sara|sonia|libby|hazel|catherine)/i.test(n)) return 8;
  if (/samantha|moira|karen|tessa|fiona|serena|veena/i.test(n)) return 7;
  if (/microsoft/i.test(n) && /female|zira/i.test(n)) return 6;
  if (/female|woman/i.test(n) && !/google/i.test(n)) return 5;
  if (/google uk english female/i.test(n)) return 2;
  if (/google/i.test(n)) return 1;
  return 0;
};

const named = (pool, tests, skip) => {
  for (const test of tests) {
    const hit = pool.find((voice) => test.test(voice.name) && voice !== skip);
    if (hit) return hit;
  }
  return null;
};

const pickVoices = () => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const pool = englishPool();
  if (!pool.length) return;

  voicesReady = true;
  const ranked = [...pool].sort((a, b) => quality(b) - quality(a));

  const natural = [
    /microsoft (zira|jenny|aria|sara)/i,
    /samantha/i,
    /karen/i,
    /female/i,
  ];

  pixelVoice = named(ranked, natural);
  bitVoice = named(ranked, natural, pixelVoice);

  if (!pixelVoice) pixelVoice = ranked.find((voice) => quality(voice) >= 5) ?? pool[0];
  if (!bitVoice) bitVoice = pixelVoice;
};

const voiceFor = (who) => {
  if (!voicesReady) pickVoices();
  return who === "bit" ? bitVoice : pixelVoice;
};

if (typeof window !== "undefined") {
  const unlock = (event) => {
    if (event.target?.closest?.("[data-sound-toggle]")) return;
    arm();
    window.removeEventListener("pointerdown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.speechSynthesis?.getVoices();
  window.speechSynthesis?.addEventListener("voiceschanged", () => {
    voicesReady = false;
    pixelVoice = null;
    bitVoice = null;
    pickVoices();
  });
}

const finish = (item, token) => {
  if (token !== gen) return;
  talking = null;
  liftAtmosphere();
  try {
    item.onend?.();
  } catch {
    /* the scene may have unmounted */
  }
  pending = setTimeout(() => {
    pending = null;
    if (token !== gen) return;
    busy = false;
    pump();
  }, 300);
};

const utter = (item, token) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    finish(item, token);
    return;
  }

  if (muted) {
    pending = setTimeout(() => {
      pending = null;
      if (token !== gen) return;
      finish(item, token);
    }, Math.min(4200, 650 + item.text.length * 42));
    return;
  }

  arm();
  duckAtmosphere();

  const who = item.who === "bit" ? "bit" : "pixel";
  const line = new SpeechSynthesisUtterance(item.text);
  const voice = voiceFor(who);
  if (voice) line.voice = voice;
  if (voice?.lang) line.lang = voice.lang;

  const shared = !pixelVoice || pixelVoice === bitVoice;
  const tone = (shared ? SAME : TONE)[who];
  line.pitch = tone.pitch;
  line.rate = tone.rate;
  line.volume = 0.94;
  talking = line;

  let closed = false;
  const done = () => {
    if (closed || token !== gen) return;
    closed = true;
    clearTimeout(failsafe);
    finish(item, token);
  };

  const failsafe = setTimeout(done, Math.min(45000, 1600 + item.text.length * 70));
  line.onend = done;
  line.onerror = done;

  setTimeout(() => {
    if (token !== gen || talking !== line) return;
    if (muted) {
      done();
      return;
    }
    window.speechSynthesis.speak(line);
  }, 40);
};

const pump = () => {
  if (busy || !queue.length) return;
  const next = queue.shift();
  busy = true;
  utter(next, gen);
};

export const hush = () => {
  gen += 1;
  queue = [];
  busy = false;
  talking = null;
  if (pending) {
    clearTimeout(pending);
    pending = null;
  }
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  liftAtmosphere();
};

export const speak = (text, { who = "pixel", onend } = {}) => {
  if (!text) {
    onend?.();
    return;
  }
  queue.push({ text, who, onend });
  pump();
};

export { cutSpeech };
