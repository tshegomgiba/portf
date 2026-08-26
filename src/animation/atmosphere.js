/**
 * Soft glacier bed for the page. Slow pads, a little wind, and the odd high
 * note. Nothing with a beat. Starts after the first click, and ducks whenever
 * Pixel talks so the two do not fight.
 */

const KEY = "atmosphere-on";
const BED = 0.18;
const DUCKED = 0.055;

let ctx;
let master;
let started = false;
let ducked = false;
let noteTimer;
const live = [];

const wanted = () => {
  if (typeof window === "undefined") return true;
  const saved = window.localStorage.getItem(KEY);
  return saved === null ? true : saved === "1";
};

let on = wanted();
const listeners = new Set();

const tell = () => listeners.forEach((fn) => fn(on));

const getCtx = () => {
  if (!ctx) ctx = new AudioContext();
  return ctx;
};

const fade = (value, seconds) => {
  if (!master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(value, now + seconds);
};

const tone = (freq, type, level, detune = 0) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.value = level;
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  live.push(osc);
  return osc;
};

const lfo = (target, depth, rate, offset) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = rate;
  gain.gain.value = depth;
  osc.connect(gain);
  gain.connect(target);
  osc.start();
  live.push(osc);
  if (offset) target.value = offset;
};

const wind = () => {
  const length = ctx.sampleRate * 6;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 520;
  filter.Q.value = 0.7;

  const gain = ctx.createGain();
  gain.gain.value = 0.055;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start();
  live.push(source);
  lfo(filter.frequency, 90, 0.03, 520);
};

const chime = () => {
  if (!started || !on || !ctx) return;

  // D minor pentatonic, high and thin, like ice.
  const notes = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33];
  const freq = notes[Math.floor(Math.random() * notes.length)];
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.value = freq;
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  gain.gain.value = 0;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.07, now + 2.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 9);

  osc.start(now);
  osc.stop(now + 9.2);
  live.push(osc);

  noteTimer = window.setTimeout(chime, 10000 + Math.random() * 9000);
};

const build = () => {
  const audio = getCtx();
  master = audio.createGain();
  master.gain.value = 0;
  master.connect(audio.destination);

  // Low drone
  tone(73.42, "sine", 0.11);
  tone(110, "sine", 0.07, 6);

  // Slow pad
  const pad = ctx.createOscillator();
  const padB = ctx.createOscillator();
  const padGain = ctx.createGain();
  const padFilter = ctx.createBiquadFilter();
  pad.type = "sine";
  padB.type = "triangle";
  pad.frequency.value = 146.83;
  padB.frequency.value = 220;
  padB.detune.value = 8;
  padFilter.type = "lowpass";
  padFilter.frequency.value = 640;
  padFilter.Q.value = 0.4;
  padGain.gain.value = 0.09;
  pad.connect(padFilter);
  padB.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(master);
  pad.start();
  padB.start();
  live.push(pad, padB);
  lfo(padFilter.frequency, 180, 0.035, 640);

  wind();
  fade(BED, 5.5);
  noteTimer = window.setTimeout(chime, 7000);
};

export const startAtmosphere = () => {
  if (typeof window === "undefined" || started || !on) return;
  started = true;
  const audio = getCtx();
  if (audio.state === "suspended") audio.resume();
  build();
};

export const duckAtmosphere = () => {
  if (!started || !on || ducked) return;
  ducked = true;
  fade(DUCKED, 0.25);
};

export const liftAtmosphere = () => {
  if (!started || !on) return;
  ducked = false;
  fade(BED, 1.1);
};

export const isAtmosphereOn = () => on;

export const toggleAtmosphere = () => {
  on = !on;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  }
  // Tell listeners before touching the audio graph so voices cut on the
  // same click, not after the pads have already started winding down.
  tell();

  if (on) {
    if (!started) startAtmosphere();
    else {
      const wake = ctx?.state === "suspended" ? ctx.resume() : Promise.resolve();
      Promise.resolve(wake).finally(() => {
        if (!on || !started) return;
        ducked = false;
        fade(BED, 1.4);
        if (!noteTimer) noteTimer = window.setTimeout(chime, 3500);
      });
    }
  } else {
    ducked = false;
    if (noteTimer) {
      clearTimeout(noteTimer);
      noteTimer = undefined;
    }
    if (master && ctx) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(0, now);
    }
    ctx?.suspend?.();
  }

  return on;
};

export const watchAtmosphere = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

if (typeof window !== "undefined") {
  const kickoff = (event) => {
    if (event.target?.closest?.("[data-sound-toggle]")) return;
    startAtmosphere();
    window.removeEventListener("pointerdown", kickoff);
  };
  window.addEventListener("pointerdown", kickoff, { passive: true });
}
