import { timeline, certifications } from "./experience";
import { projects } from "./projects";

const plural = (count, singular) =>
  count === 1 ? singular : `${singular}s`;

export const internshipCount = timeline.reduce(
  (total, group) => total + group.roles.length,
  0
);
export const companyCount = new Set(
  timeline.flatMap((group) => group.roles.map((role) => role.company))
).size;
export const certificationCount = certifications.length;
export const projectCount = projects.length;
export const liveProjectCount = projects.filter(
  (project) => project.status === "Live"
).length;

export const stats = [
  { value: internshipCount, label: plural(internshipCount, "Dev internship") },
  { value: certificationCount, label: plural(certificationCount, "Certification") },
  { value: liveProjectCount, label: `Live ${plural(liveProjectCount, "project")}` },
];

const words = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six",
  "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
];

// Spelled-out counts read better inside prose than digits do.
export const numberWord = (count) =>
  words[count] ?? String(count);
