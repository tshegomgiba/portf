/**
 * Opens a live project or company site after Pixel and Bit send the visitor
 * off. The tab is created on the click so the browser does not block it.
 */

import { getTalk } from "./dialogue";

export const openWatchedSite = (event, url, name) => {
  if (!url) return;
  event?.preventDefault();

  let tab = null;
  try {
    tab = window.open("about:blank", "_blank");
  } catch {
    tab = null;
  }

  let sent = false;
  const go = () => {
    if (sent) return;
    sent = true;
    try {
      if (tab && !tab.closed) {
        tab.location.replace(url);
        return;
      }
    } catch {
      /* some browsers lock about:blank after a delay */
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const talk = getTalk();
  if (!talk.opened) {
    go();
    return;
  }

  talk.present(name, go);
  window.setTimeout(go, 4500);
};
