/**
 * One owner for boot and restart. Audio unmute and dialogue start are
 * separate steps so turning sound on cannot re-run the talk effect.
 */

import { enableAtmosphere } from "./atmosphere";
import { hush } from "./voice";
import { getTalk } from "./dialogue";
import { stopAutoScroll } from "./autoScroll";

let session = 0;
let booted = false;
let startQueued = false;
const listeners = new Set();

const tell = () => listeners.forEach((fn) => fn(session));

const goHome = () => {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "auto" });
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
};

export const getSession = () => session;

export const watchSession = (fn) => {
  listeners.add(fn);
  fn(session);
  return () => listeners.delete(fn);
};

/** First load: unmute once, then start talk once. Safe to call again. */
export const bootExperience = () => {
  enableAtmosphere();
  if (booted) return;
  booted = true;
  getTalk().begin();
};

/** Restart button: new session id remounts companions, talk starts at line one. */
export const restartExperience = () => {
  stopAutoScroll();
  hush();
  getTalk().reset();
  startQueued = true;
  session += 1;
  booted = true;
  tell();
  enableAtmosphere();
  goHome();
};

/** Called when a companion mounts. Starts queued Restart talk after remount. */
export const mountTalk = () => {
  if (!startQueued) return;
  startQueued = false;
  getTalk().begin(true);
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    booted = false;
    session = 0;
    startQueued = false;
  });
}
