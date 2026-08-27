/**
 * Opens a live project or company site after Pixel and Bit send the visitor
 * off. The tab is created on the click so the browser does not block it, but
 * it stays blank until the wave and both lines have landed.
 */

import { getTalk } from "./dialogue";

const stayHere = (tab) => {
  try {
    tab?.blur();
  } catch {
    /* some browsers refuse to blur a new tab */
  }
  window.focus();
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
