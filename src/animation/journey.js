// Anchor positions are expressed in viewport fractions (-1 to 1) so the
// companion lands in the same visual spot regardless of screen size.
// `tone` describes the background it rests on, which drives its colour shift.
// `scene` picks the set the companion acts in and `pose` how it holds itself
// once it arrives there.
export const SECTIONS = [
  {
    id: "top",
    label: "Intro",
    note: "00",
    anchor: { x: -0.6, y: -0.3 },
    scene: "futurist",
    pose: "idle",
    tone: 1,
    lines: [
      "Hi, I'm Pixel. I'll ride along.",
      "Hi, I'm Bit. I'll walk you through each section.",
    ],
  },
  {
    id: "about",
    label: "About",
    note: "01",
    anchor: { x: 0.82, y: -0.1 },
    scene: "reading",
    pose: "read",
    tone: 0,
    lines: [
      "That's Ashleigh up there.",
      "Diploma in IT, Software Development.",
    ],
  },
  {
    id: "experience",
    label: "Experience",
    note: "02",
    anchor: { x: -0.86, y: 0.16 },
    scene: "desk",
    pose: "type",
    tone: 0,
    lines: [
      "Three internships so far.",
      "Aucrada, Asante and Tshimologong.",
      "Tap a company to read the details.",
    ],
  },
  {
    id: "stack",
    label: "Stack",
    note: "03",
    anchor: { x: 0.76, y: 0.28 },
    scene: "orbit",
    pose: "reach",
    tone: 1,
    lines: [
      "Welcome to the toolbox.",
      "React and TypeScript get the most use.",
    ],
  },
  {
    id: "projects",
    label: "Work",
    note: "04",
    anchor: { x: -0.82, y: -0.32 },
    scene: "gallery",
    pose: "hold",
    tone: 0,
    lines: [
      "Three live builds down here.",
      "Go on, open one in a new tab.",
    ],
  },
  {
    id: "contact",
    label: "Contact",
    note: "05",
    // Low on the right, under the contact cards rather than across them, so
    // nothing it does covers the form.
    anchor: { x: 0.74, y: -0.66 },
    scene: "call",
    pose: "call",
    tone: 1,
    lines: [
      "This is where you say hello.",
      "The form works, I checked it myself.",
    ],
  },
];

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Tracks where the reader is in the page and turns that into a position along
 * the companion's route: which anchor it left, which it is heading to, and how
 * far through the hop it currently is.
 */
export class Journey {
  constructor() {
    this.bounds = [];
    this.lastScroll = 0;
    this.velocity = 0;
    this.direction = 1;
    this.from = 0;
    this.to = 0;
    this.blend = 0;
    this.travel = 0;
    this.position = 0;
  }

  measure() {
    this.bounds = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { top: rect.top + window.scrollY, height: rect.height || 1 };
    });
    this.lastScroll = window.scrollY;
  }

  update(dt) {
    const scroll = window.scrollY;
    const delta = scroll - this.lastScroll;
    this.lastScroll = scroll;

    const instant = dt > 0 ? delta / dt : 0;
    this.velocity += (instant - this.velocity) * clamp(dt * 7, 0, 1);
    if (Math.abs(delta) > 0.5) this.direction = Math.sign(delta);

    const focus = scroll + window.innerHeight / 2;
    let index = 0;
    let local = 0;

    for (let i = 0; i < this.bounds.length; i += 1) {
      const bound = this.bounds[i];
      if (!bound || focus < bound.top) continue;
      index = i;
      local = clamp((focus - bound.top) / bound.height, 0, 1);
    }

    const last = SECTIONS.length - 1;
    const route = clamp(index + local - 0.5, 0, last);
    const from = clamp(Math.floor(route), 0, last - 1);
    const raw = clamp(route - from, 0, 1);

    // Hold near each anchor, then cross. The crossing window is wide on
    // purpose: the companion swings all the way from one side of the page to
    // the other, and a narrow window makes that read as a jump rather than a
    // journey.
    const blend = smootherstep(clamp((raw - 0.16) / 0.68, 0, 1));

    this.from = from;
    this.to = Math.min(from + 1, last);
    this.blend = blend;
    this.travel = Math.sin(Math.PI * blend);
    this.position = from + blend;
  }
}
