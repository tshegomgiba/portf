import React, { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { getTalk } from "./dialogue";

const SKIP = "a, button, input, textarea, select, nav, canvas, [role='button'], [data-sound-toggle], [data-control-dock], [data-listen-chip]";
const COPY = "p, h1, h2, h3, h4, h5, li, blockquote, figcaption, dd, dt";

const caretRange = (x, y) => {
  if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
  const pos = document.caretPositionFromPoint?.(x, y);
  if (!pos?.offsetNode) return null;
  const range = document.createRange();
  range.setStart(pos.offsetNode, pos.offset);
  range.collapse(true);
  return range;
};

const hostOf = (node) => {
  if (!node) return null;
  return node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
};

const isCopy = (node) => {
  const el = hostOf(node);
  if (!el?.closest) return false;
  if (el.closest(SKIP)) return false;
  return Boolean(el.closest(COPY));
};

const paintRects = (range) => {
  if (!range) return [];
  try {
    return [...range.getClientRects()]
      .filter((box) => box.width > 1 && box.height > 1)
      .map((box) => ({
        left: box.left - 2,
        top: box.top,
        width: box.width + 4,
        height: box.height + 1,
      }));
  } catch {
    return [];
  }
};

const chipPos = (marks) => {
  if (!marks.length) return { left: 16, top: 16 };
  const last = marks[marks.length - 1];
  let left = last.left + last.width + 8;
  let top = last.top + last.height / 2 - 15;
  if (left + 132 > window.innerWidth - 12) {
    left = Math.max(12, marks[0].left);
    top = last.top + last.height + 8;
  }
  const phone = window.matchMedia("(max-width: 767px)").matches;
  const maxTop = window.innerHeight - (phone ? 108 : 48);
  if (top < 8) top = 8;
  if (top > maxTop) top = maxTop;
  return { left, top };
};

const sentenceAround = (x, y) => {
  const caret = caretRange(x, y);
  if (!caret || !isCopy(caret.startContainer)) return null;
  const host = hostOf(caret.startContainer)?.closest(COPY);
  if (!host) return null;

  const pieces = [];
  let full = "";
  const walk = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const node = walk.currentNode;
    if (!node.textContent) continue;
    pieces.push({
      node,
      start: full.length,
      end: full.length + node.textContent.length,
    });
    full += node.textContent;
  }
  if (!pieces.length) return null;

  let offset = 0;
  const hit = pieces.find((piece) => piece.node === caret.startContainer);
  if (hit) offset = hit.start + caret.startOffset;
  else {
    const parent = hostOf(caret.startContainer);
    if (!host.contains(parent)) return null;
  }

  let start = 0;
  let end = full.length;
  const cuts = /[.!?]["'”’)]*(?:\s+|$)/g;
  let cut;
  while ((cut = cuts.exec(full))) {
    const after = cut.index + cut[0].length;
    if (after <= offset) start = after;
    else {
      end = cut.index + cut[0].replace(/\s+$/, "").length;
      break;
    }
  }

  while (start < end && /\s/.test(full[start])) start += 1;
  while (end > start && /\s/.test(full[end - 1])) end -= 1;
  if (end - start < 12) return null;

  const from = pieces.find((piece) => start >= piece.start && start <= piece.end) ?? pieces[0];
  const to = [...pieces].reverse().find((piece) => end >= piece.start && end <= piece.end) ?? pieces[pieces.length - 1];
  const range = document.createRange();
  range.setStart(from.node, Math.min(from.node.textContent.length, Math.max(0, start - from.start)));
  range.setEnd(to.node, Math.min(to.node.textContent.length, Math.max(0, end - to.start)));

  const text = full.slice(start, end).replace(/\s+/g, " ").trim();
  if (!text) return null;
  return { range, text };
};

const ReadAlong = () => {
  const [marks, setMarks] = useState([]);
  const [chip, setChip] = useState(null);
  const [listening, setListening] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const live = useRef(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const moved = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const dismissAt = useRef();
  const wanted = useRef("");

  const paint = () => {
    const range = live.current?.range;
    if (!range) {
      setMarks([]);
      setChip(null);
      return;
    }
    const next = paintRects(range);
    setMarks(next);
    setChip(next.length ? chipPos(next) : null);
  };

  const clearMark = () => {
    live.current = null;
    wanted.current = "";
    setWaiting(false);
    setMarks([]);
    setChip(null);
    getTalk().stopRead();
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => getTalk().on((beat) => {
    const reading = beat?.tag === "Read";
    setListening(reading);
    if (reading) setWaiting(false);
    if (!reading && wanted.current && !getTalk().busy) {
      wanted.current = "";
      setWaiting(false);
    }
  }), []);

  useEffect(() => {
    const down = (event) => {
      if (event.target?.closest?.("[data-listen-chip]")) return;
      moved.current = false;
      origin.current = { x: event.clientX, y: event.clientY };

      clearTimeout(dismissAt.current);
      if (!live.current) return;
      dismissAt.current = setTimeout(() => {
        if (live.current) clearMark();
      }, 560);
    };

    const move = (event) => {
      if (Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 10) {
        moved.current = true;
      }
    };

    const up = (event) => {
      if (event.target?.closest?.("[data-listen-chip], " + SKIP)) return;
      if (moved.current) return;

      const now = performance.now();
      const dt = now - lastTap.current.t;
      const dist = Math.hypot(event.clientX - lastTap.current.x, event.clientY - lastTap.current.y);
      lastTap.current = { t: now, x: event.clientX, y: event.clientY };

      if (dt < 50 || dt > 520 || dist > 32) return;

      const hit = sentenceAround(event.clientX, event.clientY);
      if (!hit) return;

      clearTimeout(dismissAt.current);
      wanted.current = "";
      setWaiting(false);
      getTalk().stopRead();
      live.current = hit;
      window.getSelection()?.removeAllRanges();
      paint();
    };

    const key = (event) => {
      if (event.key === "Escape") clearMark();
    };

    const dbl = (event) => {
      if (!live.current && !isCopy(event.target)) return;
      event.preventDefault();
      window.getSelection()?.removeAllRanges();
    };

    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("dblclick", dbl);
    window.addEventListener("keydown", key);
    const onScroll = () => {
      if (!live.current?.range) return;
      paint();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      clearTimeout(dismissAt.current);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("dblclick", dbl);
      window.removeEventListener("keydown", key);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const hear = () => {
    const text = live.current?.text;
    if (!text) return;
    if (listening || waiting) {
      wanted.current = "";
      setWaiting(false);
      getTalk().stopRead();
      return;
    }
    const talk = getTalk();
    talk.readPassage(text);
    if (talk.reading !== text) return;
    wanted.current = text;
    if (talk.busy && talk.current?.tag !== "Read") setWaiting(true);
  };

  if (!marks.length) return null;

  const label = listening ? "Stop" : waiting ? "After this" : "Hear this";

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[45]" aria-hidden="true">
        {marks.map((mark, i) => (
          <span
            key={`${mark.left}-${mark.top}-${i}`}
            className="site-mark"
            style={{
              left: mark.left,
              top: mark.top,
              width: mark.width,
              height: mark.height,
              borderRadius:
                i === 0
                  ? "0.55rem 0.28rem 0.28rem 0.55rem"
                  : i === marks.length - 1
                    ? "0.28rem 0.55rem 0.55rem 0.28rem"
                    : "0.22rem",
            }}
          />
        ))}
      </div>
      {chip && (
        <button
          type="button"
          data-listen-chip
          onClick={hear}
          aria-label={label}
          className="listen-chip"
          style={{ left: chip.left, top: chip.top }}
        >
          {listening ? <Square size={11} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          {label}
        </button>
      )}
    </>
  );
};

export default ReadAlong;
