// ─────────────────────────────────────────────
// FOUNDER OS v3.0 — Terminal Commands Data
// ─────────────────────────────────────────────







export const commands = [
  {
    name: "help",
    description: "Show available commands",
    handler: () =>
      `Available commands:
  about       - Who is Tosif Raza?
  skills      - List all skills
  projects    - Show project status
  resume      - Download resume
  colors      - Change or restore site colors
  edit        - Edit live website text
  matrix      - Enter the matrix
  hire        - Why you should hire me
  contact     - How to reach me
  coffee      - Brew some coffee
  sudo        - Try it ;)
  clear       - Clear terminal
  exit        - Nice try`,
  },
  {
    name: "about",
    description: "About Tosif Raza",
    handler: () =>
      `TOSIF RAZA
  ─────────────────────────────
  Software Engineer & Startup Founder
  Location: Kolkata, India
  Current: Building SkillBridge
  Philosophy: Build. Ship. Learn. Repeat.
  
  "Constraints breed creativity."`,
  },
  {
    name: "skills",
    description: "List all skills with proficiency",
    handler: () =>
      `SKILL MATRIX
  ─────────────────────────────
  Frontend:
    React       ████████░░ 80%
    JavaScript  ████████░░ 78%
    Tailwind    ████████░░ 80%
    HTML/CSS    █████████░ 90%
  
  Backend:
    Node.js     ████████░░ 75%
    Express     ███████░░░ 70%
    MongoDB     ██████░░░░ 65%
    REST API    ███████░░░ 72%
  
  Tools:
    Git         ███████░░░ 72%
    VS Code     █████████░ 85%
    Linux       █████░░░░░ 50%
    Docker      ████░░░░░░ 40%`,
  },
  {
    name: "projects",
    description: "Show project status",
    handler: () =>
      `PROJECT STATUS
  ─────────────────────────────
  🔵 SkillBridge     LIVE    85%  120 users
  🟡 Portfolio v3    BUILD   90%  (this site)
  🟢 Dashboard App   DONE    100%
  🟢 Todo App Pro    DONE    100%`,
  },
  {
    name: "resume",
    description: "Download resume",
    handler: () =>
      `Opening resume download...
  ─────────────────────────────
  ✅ Resume PDF ready for download
  Click the download button in Recruiter Mode`,
  },
  {
    name: "hire",
    description: "Why hire Tosif",
    handler: () =>
      `WHY HIRE TOSIF?
  ─────────────────────────────
  1. Real product experience (SkillBridge: 120+ users)
  2. Full-stack capability (frontend + backend + deploy)
  3. Entrepreneurial mindset (problem → solution)
  4. Active builder (daily commits, growing startup)
  5. Growth trajectory (learning curve is steep ↑)
  
  ✅ Great choice! Switching to Recruiter Mode...`,
  },
  {
    name: "contact",
    description: "How to reach Tosif",
    handler: () =>
      `CONTACT OPTIONS
  ─────────────────────────────
  📧 Email:    tosif@example.com
  💼 LinkedIn: linkedin.com/in/tosifraza
  🐙 GitHub:   github.com/tosifraza
  🐦 Twitter:  twitter.com/tosifraza
  
  Or use the Contact Portal →`,
  },
  {
    name: "edit",
    description: "Edit live website text",
    handler: () => "__CONTENT__",
  },
  {
    name: "colors",
    description: "Change or restore site colors",
    handler: () => "__COLORS__",
  },
  {
    name: "matrix",
    description: "Enter the matrix",
    handler: () => "__MATRIX__",
  },
  {
    name: "coffee",
    description: "Brew some coffee",
    handler: () =>
      `☕ Brewing coffee...
  ─────────────────────────────
  Error: Coffee machine not connected.
  Falling back to chai... ☕
  Chai ready. Kolkatan defaults applied.
  Sugar: Extra. Milk: Full. Spirit: Unlimited.`,
  },
  {
    name: "sudo",
    description: "Try it ;)",
    handler: () =>
      `nice try.
  ─────────────────────────────
  There is no sudo. Only build.
  You are already root. Now ship something.`,
  },
  {
    name: "exit",
    description: "Exit terminal",
    handler: () =>
      `Nice try.
  ─────────────────────────────
  There is no exit from building. 🚀`,
  },
];

export const getCommandResponse = (input) => {
  const trimmed = input.trim().toLowerCase();
  const cmd = commands.find((c) => c.name === trimmed);
  
  if (cmd) return cmd.handler();
  
  if (trimmed === "clear") return "__CLEAR__";
  
  return `Command not found: ${input}
Type 'help' for available commands.`;
};
