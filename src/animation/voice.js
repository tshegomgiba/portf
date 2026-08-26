/**
 * Pixel and Bit use the same browser voice setup. Desktop prefers Microsoft
 * and Mac voices. Phones get the natural Siri, Samantha, and Google female
 * voices instead of the default robot. iOS only unlocks speech after a tap.
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
let resumeTimer;

const REPEAT_KEY = "pixel-repeat";
let repeating =
  typeof window !== "undefined" && window.localStorage.getItem(REPEAT_KEY) === "1";
const repeatWatchers = new Set();

let muted = !isAtmosphereOn();
let live = null;

const phone = () => {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const ios = () => {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const cutSpeech = () => {
  if (talking) talking.volume = 0;
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  window.setTimeout(() => window.speechSynthesis.cancel(), 0);
};

if (typeof window !== "undefined") {
  const kill = () => {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* speech may be missing */
    }
  };
  kill();
  window.addEventListener("load", kill);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) kill();
  });
  watchAtmosphere((playing) => {
    muted = !playing;
    if (muted) {
      cutSpeech();
      return;
    }
    arm();
    if (live && live.token === gen && pending) {
      clearTimeout(pending);
      pending = null;
      play(live.item, live.token);
    }
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

const TONE = phone()
  ? {
      pixel: { pitch: 1.04, rate: 1.0 },
      bit: { pitch: 1.04, rate: 1.0 },
    }
  : {
      pixel: { pitch: 1.22, rate: 1.08 },
      bit: { pitch: 1.22, rate: 1.08 },
    };

const SAME = TONE;

const arm = () => {
  if (armed || typeof window === "undefined" || !window.speechSynthesis) return;
  armed = true;
  const kick = new SpeechSynthesisUtterance(" ");
  kick.volume = 0;
  kick.rate = 1;
  kick.pitch = 1;
  window.speechSynthesis.speak(kick);
  // iOS treats cancel() as the unlock failing. Leave the quiet kick to finish.
  if (!ios()) window.speechSynthesis.cancel();
};

const englishPool = () => {
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => /^en/i.test(voice.lang));
  return english.length ? english : voices;
};

const MALE = /male|david|mark|george|daniel|thomas|guy|fred|ravi|ryan|james|john|matthew|steffan|aaron|fred|rishi|daniel/i;

const quality = (voice) => {
  const n = `${voice.name} ${voice.lang}`;
  if (MALE.test(n) && !/female/i.test(n)) return -8;
  if (/siri/i.test(n)) return 12;
  if (/enhanced|premium|neural|natural|wavenet|online/i.test(n)) return 11;
  if (/microsoft (jenny|aria|sara|zira)/i.test(n)) return 10;
  if (/samantha|nicky|allison|ava|zoe|susan/i.test(n)) return 9;
  if (/karen|moira|tessa|fiona|serena|veena/i.test(n)) return 8;
  if (/google uk english female/i.test(n)) return 7;
  if (/google us english/i.test(n)) return 6;
  if (/samsung/i.test(n) && /female|en-us|english/i.test(n)) return 6;
  if (/microsoft/i.test(n) && /female|zira/i.test(n)) return 6;
  if (/female|woman/i.test(n)) return 5;
  if (/en-US|en_US/i.test(voice.lang) && voice.localService) return 4;
  if (/google/i.test(n)) return 3;
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
    /siri/i,
    /samantha/i,
    /nicky|allison|ava|zoe/i,
    /microsoft (zira|jenny|aria|sara)/i,
    /karen/i,
    /moira|tessa/i,
    /google uk english female/i,
    /google us english/i,
    /female/i,
  ];

  pixelVoice = named(ranked, natural);
  bitVoice = named(ranked, natural, pixelVoice);

  if (!pixelVoice) pixelVoice = ranked.find((voice) => quality(voice) >= 4) ?? pool[0];
  if (!bitVoice) bitVoice = pixelVoice;
};

const voiceFor = (who) => {
  pickVoices();
  return who === "bit" ? bitVoice : pixelVoice;
};

const keepAlive = () => {
  if (!ios() || typeof window === "undefined") return;
  if (resumeTimer) return;
  resumeTimer = window.setInterval(() => {
    if (!window.speechSynthesis.speaking || muted) return;
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 9000);
};

const unlock = () => {
  arm();
  pickVoices();
  if (live && live.token === gen && pending) {
    clearTimeout(pending);
    pending = null;
    play(live.item, live.token);
  }
  window.removeEventListener("pointerdown", unlock);
  window.removeEventListener("touchstart", unlock);
};

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
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
  if (live?.item === item) live = null;
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
  }, 50);
};

const speakNow = (item, token, line) => {
  if (token !== gen || talking !== line) return;
  if (muted) {
    line.onend?.();
    return;
  }
  window.speechSynthesis.speak(line);
};

const play = (item, token) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    finish(item, token);
    return;
  }

  const run = () => {
    if (token !== gen) return;

    arm();
    duckAtmosphere();
    keepAlive();

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

    // A delay drops the user-gesture unlock on iOS and most Android browsers.
    if (phone()) speakNow(item, token, line);
    else setTimeout(() => speakNow(item, token, line), 40);
  };

  pickVoices();
  if (voicesReady || !phone()) {
    run();
    return;
  }

  let started = false;
  const ready = () => {
    if (started || token !== gen) return;
    started = true;
    window.speechSynthesis.removeEventListener("voiceschanged", ready);
    run();
  };
  window.speechSynthesis.addEventListener("voiceschanged", ready);
  window.setTimeout(ready, 1200);
};

const utter = (item, token) => {
  live = { item, token };

  if (typeof window === "undefined" || !window.speechSynthesis) {
    finish(item, token);
    return;
  }

  if (muted) {
    pending = setTimeout(() => {
      pending = null;
      if (token !== gen) return;
      finish(item, token);
    }, Math.min(1600, 280 + item.text.length * 22));
    return;
  }

  play(item, token);
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
  live = null;
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
