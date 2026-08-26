import { entries, certifications } from "./experience";
import { projects } from "./projects";

const plural = (count, singular) =>
  count === 1 ? singular : `${singular}s`;

export const roleCount = entries.length;
export const companyCount = new Set(entries.map((entry) => entry.company)).size;
export const certificationCount = certifications.length;
export const projectCount = projects.length;
export const liveProjectCount = projects.filter(
  (project) => project.status === "Live"
).length;

export const stats = [
  { value: roleCount, label: plural(roleCount, "Dev internship") },
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
