/**
 * Serves Bit's neural teacher voice. Chrome's built-in TTS cannot do this;
 * Microsoft's neural voices can. Same origin so the page can play the clip.
 */
import { EdgeTTS } from "edge-tts-universal";

const VOICE = "en-GB-SoniaNeural";
const cache = new Map();

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

const handle = async (req, res) => {
  let text = "";
  if (req.method === "GET") {
    const url = new URL(req.url, "http://bit.local");
    text = url.searchParams.get("text") || "";
  } else {
    try {
      const raw = await readBody(req);
      text = JSON.parse(raw).text || "";
    } catch {
      text = "";
    }
  }

  text = String(text).replace(/\s+/g, " ").trim().slice(0, 600);
  if (!text) {
    res.statusCode = 400;
    res.end();
    return;
  }

  try {
    let buf = cache.get(text);
    if (!buf) {
      const tts = new EdgeTTS(text, VOICE, {
        rate: "-6%",
        volume: "+0%",
        pitch: "+0Hz",
      });
      const result = await tts.synthesize();
      buf = Buffer.from(await result.audio.arrayBuffer());
      if (cache.size > 64) {
        const first = cache.keys().next().value;
        cache.delete(first);
      }
      cache.set(text, buf);
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.end(buf);
  } catch {
    res.statusCode = 502;
    res.end();
  }
};

const mount = (server) => {
  server.middlewares.use((req, res, next) => {
    const path = req.url?.split("?")[0];
    if (path !== "/api/bit-voice") return next();
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }
    if (req.method !== "GET" && req.method !== "POST") return next();
    handle(req, res).catch(next);
  });
};

export const bitVoicePlugin = () => ({
  name: "bit-voice",
  configureServer: mount,
  configurePreviewServer: mount,
});
