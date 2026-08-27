export const profile = {
  name: "Tshegofatso Ashleigh Mgiba",
  spokenName: "Ashleigh",
  role: "Full Stack Developer",
  email: "tshegofatsononyane009@gmail.com",
  phone: "+27 81 503 8545",
  phoneHref: "tel:+27815038545",
  location: "Pretoria & Johannesburg, South Africa",
  cv: "/Tshegofatso-Mgiba-CV.pdf",
  // Paste the full profile URLs here and the icons appear automatically.
  // Anything left blank is simply not rendered.
  github: "https://github.com/tshegomgiba",
  linkedin: "https://www.linkedin.com/in/tshegofatso-m-552a03276",
};

export const socialLinks = [
  { key: "github", label: "GitHub", href: profile.github },
  { key: "linkedin", label: "LinkedIn", href: profile.linkedin },
  { key: "email", label: "Email", href: `mailto:${profile.email}` },
].filter((link) => link.href);
