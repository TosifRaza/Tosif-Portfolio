// ─────────────────────────────────────────────
// FOUNDER OS v3.0 — AI Responses Data
// ─────────────────────────────────────────────







export const responses = [
  {
    keywords: ["skillbridge", "startup", "platform"],
    answer: "SkillBridge is a platform connecting freelancers with small businesses. Founded in 2025, it has 120+ users and 45 active workers. Built with React + Node + MongoDB. Currently in Beta phase with plans to launch in Q4 2025.",
    followUp: ["Show me the architecture", "What challenges did you face?", "What's the business model?"],
  },
  {
    keywords: ["react", "frontend"],
    answer: "Tosif has 1+ year of React experience with 80% proficiency. Built 3 projects including SkillBridge, Portfolio v3, and Dashboard App. Strong in Components, Hooks, Context API, and Redux. Currently learning SSR/Next.js.",
    followUp: ["Show React projects", "What about Node.js?", "How about TypeScript?"],
  },
  {
    keywords: ["node", "backend", "express"],
    answer: "Node.js with 75% proficiency and 1+ year experience. Built REST APIs with Express, implemented JWT authentication, and connected to MongoDB. Currently learning WebSockets and microservices.",
    followUp: ["What about MongoDB?", "Show backend projects"],
  },
  {
    keywords: ["mongo", "database", "db"],
    answer: "MongoDB with 65% proficiency. Experience with CRUD, Aggregation Pipelines, Indexing, and Schema Design via Mongoose ODM. Used in SkillBridge for flexible user profiles.",
    followUp: ["Why MongoDB over SQL?", "Show database design"],
  },
  {
    keywords: ["hire", "job", "recruiter", "available", "work"],
    answer: "Great decision! Tosif is open to full-stack developer roles. Key strengths: Real product experience (SkillBridge with 120+ users), full-stack capability (React + Node + MongoDB), and entrepreneurial mindset. Check Recruiter Mode for detailed match analysis!",
    followUp: ["Download resume", "Schedule a call", "What makes Tosif unique?"],
  },
  {
    keywords: ["project", "built", "portfolio", "work"],
    answer: "Tosif has built 4 major projects: SkillBridge (live, 120+ users), Portfolio v3 (this site, building), Dashboard App (completed), and Todo App Pro (completed). SkillBridge is the flagship — a real product with real users.",
    followUp: ["Tell me about SkillBridge", "Show the tech stack", "What challenges did you face?"],
  },
  {
    keywords: ["technology", "tech", "stack", "know", "language"],
    answer: "Core stack: React, JavaScript, Node.js, Express, MongoDB, Tailwind CSS, Git. Learning: TypeScript, Docker, Next.js. Exploring: AWS, Kubernetes, GraphQL. Full tech radar available in Mission Hub.",
    followUp: ["Show skill details", "What about React specifically?"],
  },
  {
    keywords: ["unique", "different", "special", "why"],
    answer: "Three things make Tosif unique: 1) Real product experience — SkillBridge has 120+ real users, not just tutorial projects. 2) Full-stack capability — handles frontend, backend, deployment, and product design. 3) Entrepreneurial mindset — identifies problems and builds solutions, not just code.",
    followUp: ["Tell me about SkillBridge", "How does he approach problems?"],
  },
  {
    keywords: ["education", "college", "university", "study"],
    answer: "Tosif is a self-taught developer who started coding in 2024. Believes in project-based learning — built real applications instead of just following tutorials. The SkillBridge startup is the ultimate proof of applied learning.",
    followUp: ["What's the learning journey?", "How did he learn React?"],
  },
  {
    keywords: ["contact", "email", "reach", "connect"],
    answer: "You can reach Tosif through the Contact Portal (click the satellite icon in sidebar). Options: Collaboration, Hire Me, or Share an Idea. You can also email at tosif@example.com.",
    followUp: ["Open contact form"],
  },
  {
    keywords: ["hello", "hi", "hey", "sup"],
    answer: "Hey there! I'm Founder AI — your guide to Tosif's portfolio. Ask me anything about his skills, projects, or startup journey. Or try the quick questions below!",
    followUp: ["What is SkillBridge?", "Show me projects", "Technologies he knows?"],
  },
];

export const contextSuggestions = {
  mission: ["What is Tosif currently building?", "Show tech radar", "Activity feed?"],
  skills: ["What about React specifically?", "Show backend skills", "Learning path?"],
  projects: ["Tell me about SkillBridge", "Show architecture", "What challenges?"],
  startup: ["Business model?", "Growth metrics?", "Future roadmap?"],
  timeline: ["Learning journey?", "When did he start coding?", "Future goals?"],
  recruiter: ["Why hire Tosif?", "Match my job requirements", "Download resume"],
  achievements: ["What's the rarest achievement?", "Startup founder badge?", "Close to unlocking?"],
  contact: ["How to reach Tosif?", "Collaboration options?"],
};

export const defaultSuggestions = [
  "What is SkillBridge?",
  "Show me projects",
  "Technologies he knows?",
  "Why hire Tosif?",
];

export const findResponse = (query) => {
  const lower = query.toLowerCase().trim();
  
  for (const r of responses) {
    if (r.keywords.some((k) => lower.includes(k))) {
      return { answer: r.answer, followUp: r.followUp || [] };
    }
  }
  
  return {
    answer: "I don't have specific information about that yet. Try asking about Tosif's skills, projects, startup (SkillBridge), or hiring availability!",
    followUp: ["What is SkillBridge?", "Show me projects", "Technologies he knows?"],
  };
};
