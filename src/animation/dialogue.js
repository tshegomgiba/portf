/**
 * Pixel's mouth, and Bit's. Lines are short scenes so a thought can land,
 * pause, and pass to the other. Idle facts are split between them. They
 * never talk over each other; a joke is the exception, and they both laugh.
 */

import { hush as hushVoice, isSpeechMuted, speak } from "./voice";
import { lockScroll, unlockScroll } from "./scrollLock";
import { profile } from "../data/profile";

const intro = [
  "Hi, I'm Pixel. I'll ride along.",
  "Hi, I'm Bit.",
  "I'll walk you through each section.",
  "Keep scrolling and we'll follow you down.",
];

const onAbout = [
  `That's ${profile.spokenName} up there.`,
  "Diploma in IT, Software Development.",
];

const onExperience = [
  ["Three internships so far.", "Aucrada, Asante and Tshimologong."],
  ["Open a company if you want the full notes."],
];

const brain = [
  ["He doesn't need to know how something works. Unfortunately, he usually wants to."],
  ["He has a dangerous relationship with the words: What if..."],
  ["Give him a problem he doesn't understand. That's usually where things get interesting."],
  ["He doesn't particularly enjoy accepting that's just how it works."],
  [
    "His brain currently has approximately 47 tabs open.",
    "None of them are closed.",
    "Some of them aren't even related to the original problem.",
  ],
  ["He enjoys solving problems more than being given the solution."],
  ["He tends to ask why long after everyone else has moved on."],
  ["Sometimes curiosity is useful. Sometimes it creates a three-hour research session."],
  ["He has a habit of seeing systems where other people see features."],
  ["Tiny details have an unfortunate ability to become very important to him."],
];

const builder = [
  ["If he can't find exactly what he wants, his first instinct is usually: I'll build it."],
  ["He doesn't just want to build things. He wants to understand what happens underneath them."],
  ["Most projects start with an idea. His usually start with a question."],
  ["He likes turning vague ideas into actual systems."],
  ["He learns fastest when there's something difficult to build."],
  ["He'll build something from scratch purely because he wants to understand how it works."],
  ["He likes projects that force him to learn something he doesn't already know."],
  ["He cares about the engineering behind a product and the experience of using it."],
  ["He has a tendency to turn experiments into actual projects."],
  ["Sometimes the prototype becomes the product."],
  ["Sometimes the prototype becomes a completely different product."],
  ["There was probably a simpler way to build this.", "He chose not to investigate."],
];

const unhinged = [
  ["This started as a quick experiment.", "It was not quick."],
  ["He occasionally mistakes a random thought for a product opportunity."],
  ["A simple idea can become surprisingly complicated around here."],
  ["He has started projects because he couldn't stop thinking about an idea."],
  [
    "He has absolutely added features that nobody asked for.",
    "Then he convinced himself they were necessary.",
  ],
  ["He can turn a random thought into a feature specification surprisingly quickly."],
  ["The hardest part of some projects is convincing him to stop."],
  ["He sees a cool interaction and immediately starts wondering how he would build it."],
  ["He has an impressive amount of patience for things that refuse to work."],
  ["Bugs are apparently personal challenges now."],
  ["He has lost arguments with his own code.", "More than once."],
  ["Good enough and I can make this better have been fighting for years."],
];

const smart = [
  ["He doesn't collect answers. He collects better questions."],
  ["Most of his projects start with a question he couldn't leave alone."],
  ["He likes understanding the machine, not just pressing the button."],
  ["Give him something he doesn't know how to build. That's where he gets interested."],
  ["He likes turning that's impossible into okay, but what if..."],
  ["His favourite part of a project is usually the part he didn't know how to do when he started."],
  ["He doesn't just learn technologies. He tries to understand what they're capable of."],
  ["He likes building things that make people wonder how they work."],
];

const onStack = [
  [
    "He knows React, TypeScript, JavaScript...",
    "Actually, just keep scrolling. The list gets worse.",
  ],
  [
    "Write these down if they matter to you.",
    "He does not expect you to memorise the whole wall.",
  ],
  [
    "Don't worry if you don't recognize all of these.",
    "He probably didn't either when he started.",
  ],
];

const onProjects = [
  ["Three live builds down here.", "Go on, open one in a new tab."],
  [
    "Look at the work, not the labels.",
    "Open one. That is the assignment.",
  ],
  [
    "This project started with a simple question.",
    "Naturally, he decided to build the answer.",
  ],
  [
    "This one ran long.",
    "Most lessons do, once you start asking questions.",
  ],
];

const onCreative = [
  [
    "Software was the main subject.",
    "Then writing showed up as extra credit.",
    "The extra credit got out of hand.",
    "That is usually how it starts.",
  ],
  [
    "Developer.",
    "Writer.",
    "Creator.",
    "Professional overthinker.",
    "The last one wasn't on the CV.",
  ],
];

const linger = [
  ["Stay with this section a moment.", "The useful part is usually in the details."],
  [
    "You have been on this page for a while.",
    "That is how you actually learn it.",
  ],
];

const ending = [
  "Well...",
  "You made it to the end.",
  "You saw the projects.",
  "You saw the skills.",
  "That is the whole syllabus.",
  "You have officially seen enough evidence.",
  "So...",
  "Are you hiring him?",
];

const ghost = [
  "You sat through the whole lesson...",
  "...and left before office hours?",
  "Noted.",
];

const goodbye = [
  "That is the whole tour.",
  "Class dismissed.",
  "Taking you back to the start.",
];

const other = (who) => (who === "pixel" ? "bit" : "pixel");

const pick = (list, used, prefix) => {
  const open = list
    .map((_, i) => `${prefix}:${i}`)
    .filter((key) => !used.has(key));
  const keys = open.length ? open : list.map((_, i) => `${prefix}:${i}`);
  if (!open.length) {
    list.forEach((_, i) => used.delete(`${prefix}:${i}`));
  }
  const key = keys[Math.floor(Math.random() * keys.length)];
  used.add(key);
  return list[Number(key.split(":")[1])];
};

const chunkSpeech = (text) => {
  const bits = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const out = [];
  let buf = "";
  bits.forEach((part) => {
    const piece = part.trim();
    if (!piece) return;
    const next = buf ? `${buf} ${piece}` : piece;
    if (next.length > 180 && buf) {
      out.push(buf);
      buf = piece;
    } else {
      buf = next;
    }
  });
  if (buf) out.push(buf);
  return out.length ? out : [text];
};

const beatsFrom = (lines, tag, { who = "pixel", joke = false, banter = false } = {}) =>
  lines.map((text, i) => {
    let speaker = who;
    if (Array.isArray(who)) speaker = who[Math.min(i, who.length - 1)];
    else if (banter) speaker = i % 2 === 0 ? who : other(who);
    return {
      text,
      tag,
      who: speaker,
      joke: Boolean(joke) && i === lines.length - 1,
    };
  });

const SCRIPT = {
  top: ["intro"],
  about: ["about-0", "creative", "creative-2", "linger:about"],
  experience: ["experience-0", "experience-1", "linger:experience"],
  stack: ["stack-0", "stack-1", "stack-2", "linger:stack"],
  projects: ["projects-0", "projects-1", "projects-2", "projects-3", "linger:projects"],
  contact: ["ending", "ghost", "linger:contact"],
};

class CompanionTalk {
  constructor() {
    this.listeners = new Set();
    this.queue = [];
    this.timer = null;
    this.current = null;
    this.used = new Set();
    this.played = new Set();
    this.visited = new Set();
    this.lastIndex = 0;
    this.saidHello = false;
    this.dwell = 0;
    this.dwellSection = "";
    this.turn = "bit";
    this.stepping = false;
    this.seq = 0;
    this.opened = false;
    this.sentHome = false;
    this.reading = "";
    this.introDone = false;
    this.freshUntil = 0;
  }

  on(fn) {
    this.listeners.add(fn);
    fn(this.current);
    return () => this.listeners.delete(fn);
  }

  emit(beat) {
    this.listeners.forEach((fn) => fn(beat));
  }

  get heat() {
    return Math.min(1, this.visited.size / 5);
  }

  get busy() {
    return this.queue.length > 0 || this.stepping;
  }

  get holding() {
    return this.freshUntil > 0 && performance.now() < this.freshUntil;
  }

  say(lines, tag, opts = {}) {
    const { key, interrupt = false, ondone } = opts;
    if (interrupt) this.flush(false);
    if (key && this.played.has(key)) return false;
    if (key) this.played.add(key);
    const beats = beatsFrom(lines, tag, opts);
    if (ondone && beats.length) beats[beats.length - 1].ondone = ondone;
    beats.forEach((beat) => this.queue.push(beat));
    if (!this.stepping) this.step();
    return true;
  }

  flush(clearPlayed) {
    this.seq += 1;
    this.queue = [];
    this.stepping = false;
    this.current = null;
    this.emit(null);
    hushVoice();
    if (clearPlayed) this.played.clear();
  }

  step() {
    const beat = this.queue.shift();
    if (!beat) {
      this.stepping = false;
      return;
    }
    this.stepping = true;
    this.current = beat;
    this.emit(beat);
    const seq = this.seq;
    speak(beat.text, {
      who: beat.who === "both" ? "pixel" : beat.who,
      onend: () => {
        if (seq !== this.seq) return;
        this.after(beat);
      },
    });
  }

  after(beat) {
    if (beat.joke) {
      const seq = this.seq;
      this.current = { text: "Ha ha.", tag: "Joke", who: "both", laugh: true };
      this.emit(this.current);
      speak("Ha ha.", {
        who: "pixel",
        onend: () => {
          if (seq !== this.seq) return;
          speak("Ha.", {
            who: "bit",
            onend: () => {
              if (seq !== this.seq) return;
              const done = beat.ondone;
              this.step();
              if (done && !this.busy) done();
            },
          });
        },
      });
      return;
    }

    const seq = this.seq;
    const finish = () => {
      if (seq !== this.seq) return;
      const done = beat.ondone;
      this.step();
      if (done && !this.busy) done();
    };

    // Muted intro and sendoff still need time on screen so the lines can land.
    if (
      (beat.tag === "Visit" || beat.tag === "Intro") &&
      isSpeechMuted()
    ) {
      window.setTimeout(finish, Math.min(2600, 1100 + beat.text.length * 35));
      return;
    }

    finish();
  }

  get greeting() {
    return this.opened && !this.introDone;
  }

  get starting() {
    return this.opened && !this.introDone;
  }

  wipe() {
    this.flush(true);
    this.used.clear();
    this.visited.clear();
    this.lastIndex = 0;
    this.saidHello = false;
    this.dwell = 0;
    this.dwellSection = "top";
    this.turn = "bit";
    this.sentHome = false;
    this.reading = "";
    this.introDone = false;
    this.opened = false;
    this.freshUntil = 0;
    unlockScroll();
  }

  reset() {
    this.wipe();
  }

  /** Start a fresh session from the first line. `force` is Restart only. */
  begin(force = false) {
    if (this.opened && !force) return;
    this.wipe();
    this.opened = true;
    this.lastIndex = 0;
    this.dwellSection = "top";
    this.introDone = false;
    this.freshUntil = performance.now() + 900;
    lockScroll();
    this.arrive("top");
  }

  open() {
    this.begin();
  }

  arrive(section, replay = false) {
    if (!this.opened || !section) return;

    if (section === "top") {
      if (!replay && this.played.has("intro")) return;
      this.introDone = false;
      this.say(intro, "Intro", {
        key: "intro",
        interrupt: true,
        who: ["pixel", "bit", "bit", "pixel"],
        ondone: () => {
          this.introDone = true;
          window.setTimeout(() => unlockScroll(), 280);
        },
      });
      return;
    }
    if (this.greeting && !replay) return;

    if (section === "about") {
      this.say(onAbout, "Note", {
        key: "about-0",
        who: "pixel",
        banter: true,
        interrupt: true,
      });
    }
    if (section === "experience") {
      this.say(onExperience[0], "Note", {
        key: "experience-0",
        who: "pixel",
        banter: true,
        interrupt: true,
      });
    }
    if (section === "stack") {
      this.say(onStack[0], "Stack", {
        key: "stack-0",
        who: "pixel",
        banter: true,
        joke: true,
        interrupt: true,
      });
    }
    if (section === "projects") {
      this.say(onProjects[0], "Work", {
        key: "projects-0",
        who: "pixel",
        banter: true,
        interrupt: true,
      });
    }
    if (section === "contact") {
      this.say(ending, "Hello", {
        key: "ending",
        interrupt: true,
        who: ["pixel", "pixel", "pixel", "pixel", "bit", "pixel", "pixel", "bit"],
      });
    }
  }

  release(section) {
    (SCRIPT[section] || []).forEach((key) => this.played.delete(key));
  }

  enter(section, index) {
    if ((this.holding || this.starting) && section !== "top") return;

    if (section) this.visited.add(section);

    if (!this.opened) {
      this.lastIndex = index;
      if (section) this.dwellSection = section;
      return;
    }

    if (section === this.dwellSection) {
      this.lastIndex = index;
      return;
    }

    this.lastIndex = index;
    this.dwell = 0;
    if (section) this.dwellSection = section;

    if (section === "contact" && this.current?.tag !== "Goodbye") {
      this.sentHome = false;
    }

    if (section && section !== "top") this.introDone = true;
    this.flush(false);
    this.arrive(section);
  }

  linger(section, seconds, touring = false) {
    if (!this.opened || this.greeting || seconds < (touring ? 5 : 11) || this.busy) return;
    if (this.played.has(`linger:${section}`)) return;
    this.say(pick(linger, this.used, "linger"), "Lesson", {
      key: `linger:${section}`,
      who: "bit",
      banter: true,
    });
  }

  idle(touring = false) {
    if (!this.opened || this.greeting || this.busy) return false;

    if (this.dwellSection === "stack" && !this.played.has("stack-1")) {
      this.say(onStack[1], "Stack", { key: "stack-1", who: "bit", banter: true, joke: true });
      return true;
    }
    if (this.dwellSection === "stack" && !this.played.has("stack-2")) {
      this.say(onStack[2], "Stack", { key: "stack-2", who: "pixel", banter: true });
      return true;
    }
    if (this.dwellSection === "projects" && !this.played.has("projects-1")) {
      this.say(onProjects[1], "Work", { key: "projects-1", who: "bit", banter: true, joke: true });
      return true;
    }
    if (this.dwellSection === "projects" && !this.played.has("projects-2")) {
      this.say(onProjects[2], "Work", { key: "projects-2", who: "pixel", banter: true });
      return true;
    }
    if (this.dwellSection === "projects" && !this.played.has("projects-3")) {
      this.say(onProjects[3], "Work", { key: "projects-3", who: "bit", banter: true, joke: true });
      return true;
    }
    if (this.dwellSection === "about" && !this.played.has("creative")) {
      this.say(onCreative[0], "Lesson", { key: "creative", who: "bit", banter: true });
      return true;
    }
    if (this.dwellSection === "about" && !this.played.has("creative-2")) {
      this.say(onCreative[1], "Note", { key: "creative-2", who: "pixel", banter: true, joke: true });
      return true;
    }
    if (this.dwellSection === "experience" && !this.played.has("experience-1")) {
      this.say(onExperience[1], "Lesson", { key: "experience-1", who: "bit" });
      return true;
    }

    if (touring) return false;

    const roll = Math.random();
    const heat = this.heat;
    let lines;
    let tag = "Note";
    let joke = false;

    if (roll < 0.1 + heat * 0.06) {
      lines = pick(smart, this.used, "smart");
      tag = "Note";
    } else if (roll < 0.22 + heat * 0.5) {
      lines = pick(unhinged, this.used, "unhinged");
      tag = "Unhinged";
      joke = true;
    } else if (roll < 0.62) {
      lines = pick(builder, this.used, "builder");
      tag = "Builder";
      joke = lines.length > 1;
    } else {
      lines = pick(brain, this.used, "brain");
      tag = "Note";
      joke = lines.length > 1;
    }

    const who = this.turn;
    this.turn = other(this.turn);
    this.say(lines, tag, { who, banter: lines.length > 1, joke });
    return true;
  }

  /** Play the next scripted line for this page. Used by the page-by-page tour. */
  next() {
    return this.idle(true);
  }

  hire(over) {
    if (this.current?.tag === "Goodbye" || this.sentHome) return;
    if (this.dwellSection !== "contact" && !this.played.has("ending")) return;
    if (over) {
      this.say(["That's the right answer."], "Lesson", { interrupt: true, who: "bit" });
      return;
    }
    this.say(["I'll give you another second."], "Hello", { interrupt: true, who: "pixel" });
  }

  inspect() {
    this.say(onProjects[3], "Work", {
      key: "projects-3",
      interrupt: true,
      who: "bit",
      banter: true,
      joke: true,
    });
  }

  leftContact() {
    if (this.starting) return;
    if (this.sentHome || this.saidHello || !this.played.has("ending")) return;
    this.say(ghost, "Observing", { key: "ghost", interrupt: true, who: "bit", banter: true, joke: true });
  }

  has(key) {
    return this.played.has(key);
  }

  hello() {
    this.saidHello = true;
  }

  present(name, onDone) {
    const first = name ? `That's ${name}. Off you go.` : "Off you go.";
    const started = performance.now();
    return this.say([first, "We'll wait here."], "Visit", {
      interrupt: true,
      who: ["pixel", "bit"],
      ondone: () => {
        const left = Math.max(700, 2800 - (performance.now() - started));
        window.setTimeout(() => onDone?.(), left);
      },
    });
  }

  goodbye(onDone) {
    if (this.current?.tag === "Goodbye") return false;
    this.sentHome = true;
    return this.say(goodbye, "Goodbye", {
      interrupt: true,
      who: ["pixel", "bit", "pixel"],
      ondone: () => {
        this.current = null;
        this.emit(null);
        onDone?.();
      },
    });
  }

  hush() {
    this.reading = "";
    this.flush(false);
  }

  dropRead() {
    this.reading = "";
    this.queue = this.queue.filter((beat) => beat.tag !== "Read");
    if (this.current?.tag !== "Read") return;
    this.seq += 1;
    hushVoice();
    this.current = null;
    this.emit(null);
    this.stepping = false;
    this.step();
  }

  readPassage(text) {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean || !this.opened || this.sentHome) return;
    if (this.current?.tag === "Goodbye") return;
    if (clean === this.reading) return;
    this.dropRead();
    this.reading = clean;
    const parts = chunkSpeech(clean);
    this.say(parts, "Read", {
      interrupt: false,
      who: "bit",
      ondone: () => {
        if (this.reading === clean) this.reading = "";
      },
    });
  }

  stopRead() {
    const queued = this.queue.some((beat) => beat.tag === "Read");
    if (!this.reading && this.current?.tag !== "Read" && !queued) return;
    this.dropRead();
  }
}

let talk;

export const getTalk = () => {
  if (!talk) talk = new CompanionTalk();
  return talk;
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    talk?.wipe();
    talk = null;
  });
}
