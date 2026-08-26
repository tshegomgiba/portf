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
      "Competitive gaming platform with wallet, match flow, social feed, and notifications. Backend on Supabase with PWA offline support via Workbox.",
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
      "Corporate site for a South African accounting, audit, forensic and advisory house, covering fourteen service lines, industries, insights, and client engagements.",
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
      "A tribute build for the ninja world of Naruto, with character profiles and interactive village exploration wrapped in animated transitions.",
    image: shotNaruto,
    link: "https://anime-8x86.vercel.app/",
    logo: logoAnime,
    technologies: ["React", "Vite", "Tailwind", "Anime.js"],
    status: "Live",
    featured: false,
  },
];

export default projects;
