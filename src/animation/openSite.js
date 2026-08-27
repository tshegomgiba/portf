/**
 * Opens a live project or company site after Pixel and Bit send the visitor
 * off. The tab is created on the click so the browser does not block it, but
 * it stays blank until the wave and both lines have landed. If the visitor
 * stays on the page, Bit waits. If they leave and come back, one of them
 * welcomes them.
 */

import { getTalk } from "./dialogue";
import { isAutoScrollOn } from "./autoScroll";

let watch = null;

const stayHere = (tab) => {
  try {
    tab?.blur();
  } catch {
    /* some browsers refuse to blur a new tab */
  }
  window.focus();
};

const here = () =>
  document.visibilityState === "visible" && document.hasFocus();

const dropWatch = () => {
  if (!watch) return;
  watch();
  watch = null;
};

const armWatch = () => {
  dropWatch();
  const talk = getTalk();
  talk.waiting = true;

  let left = false;
  let leftAt = 0;
  let hoverTimer = 0;
  let stayTimer = 0;

  const goneLongEnough = () => left && performance.now() - leftAt > 500;

  const noteLeft = () => {
    left = true;
    leftAt = performance.now();
  };

  const onBack = () => {
    if (!talk.waiting) {
      dropWatch();
      return;
    }
    if (!here()) return;
    if (!goneLongEnough()) return;
    talk.welcomeBack(isAutoScrollOn());
    dropWatch();
  };

  const onVis = () => {
    if (document.visibilityState === "hidden") {
      noteLeft();
      return;
    }
    onBack();
  };

  const onHover = () => {
    if (!talk.waiting || !here() || goneLongEnough()) return;
    window.clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => {
      if (!talk.waiting || !here() || goneLongEnough()) return;
      talk.waitHere();
    }, 1400);
  };

  stayTimer = window.setTimeout(() => {
    if (!talk.waiting || !here() || left) return;
    talk.waitHere();
  }, 900);

  // Still on the page after a site click: let them look around, then unpause
  // the tour so it is not stuck on this section forever.
  const lingerTimer = window.setTimeout(() => {
    if (!talk.waiting || !here() || left) return;
    talk.lookAround();
    dropWatch();
  }, 8000);

  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("focus", onBack);
  window.addEventListener("blur", noteLeft);
  window.addEventListener("pointermove", onHover, { passive: true });

  if (!here()) noteLeft();

  watch = () => {
    window.clearTimeout(hoverTimer);
    window.clearTimeout(stayTimer);
    window.clearTimeout(lingerTimer);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("focus", onBack);
    window.removeEventListener("blur", noteLeft);
    window.removeEventListener("pointermove", onHover);
  };
};

export const openWatchedSite = (event, url, name) => {
  if (!url) return;
  event?.preventDefault();
  event?.stopPropagation();

  let tab = null;
  try {
    tab = window.open("about:blank", "_blank");
  } catch {
    tab = null;
  }

  stayHere(tab);
  window.requestAnimationFrame(() => stayHere(tab));

  let sent = false;
  const go = () => {
    if (sent) return;
    sent = true;
    armWatch();
    try {
      if (tab && !tab.closed) {
        tab.location.replace(url);
        tab.focus();
        return;
      }
    } catch {
      /* some browsers lock about:blank after a delay */
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  getTalk().present(name, go);
  window.setTimeout(go, 10000);
};
