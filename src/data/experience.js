import logoAucrada from "../images/logo-aucrada.webp";
import logoAsante from "../images/logo-asante.webp";
import logoTshimologong from "../images/logo-tshimologong.webp";

export const timeline = [
  {
    heading: "Rotational Internship",
    period: "Sep 2025 – Aug 2026",
    roles: [
      {
        company: "Aucrada",
        title: "Full Stack Developer",
        period: "Feb 2026 – Aug 2026",
        url: "https://aucrada.com/",
        logo: logoAucrada,
        lightLogo: true,
        points: [
          "Built and maintained responsive frontend components for web applications across multiple devices.",
          "Translated UI/UX designs into functional, consistent interfaces with attention to detail.",
          "Collaborated with backend developers and designers to support feature development and integration.",
          "Improved overall user experience through interface refinements and layout enhancements.",
        ],
      },
      {
        company: "Asante Tech Solutions",
        title: "CRM Automation & Web Development",
        period: "Sep 2025 – Feb 2026",
        url: "https://www.asantesolutions.co.za/",
        logo: logoAsante,
        lightLogo: true,
        points: [
          "Supported CRM automation workflows to improve client data handling and operational efficiency.",
          "Built and updated WordPress websites including layout adjustments and plugin configuration.",
          "Contributed to workflow automation initiatives aimed at reducing manual processes.",
        ],
      },
    ],
  },
  {
    heading: "Internship",
    period: "Jul 2024 – Jun 2025",
    roles: [
      {
        company: "Tshimologong Digital Innovation Precinct",
        title: "Full Stack Software Developer Intern",
        period: "Jul 2024 – Jun 2025",
        url: "https://tshimologong.joburg/",
        logo: logoTshimologong,
        lightLogo: false,
        points: [
          "Built scalable web applications using the MERN stack.",
          "Contributed to UI/UX design and wireframing using Figma.",
          "Collaborated in Agile teams, consistently meeting project timelines.",
        ],
      },
    ],
  },
];

export const entries = timeline.flatMap((group) =>
  group.roles.map((role) => ({
    ...role,
    groupHeading: group.heading,
    groupPeriod: group.period,
    groupSize: group.roles.length,
  }))
);

export const education = [
  {
    school: "IIE Rosebank College",
    award: "Diploma in Information Technology (Software Development)",
    period: "2021 – 2023",
  },
  {
    school: "Pretoria Central High School",
    award: "Matric",
    period: "2015 – 2019",
  },
];

export const certifications = [
  { name: "Full-Stack Software Development", issuer: "FNB App Academy", year: "2025" },
  { name: "Artificial Intelligence Fluency", issuer: "Microsoft", year: "2025" },
  { name: "Graphic Design", issuer: "Oasis Infobyte", year: "2025" },
  { name: "Internship Completion", issuer: "Tshimologong Precinct", year: "2025" },
  { name: "Web Development & Design", issuer: "Oasis Infobyte", year: "2024" },
];

export const languages = [
  { name: "English", level: "Fluent" },
  { name: "Northern Sotho", level: "Native" },
  { name: "IsiZulu", level: "Conversational" },
  { name: "Afrikaans", level: "Basic" },
];
