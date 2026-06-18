// ─────────────────────────────────────────────
// FOUNDER OS v3.0 — Achievements Data
// ─────────────────────────────────────────────

 


















export const achievementCategories = [
  {
    name: "Learning Path",
    icon: "graduation-cap",
    items: [
      { id: "html-basics", title: "HTML Foundations", description: "Mastered semantic HTML structure", icon: "file-code", stars: 3, rarity: "common", unlocked: true },
      { id: "css-mastery", title: "CSS Mastery", description: "Flexbox, Grid, animations, and responsive design", icon: "palette", stars: 3, rarity: "common", unlocked: true },
      { id: "js-ninja", title: "JavaScript Ninja", description: "ES6+, async/await, closures, and DOM mastery", icon: "code", stars: 3, rarity: "rare", unlocked: true },
      { id: "react-architect", title: "React Architect", description: "Components, hooks, state management, and patterns", icon: "layers", stars: 2, rarity: "rare", unlocked: true },
      { id: "typescript", title: "TypeScript Explorer", description: "Type system and advanced patterns", icon: "shield", stars: 1, rarity: "common", unlocked: false, progress: 30 },
    ],
  },
  {
    name: "Builder Path",
    icon: "hammer",
    items: [
      { id: "first-website", title: "First Website", description: "Built and deployed the first website", icon: "globe", stars: 3, rarity: "common", unlocked: true },
      { id: "fullstack-app", title: "Full-Stack App", description: "Built a complete MERN stack application", icon: "server", stars: 2, rarity: "epic", unlocked: true },
      { id: "startup-founded", title: "Startup Founder", description: "Founded and launched a real product", icon: "rocket", stars: 3, rarity: "legendary", unlocked: true },
      { id: "production-deploy", title: "Production Deploy", description: "Deployed app to production with real users", icon: "cloud", stars: 1, rarity: "rare", unlocked: false, progress: 85 },
    ],
  },
  {
    name: "Growth Path",
    icon: "trending-up",
    items: [
      { id: "100-commits", title: "100 Commits", description: "Reached 100 GitHub commits", icon: "git-commit", stars: 3, rarity: "common", unlocked: true },
      { id: "500-commits", title: "500 Commits", description: "Reached 500 GitHub commits", icon: "git-commit", stars: 2, rarity: "rare", unlocked: true },
      { id: "1000-commits", title: "1000 Commits", description: "Reached 1000 GitHub commits", icon: "git-commit", stars: 1, rarity: "epic", unlocked: false, progress: 92 },
      { id: "100-stars", title: "100 Stars", description: "Get 100 GitHub stars on a project", icon: "star", stars: 1, rarity: "epic", unlocked: false, progress: 0 },
    ],
  },
  {
    name: "Discovery",
    icon: "compass",
    items: [
      { id: "terminal-master", title: "Terminal Master", description: "Found and used the hidden terminal", icon: "terminal", stars: 2, rarity: "rare", unlocked: false },
      { id: "konami-code", title: "Konami Master", description: "Entered the legendary Konami code", icon: "gamepad", stars: 3, rarity: "epic", unlocked: false },
      { id: "dedicated-visitor", title: "Dedicated Visitor", description: "Clicked 100 times exploring the portfolio", icon: "mouse-pointer-click", stars: 1, rarity: "common", unlocked: false },
      { id: "speed-runner", title: "Speed Runner", description: "Completed the 30-second speed run", icon: "zap", stars: 2, rarity: "rare", unlocked: false },
    ],
  },
];

export const rarityColors = {
  common: "#6B6B80",
  rare: "#00D4FF",
  epic: "#7C6AFF",
  legendary: "#FFB800",
};

export const rarityLabels = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};
