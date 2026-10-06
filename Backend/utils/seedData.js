// TOSIF OS — seed content
// Migrates the portfolio's previously static/frontend content into the
// database so everything is editable from the Admin Control Center.
// NOTE: all seed records originate from the project's own authored data
// (Frontend/src/data/*.js and utils/seedData.js) — nothing is invented here.

import { DEFAULT_SECTIONS, DEFAULT_NAV } from '../models/SiteConfig.js';

export const seedProjects = [
  {
    missionId: 'MISSION-001',
    title: 'SkillBridge',
    tagline: 'A marketplace where skills meet opportunities.',
    description:
      'A full-stack marketplace where mentors and learners connect. Realtime chat, secure payments, scheduling, and a recommendation engine based on skill graphs. Built end-to-end on the MERN stack with JWT auth, Socket.IO realtime, and Stripe payments.',
    problem: 'Skilled people struggle to find opportunities, and small businesses struggle to find verified talent.',
    solution: 'A marketplace with realtime matching, secure payments and verified reviews connecting both sides.',
    role: 'Founder & Full-Stack Developer',
    category: 'professional',
    stack: ['MongoDB', 'Express', 'React', 'Node', 'Socket.IO', 'Stripe'],
    status: 'Active',
    difficulty: 'High',
    githubUrl: 'https://github.com/tosifraza/skillbridge',
    liveUrl: 'https://skillbridge.demo.founderos.dev',
    featured: true,
    order: 1,
  },
  {
    missionId: 'MISSION-002',
    title: 'DevPulse Dashboard',
    tagline: 'Analytics dashboard built for indie developers.',
    description:
      'A privacy-first analytics platform that indie developers can drop into any site. Features realtime visitor maps, funnel analysis, custom events, and a sleek glassmorphism UI. Uses Mongoose aggregation pipelines for fast queries.',
    problem: 'Indie developers need lightweight, privacy-friendly analytics without heavy SaaS pricing.',
    solution: 'Drop-in analytics script + realtime dashboard with funnels, events and visitor maps.',
    role: 'Solo Developer',
    category: 'professional',
    stack: ['MongoDB', 'Express', 'React', 'Node', 'Tailwind', 'Framer Motion'],
    status: 'Active',
    difficulty: 'Medium',
    githubUrl: 'https://github.com/tosifraza/devpulse',
    liveUrl: 'https://devpulse.demo.founderos.dev',
    featured: true,
    order: 2,
  },
  {
    missionId: 'MISSION-003',
    title: 'MERN Auth Toolkit',
    tagline: 'Production-ready auth boilerplate for MERN apps.',
    description:
      'An open-source JWT auth toolkit with refresh tokens, email verification, password reset, role-based access control, and a polished React UI. Used as the foundation for every project in this portfolio.',
    problem: 'Every MERN project re-implements authentication from scratch and gets it wrong.',
    solution: 'A reusable, production-grade auth toolkit with RBAC, refresh tokens and email flows.',
    role: 'Author / Maintainer',
    category: 'open-source',
    stack: ['MongoDB', 'Express', 'React', 'Node', 'JWT', 'Nodemailer'],
    status: 'Completed',
    difficulty: 'Medium',
    githubUrl: 'https://github.com/tosifraza/mern-auth-toolkit',
    liveUrl: '',
    featured: false,
    order: 3,
  },
  {
    missionId: 'MISSION-004',
    title: 'TOSIF OS',
    tagline: 'The personal operating system you are looking at right now.',
    description:
      'A database-driven personal OS + professional portfolio: public site, private goal/time/learning tracking with analytics and trajectory estimates, an Admin Control Center, and an Express + MongoDB API. Boot animation, terminal, and an AI assistant included.',
    problem: 'Portfolios are static; personal progress tracking is scattered across tools.',
    solution: 'One MERN system: a CMS-controlled public portfolio plus a private operating system with goals, tasks, time, learning and analytics.',
    role: 'Solo Developer & User',
    category: 'professional',
    stack: ['MongoDB', 'Express', 'React', 'Node', 'Framer Motion', 'Tailwind'],
    status: 'Active',
    difficulty: 'Extreme',
    githubUrl: 'https://github.com/tosifraza/founder-os',
    liveUrl: 'https://founderos.dev',
    featured: true,
    order: 4,
  },
  {
    missionId: 'MISSION-005',
    title: 'Inkwell — AI Story Companion',
    tagline: 'AI-assisted writing tool for novelists.',
    description:
      'An AI-assisted writing environment with character tracking, plot threads, and tone-aware completions. Backend uses streaming LLM responses over Server-Sent Events for a buttery writing experience.',
    problem: 'Novelists lose track of characters and plot threads across long manuscripts.',
    solution: 'A writing environment with structured story data plus tone-aware AI completions over SSE.',
    role: 'Solo Developer',
    category: 'personal',
    stack: ['MongoDB', 'Express', 'React', 'Node', 'SSE', 'Tailwind'],
    status: 'In Progress',
    difficulty: 'High',
    githubUrl: 'https://github.com/tosifraza/inkwell',
    liveUrl: '',
    featured: false,
    order: 5,
  },
  {
    missionId: 'MISSION-006',
    title: 'PulseTrade',
    tagline: 'Crypto portfolio tracker with realtime prices.',
    description:
      'A realtime crypto portfolio tracker with price alerts, transaction history, and beautiful charts. WebSocket price feed, Mongoose time-series collections, and a buttery-smooth React UI.',
    problem: 'Crypto holders juggle exchanges and spreadsheets to understand their portfolio.',
    solution: 'Realtime tracker with alerts, history and charts in one clean interface.',
    role: 'Solo Developer',
    category: 'learning',
    stack: ['MongoDB', 'Express', 'React', 'Node', 'WebSocket', 'Chart.js'],
    status: 'Archived',
    difficulty: 'High',
    githubUrl: 'https://github.com/tosifraza/pulsetrade',
    liveUrl: '',
    featured: false,
    order: 6,
  },
];

// skills.js learning paths become LearningTopic records.
export const seedSkills = [
  { name: 'React', category: 'Frontend', level: 80, done: ['Components', 'Hooks', 'Context API', 'Redux'], todo: ['SSR / Next.js', 'React Native', 'Testing'] },
  { name: 'JavaScript', category: 'Frontend', level: 78, done: ['ES6+', 'Async/Await', 'DOM API', 'Closures'], todo: ['Design Patterns', 'Web Workers', 'WASM'] },
  { name: 'Tailwind CSS', category: 'Frontend', level: 80, done: ['Utility Classes', 'Responsive', 'Custom Theme'], todo: ['Animations', 'Plugin Development'] },
  { name: 'HTML/CSS', category: 'Frontend', level: 90, done: ['Semantic HTML', 'Flexbox', 'Grid', 'Animations'], todo: ['Web Components'] },
  { name: 'Redux', category: 'Frontend', level: 82 },
  { name: 'Framer Motion', category: 'Frontend', level: 80 },
  { name: 'Node.js', category: 'Backend', level: 75, done: ['Core Modules', 'REST API', 'Middleware'], todo: ['Authentication', 'WebSockets', 'Microservices', 'Event Loop Deep Dive'] },
  { name: 'Express.js', category: 'Backend', level: 70, done: ['Routing', 'Middleware', 'Error Handling'], todo: ['Security Best Practices', 'Performance Optimization'] },
  { name: 'REST API', category: 'Backend', level: 72, done: ['HTTP Methods', 'Status Codes', 'Authentication'], todo: ['Rate Limiting', 'GraphQL'] },
  { name: 'JWT Auth', category: 'Backend', level: 88 },
  { name: 'Socket.IO', category: 'Backend', level: 75 },
  { name: 'MongoDB', category: 'Database', level: 65, done: ['CRUD', 'Aggregation', 'Indexing'], todo: ['Schema Design', 'Sharding', 'Replica Sets'] },
  { name: 'Mongoose', category: 'Database', level: 90 },
  { name: 'Redis', category: 'Database', level: 65 },
  { name: 'Git', category: 'Tools', level: 72, done: ['Commands', 'Branching', 'Merging', 'Rebase'], todo: ['Git Hooks', 'Custom Workflows'] },
  { name: 'GitHub', category: 'Tools', level: 92 },
  { name: 'Postman', category: 'Tools', level: 92 },
  { name: 'VS Code', category: 'Tools', level: 85, done: ['Extensions', 'Shortcuts', 'Debugging'], todo: ['Custom Snippets', 'Extension Development'] },
  { name: 'Vite', category: 'Tools', level: 85 },
  { name: 'Linux', category: 'Tools', level: 50, done: ['Basic Commands', 'File System', 'Permissions'], todo: ['Shell Scripting', 'System Administration'] },
  { name: 'Docker', category: 'DevOps', level: 40, done: ['Basic Commands', 'Dockerfile'], todo: ['Docker Compose', 'Kubernetes', 'CI/CD'] },
  { name: 'Nginx', category: 'DevOps', level: 60 },
  { name: 'CI/CD', category: 'DevOps', level: 70 },
];

export const seedTimeline = [
  { title: 'Started Learning Programming', year: '2019', phase: 'learning', category: 'learning', description: 'First "Hello World" in Python. Fell in love with the craft of building things from nothing but text.', icon: '🌱', order: 1 },
  { title: 'Computer Science Student', year: '2020', phase: 'student', category: 'learning', description: 'Formal CS education. Data structures, algorithms, operating systems, databases. Built a foundation that everything else stands on.', icon: '🎓', order: 2 },
  { title: 'MERN Stack Developer', year: '2022', phase: 'developer', category: 'career', description: 'Specialised in MongoDB, Express, React, Node. Shipped 6+ full-stack applications. First paid freelance client.', icon: '💻', order: 3 },
  { title: 'Product Builder', year: '2024', phase: 'builder', category: 'product', description: 'Started building products end-to-end — from idea to deployed. Launched SkillBridge, DevPulse, and this OS.', icon: '🚀', order: 4 },
  { title: 'Future Founder', year: '2026', phase: 'founder', category: 'career', description: 'Currently architecting a SaaS product. Building in public. The next chapter starts now.', icon: '⭐', order: 5 },
];

export const seedAchievements = [
  { title: '1,000+ GitHub Stars', description: 'Cumulative stars across open-source projects.', issuer: 'GitHub', date: '2024', icon: '⭐', color: '#f59e0b', category: 'professional', order: 1 },
  { title: 'Top 5% Developer', description: 'Ranked in the top 5% of contributors on a major MERN project.', issuer: 'Open Source Community', date: '2024', icon: '🏆', color: '#a855f7', category: 'professional', order: 2 },
  { title: 'Shipped 6+ Products', description: 'Built and deployed six full-stack MERN products to production.', issuer: 'Self', date: '2024', icon: '🚀', color: '#00d4ff', category: 'professional', order: 3 },
  { title: 'Hackathon Winner', description: 'First place at a national-level 24-hour hackathon.', issuer: 'Hackathon India', date: '2023', icon: '🥇', color: '#10b981', category: 'professional', order: 4 },
  { title: 'Speaker — React Meetup', description: 'Delivered a talk on building reusable component systems with React + Tailwind.', issuer: 'React India', date: '2024', icon: '🎤', color: '#14b8a6', category: 'professional', order: 5 },
  { title: 'Mentor — Code for India', description: 'Mentored 15+ junior developers on MERN stack best practices.', issuer: 'Code for India', date: '2024', icon: '🧭', color: '#22c55e', category: 'professional', order: 6 },
];

export const seedProducts = [
  {
    name: 'SkillBridge',
    tagline: 'Connecting talent with opportunity',
    description:
      'A platform that bridges the gap between skilled freelancers and small businesses. Real-time matching, secure payments, and verified reviews.',
    problem: 'Skilled freelancers are invisible to small businesses that need them; hiring is slow, informal and risky on both sides.',
    solution: 'A marketplace with real-time matching, secure payments and verified reviews that makes trust automatic.',
    founderRole: 'Founder & Full-Stack Developer',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe', 'Socket.IO'],
    status: 'mvp',
    launchDate: '',
    roadmap: [
      { phase: 'Idea', status: 'completed', quarter: 'Q1 2025', description: 'Identified the problem and validated the concept' },
      { phase: 'MVP', status: 'completed', quarter: 'Q2 2025', description: 'Built core marketplace with auth and matching' },
      { phase: 'Beta', status: 'current', quarter: 'Q3 2025', description: 'Public beta with 120+ users, gathering feedback' },
      { phase: 'Launch', status: 'upcoming', quarter: 'Q4 2025', description: 'Full launch with payment integration and marketing' },
      { phase: 'Scale', status: 'upcoming', quarter: 'Q1 2026', description: 'Expand to 5+ cities, mobile app, enterprise features' },
    ],
    milestones: [
      { title: 'Concept validated', date: 'Q1 2025', done: true },
      { title: 'Core marketplace shipped', date: 'Q2 2025', done: true },
      { title: 'Public beta live', date: 'Q3 2025', done: true },
      { title: 'Payment integration', date: 'Q4 2025', done: false },
    ],
    caseStudy:
      'Value proposition: connect talent with opportunity — affordable for businesses, profitable for workers. Revenue model: service fees + premium subscriptions + featured listings. Channels: web app, referrals, social media, tech communities. Customers: students, freelancers, small businesses, startups.',
    metrics: [
      { label: 'Users', value: '120+' },
      { label: 'Active workers', value: '45' },
      { label: 'Status', value: 'Beta' },
    ],
    featured: true,
    order: 1,
  },
];

export const seedExperience = [
  {
    company: 'Freelance / Independent',
    role: 'MERN Stack Developer',
    location: 'Kolkata, India (Remote)',
    startDate: '2022',
    endDate: '',
    current: true,
    description:
      'Designing and shipping full-stack MERN applications for real users — from schema design and REST APIs to responsive React interfaces and deployment.',
    responsibilities: [
      'Build complete web applications on the MERN stack',
      'Design MongoDB schemas and Express REST APIs',
      'Implement authentication, authorization and payments',
      'Ship responsive, animated React frontends',
    ],
    technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'Tailwind CSS'],
    achievements: [
      'Shipped 6+ full-stack applications',
      'First paid freelance client in 2022',
    ],
    order: 1,
  },
  {
    company: 'SkillBridge',
    role: 'Founder & Full-Stack Developer',
    location: 'Remote',
    startDate: '2025',
    endDate: '',
    current: true,
    description:
      'Founded and built SkillBridge — a marketplace connecting skilled freelancers with small businesses. Own product vision, architecture and development.',
    responsibilities: [
      'Product vision, research and validation',
      'Architecture and full-stack development',
      'Realtime matching, payments and reviews',
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Socket.IO'],
    achievements: ['Public beta live with 120+ users'],
    order: 2,
  },
];

export const seedProfile = {
  name: 'Tosif Raza',
  title: 'Software Engineer & Founder',
  roles: ['Software Engineer', 'Startup Founder', 'Problem Solver', 'System Architect'],
  tagline: 'Building the future, one commit at a time.',
  shortBio:
    'Building the future, one commit at a time. From Kolkata to the world — engineering solutions that matter.',
  longBio:
    'I am a MERN stack developer and founder based in Kolkata. I started programming in 2019 and fell in love with building things from nothing but text. Since then I have shipped 6+ full-stack applications, founded SkillBridge — a marketplace connecting talent with opportunity — and kept a simple rule: own the whole stack, from schema design to deployment.\n\nI think like a founder: I optimise for impact, not for lines of code. I build products that real people use — marketplaces, dashboards, auth toolkits — and I measure what matters. Right now I am targeting Software Engineer roles where I can bring full-stack ownership and a founder\'s bias for shipping.',
  location: 'Kolkata, India',
  email: 'tosif@example.com',
  phone: '',
  availability: {
    status: 'Open to opportunities',
    type: 'Full-time / Contract',
    location: 'Remote / Kolkata',
    notice: 'Immediate',
  },
  socials: {
    github: 'https://github.com/tosifraza',
    linkedin: 'https://linkedin.com/in/tosifraza',
    twitter: 'https://twitter.com/tosifraza',
    website: '',
  },
  pitch:
    'A MERN stack developer who ships complete products — not just components. Owns the full lifecycle: schema design, REST APIs, JWT auth, responsive React UI, deployment. Built marketplaces, dashboards and auth toolkits that real people use. Thinks like a founder: optimises for impact, not for lines of code. Hire him to take a vague idea and turn it into a shipped product.',
};

export const seedAbout = {
  paragraphs: [
    'I am a software engineer and founder from Kolkata who builds complete products on the MERN stack. My journey started in 2019 with a first "Hello World" in Python; it turned into CS fundamentals, then full-stack development, then founding SkillBridge in 2025.',
    'What drives me is taking an idea from nothing to shipped: researching the problem, designing the data model, building the API, crafting the interface, and measuring whether it actually helps people. This site itself is an example — a personal operating system that tracks my goals, time and learning, with the public portfolio you are browsing right now.',
    'Today I am targeting Software Engineer opportunities, including roles in top MNCs, where full-stack ownership, product thinking and a builder\'s work ethic matter.',
  ],
  highlights: [
    { title: 'Real Product Experience', description: 'Built SkillBridge from scratch — a live product with real users, not just tutorial projects.' },
    { title: 'Full-Stack Capability', description: 'Handles frontend (React), backend (Node/Express), database (MongoDB), and deployment end-to-end.' },
    { title: 'Entrepreneurial Mindset', description: 'Identifies problems and builds complete solutions — from research to architecture to shipping.' },
    { title: 'Active Builder', description: 'Daily commits, growing startup, consistent learning. Always building, always shipping.' },
    { title: 'Growth Trajectory', description: 'From first HTML page to founding a startup in a few years — and the curve keeps steepening.' },
  ],
  values: [
    { title: 'Ship end-to-end', description: 'Own every layer: data, API, UI, deployment.' },
    { title: 'Measure what matters', description: 'Track goals, time and learning — then act on the data.' },
    { title: 'Learn in public', description: 'Build openly, share progress, mentor others.' },
  ],
};

export const seedSiteConfig = {
  hero: {
    badge: 'SYSTEM ONLINE',
    heading: 'Tosif Raza',
    subtitle: 'Software Engineer & Founder',
    description: 'Building the future, one commit at a time. From Kolkata to the world — engineering solutions that matter.',
    primaryCta: { label: 'View Projects', target: 'projects' },
    secondaryCta: { label: 'Contact Me', target: 'contact' },
    showStats: true,
    showCurrentMission: true,
  },
  currentMission: {
    title: 'SkillBridge — MVP Phase',
    description: 'Currently building SkillBridge: realtime matching, secure payments, verified reviews.',
    progressLabel: 'Public beta live',
  },
  sections: DEFAULT_SECTIONS,
  nav: DEFAULT_NAV,
  globalReach: [],
  statsMode: 'auto',
  manualStats: [],
  footer: { text: 'TOSIF OS — a personal operating system built with the MERN stack.' },
  ai: {
    publicEnabled: true,
    privateEnabled: true,
    publicIntro: 'Ask anything about my work, skills and experience.',
    privateIntro: 'Ask about your goals, learning, time and progress.',
  },
};

/**
 * Insert all seed content. Called by server.js bootstrap on first boot
 * (only when the Project collection is empty).
 */
export async function seedContent(models) {
  const { Project, Skill, Timeline, Achievement, LearningTopic, Profile, AboutContent, SiteConfig, Experience, Product, PlanSetting } = models;

  await Project.insertMany(seedProjects);

  const skillDocs = await Skill.insertMany(
    seedSkills.map((s, i) => ({
      name: s.name,
      category: s.category,
      level: s.level,
      targetLevel: Math.min(100, s.level + 20), // editable placeholder target
      order: i + 1,
    }))
  );

  // Learning topics from the original skill learning paths
  const byName = Object.fromEntries(skillDocs.map((s) => [s.name, s._id]));
  const topics = [];
  let order = 0;
  for (const s of seedSkills) {
    if (!s.done && !s.todo) continue;
    for (const t of s.done || []) {
      topics.push({ skillId: byName[s.name], title: t, status: 'done', completedAt: new Date(), order: order++ });
    }
    for (const t of s.todo || []) {
      topics.push({ skillId: byName[s.name], title: t, status: 'todo', order: order++ });
    }
  }
  if (topics.length) await LearningTopic.insertMany(topics);

  await Timeline.insertMany(seedTimeline);
  await Achievement.insertMany(seedAchievements);
  await Product.insertMany(seedProducts);
  await Experience.insertMany(seedExperience);

  await Profile.create(seedProfile);
  await AboutContent.create(seedAbout);
  await SiteConfig.create(seedSiteConfig);

  const { TIME_CATEGORIES } = await import('../models/TimeEntry.js');
  await PlanSetting.insertMany(TIME_CATEGORIES.map((c) => ({ category: c, weeklyTargetMinutes: 0 })));
}
