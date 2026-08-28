import logoHistakes from "../images/logo-histakes.webp";
import logoHouseOfMash from "../images/logo-houseofmash.webp";
import logoAnime from "../images/logo-anime.webp";
import shotHistakes from "../images/shot-histakes.webp";
import shotHouseOfMash from "../images/shot-houseofmash.webp";
import shotNaruto from "../images/shot-naruto.webp";

export const projects = [
  {
    title: "HiStakes",
    description:
      "I built the live competitive gaming app: wallet, match flow, social feed, and notifications. React and TypeScript on the front, Supabase on the back, with PWA offline support.",
    image: shotHistakes,
    link: "https://app.histakes.co.za/",
    logo: logoHistakes,
    technologies: ["React", "TypeScript", "Supabase", "Vite", "Tailwind"],
    status: "Live",
    featured: true,
  },
  {
    title: "House of Mash",
    description:
      "I built the corporate site for a South African accounting, audit, forensic and advisory house: fourteen service lines, industries, insights, and client work, as a responsive TypeScript and Tailwind site.",
    image: shotHouseOfMash,
    link: "https://www.houseofmash.co.za/",
    logo: logoHouseOfMash,
    technologies: ["TypeScript", "Tailwind CSS", "Responsive"],
    status: "Live",
    featured: true,
  },
  {
    title: "Anime Homage Site",
    description:
      "A solo tribute build for the ninja world of Naruto: character profiles, interactive village exploration, and animated transitions.",
    image: shotNaruto,
    link: "https://anime-8x86.vercel.app/",
    logo: logoAnime,
    technologies: ["React", "Vite", "Tailwind", "Anime.js"],
    status: "Live",
    featured: false,
  },
];

export default projects;
