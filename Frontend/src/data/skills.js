// ─────────────────────────────────────────────
// FOUNDER OS v3.0 — Skills Data
// ─────────────────────────────────────────────




















export const skillCategories = [
  {
    name: "Frontend",
    color: "#7C6AFF",
    skills: [
      {
        name: "React",
        proficiency: 80,
        experience: "1+ years",
        projects: ["SkillBridge", "Portfolio v3", "Dashboard App"],
        connectedTo: ["JavaScript", "Redux", "Tailwind CSS"],
        learningPath: {
          completed: ["Components", "Hooks", "Context API", "Redux"],
          inProgress: ["SSR / Next.js"],
          planned: ["React Native", "Testing"],
        },
      },
      {
        name: "JavaScript",
        proficiency: 78,
        experience: "2+ years",
        projects: ["SkillBridge", "Portfolio v3", "Dashboard App", "Todo App"],
        connectedTo: ["React", "Node.js", "Express"],
        learningPath: {
          completed: ["ES6+", "Async/Await", "DOM API", "Closures"],
          inProgress: ["Design Patterns"],
          planned: ["Web Workers", "WASM"],
        },
      },
      {
        name: "Tailwind CSS",
        proficiency: 80,
        experience: "1+ years",
        projects: ["SkillBridge", "Portfolio v3", "Landing Pages"],
        connectedTo: ["React", "CSS"],
        learningPath: {
          completed: ["Utility Classes", "Responsive", "Custom Theme"],
          inProgress: ["Animations"],
          planned: ["Plugin Development"],
        },
      },
      {
        name: "HTML/CSS",
        proficiency: 90,
        experience: "2+ years",
        projects: ["All Projects"],
        connectedTo: ["JavaScript", "Tailwind CSS"],
        learningPath: {
          completed: ["Semantic HTML", "Flexbox", "Grid", "Animations"],
          inProgress: [],
          planned: ["Web Components"],
        },
      },
    ],
  },
  {
    name: "Backend",
    color: "#00D4FF",
    skills: [
      {
        name: "Node.js",
        proficiency: 75,
        experience: "1+ years",
        projects: ["SkillBridge", "REST APIs"],
        connectedTo: ["Express", "MongoDB", "JavaScript"],
        learningPath: {
          completed: ["Core Modules", "REST API", "Middleware"],
          inProgress: ["Authentication", "WebSockets"],
          planned: ["Microservices", "Event Loop Deep Dive"],
        },
      },
      {
        name: "Express.js",
        proficiency: 70,
        experience: "1+ year",
        projects: ["SkillBridge", "API Server"],
        connectedTo: ["Node.js", "MongoDB"],
        learningPath: {
          completed: ["Routing", "Middleware", "Error Handling"],
          inProgress: ["Security Best Practices"],
          planned: ["Performance Optimization"],
        },
      },
      {
        name: "MongoDB",
        proficiency: 65,
        experience: "1 year",
        projects: ["SkillBridge"],
        connectedTo: ["Node.js", "Mongoose", "Express"],
        learningPath: {
          completed: ["CRUD", "Aggregation", "Indexing"],
          inProgress: ["Schema Design"],
          planned: ["Sharding", "Replica Sets"],
        },
      },
      {
        name: "REST API",
        proficiency: 72,
        experience: "1+ year",
        projects: ["SkillBridge", "Portfolio Backend"],
        connectedTo: ["Node.js", "Express", "MongoDB"],
        learningPath: {
          completed: ["HTTP Methods", "Status Codes", "Authentication"],
          inProgress: ["Rate Limiting"],
          planned: ["GraphQL"],
        },
      },
    ],
  },
  {
    name: "Tools",
    color: "#FFB800",
    skills: [
      {
        name: "Git",
        proficiency: 72,
        experience: "2+ years",
        projects: ["All Projects"],
        connectedTo: ["GitHub", "VS Code"],
        learningPath: {
          completed: ["Commands", "Branching", "Merging", "Rebase"],
          inProgress: ["Git Hooks"],
          planned: ["Custom Workflows"],
        },
      },
      {
        name: "VS Code",
        proficiency: 85,
        experience: "2+ years",
        projects: ["All Projects"],
        connectedTo: ["Git", "Terminal"],
        learningPath: {
          completed: ["Extensions", "Shortcuts", "Debugging"],
          inProgress: ["Custom Snippets"],
          planned: ["Extension Development"],
        },
      },
      {
        name: "Linux",
        proficiency: 50,
        experience: "6 months",
        projects: ["Server Management"],
        connectedTo: ["Git", "Docker"],
        learningPath: {
          completed: ["Basic Commands", "File System", "Permissions"],
          inProgress: ["Shell Scripting"],
          planned: ["System Administration"],
        },
      },
      {
        name: "Docker",
        proficiency: 40,
        experience: "3 months",
        projects: ["SkillBridge (planned)"],
        connectedTo: ["Linux", "Node.js"],
        learningPath: {
          completed: ["Basic Commands", "Dockerfile"],
          inProgress: ["Docker Compose"],
          planned: ["Kubernetes", "CI/CD"],
        },
      },
    ],
  },
];

export const getAllSkills = () => {
  return skillCategories.flatMap((cat) => cat.skills);
};

export const getSkillByName = (name) => {
  return getAllSkills().find((s) => s.name.toLowerCase() === name.toLowerCase());
};
