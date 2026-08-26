import {
  FaReact, FaHtml5, FaCss3Alt, FaJsSquare, FaNodeJs, FaGitAlt,
  FaJava, FaWordpress, FaFigma
} from "react-icons/fa";
import {
  SiTypescript, SiTailwindcss, SiMongodb, SiMysql, SiPostgresql,
  SiSupabase, SiFirebase, SiExpress, SiRedux, SiKotlin, SiVite,
  SiMui
} from "react-icons/si";

// `color` styles the flat grid, `hex` paints the 3D sprites.
export const techStack = [
  { name: "JavaScript", icon: FaJsSquare, color: "text-yellow-400", hex: "#f7df1e" },
  { name: "TypeScript", icon: SiTypescript, color: "text-blue-400", hex: "#4f9fe0" },
  { name: "React", icon: FaReact, color: "text-sky-400", hex: "#61dafb" },
  { name: "Node.js", icon: FaNodeJs, color: "text-green-400", hex: "#6cc24a" },
  { name: "Express", icon: SiExpress, color: "text-white", hex: "#ffffff" },
  { name: "HTML5", icon: FaHtml5, color: "text-orange-400", hex: "#e8703a" },
  { name: "CSS3", icon: FaCss3Alt, color: "text-blue-400", hex: "#3d9ae0" },
  { name: "Tailwind", icon: SiTailwindcss, color: "text-cyan-300", hex: "#38bdf8" },
  { name: "Redux", icon: SiRedux, color: "text-violet-400", hex: "#a072e8" },
  { name: "Material UI", icon: SiMui, color: "text-sky-400", hex: "#4d9fff" },
  { name: "MongoDB", icon: SiMongodb, color: "text-green-400", hex: "#57c46b" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "text-blue-300", hex: "#7aa8e8" },
  { name: "MySQL", icon: SiMysql, color: "text-cyan-400", hex: "#3fc0d8" },
  { name: "Supabase", icon: SiSupabase, color: "text-emerald-400", hex: "#3ecf8e" },
  { name: "Firebase", icon: SiFirebase, color: "text-amber-400", hex: "#ffca28" },
  { name: "Java", icon: FaJava, color: "text-red-400", hex: "#f28b56" },
  { name: "Kotlin", icon: SiKotlin, color: "text-purple-400", hex: "#b57bff" },
  { name: "WordPress", icon: FaWordpress, color: "text-sky-300", hex: "#5fb2dd" },
  { name: "Figma", icon: FaFigma, color: "text-pink-400", hex: "#f2795e" },
  { name: "Git", icon: FaGitAlt, color: "text-orange-400", hex: "#f05033" },
  { name: "Vite", icon: SiVite, color: "text-violet-400", hex: "#b57cff" },
];
