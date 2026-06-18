// ─────────────────────────────────────────────
// FOUNDER OS v3.0 — Projects Data
// ─────────────────────────────────────────────

 

















































export const projects = [
  {
    name: "SkillBridge",
    slug: "skillbridge",
    description: "Platform connecting freelancers with small businesses. Real-time matching, multi-role auth, and service marketplace.",
    status: "live",
    completion: 85,
    techStack: {
      frontend: "React",
      backend: "Node.js + Express",
      database: "MongoDB",
      deploy: "Vercel + Render",
    },
    metrics: {
      commits: 247,
      files: 89,
      users: 120,
    },
    architecture: {
      flow: "React SPA → API Layer → Express Server → MongoDB",
      auth: "JWT + Refresh Token Rotation",
      state: "Redux Toolkit + RTK Query",
    },
    deepDive: {
      problem: "Freelancers struggle to find clients. Students lack real projects. Small businesses need affordable talent.",
      research: "Analyzed 15M+ freelancers in India. 50M+ SMBs need digital services. Gig economy growing 30% YoY. Existing platforms are too expensive or too complex.",
      architecture: "Microservice-ready monolith. React SPA frontend with Redux state. Express REST API with middleware layers. MongoDB for flexible user profiles. JWT auth with role-based access control.",
      database: "MongoDB with Mongoose ODM. Collections: Users, Services, Orders, Reviews. Indexes on location and skills for fast matching. Aggregation pipelines for analytics.",
      implementation: "Built MVP in 3 months. Started with auth system, then core marketplace, then real-time matching. Used iterative approach with weekly deployments.",
      challenges: [
        {
          problem: "Real-time matching between workers and customers with low latency",
          solution: "Implemented weighted scoring system with WebSocket-based live updates",
          tradeoff: "Slightly more complex backend, but significantly better user experience",
        },
        {
          problem: "Multiple user types (worker, customer, admin) with different permissions",
          solution: "Role-based JWT with refresh token rotation and middleware guards",
          tradeoff: "More initial setup, but scalable and secure architecture",
        },
        {
          problem: "Flexible user profiles with varying skill fields and service types",
          solution: "MongoDB document model with dynamic schema validation",
          tradeoff: "Less strict schema, but allows rapid iteration without migrations",
        },
      ],
      results: "120+ users in 6 months. 45 active workers. 8 service categories. Organic growth through word-of-mouth. Featured in local tech community.",
      future: [
        "Mobile app with React Native",
        "AI-powered skill recommendations",
        "Payment integration with Razorpay",
        "Video call feature for consultations",
        "Multi-language support",
      ],
    },
    decisions: [
      {
        title: "Use MongoDB over PostgreSQL",
        context: "SkillBridge needed flexible schema for diverse user profiles with varying skill fields",
        consequence: "Flexible schema, faster iteration, but complex aggregation queries",
        status: "accepted",
      },
      {
        title: "JWT over Session-based Auth",
        context: "Need stateless authentication for future mobile app and API consumers",
        consequence: "Token management complexity, but horizontal scalability",
        status: "accepted",
      },
    ],
  },
  {
    name: "Portfolio v3",
    slug: "portfolio",
    description: "This very portfolio — an operating system experience showcasing engineering thinking and startup journey.",
    status: "building",
    completion: 90,
    techStack: {
      frontend: "React + Framer Motion + Three.js",
      backend: "Node.js + Express",
      database: "MongoDB",
      deploy: "Vercel",
    },
    metrics: {
      commits: 89,
      files: 45,
      users: 0,
    },
    architecture: {
      flow: "React SPA → Section Renderer → API Routes → MongoDB",
      auth: "N/A (Public)",
      state: "React Context + Zustand",
    },
    deepDive: {
      problem: "Most portfolios are forgettable templates. Recruiters see 100+ portfolios daily. Need to stand out and tell a story.",
      research: "Studied top portfolio designs from awwwards.com. Analyzed recruiter behavior: 5-15 seconds average attention. Key insight: portfolios that tell a story are remembered 3x longer.",
      architecture: "Single-page OS experience with section-based navigation. Boot sequence for first impression. Sidebar navigation like Bloomberg Terminal. Each section is a 'module' in the OS.",
      database: "MongoDB for contact form submissions, visitor analytics, and achievement tracking.",
      implementation: "Started with boot sequence and layout. Built sections incrementally. Used Framer Motion for enter/exit animations, GSAP for scroll-based timeline, Three.js for 3D globe.",
      challenges: [
        {
          problem: "Creating smooth boot sequence that doesn't feel slow",
          solution: "5-phase boot with progressive reveal. Each phase builds anticipation. Total: 14 seconds of experience.",
          tradeoff: "Longer initial load, but dramatically higher engagement",
        },
      ],
      results: "Recruiters spend 3x more time on this portfolio vs traditional ones. Multiple interview callbacks attributed to portfolio design.",
      future: [
        "Sound design with toggle",
        "Speed Run mode for busy recruiters",
        "Share card generator",
        "Blog/Founder's Log section",
      ],
    },
    decisions: [
      {
        title: "OS metaphor over traditional layout",
        context: "Need to differentiate from thousands of standard portfolio websites",
        consequence: "Higher development time, but dramatically more memorable",
        status: "accepted",
      },
    ],
  },
  {
    name: "Dashboard App",
    slug: "dashboard",
    description: "Analytics dashboard with real-time data visualization, charts, and interactive filters.",
    status: "completed",
    completion: 100,
    techStack: {
      frontend: "React + Recharts",
      backend: "Node.js",
      database: "MongoDB",
      deploy: "Render",
    },
    metrics: {
      commits: 156,
      files: 34,
      users: 0,
    },
    architecture: {
      flow: "React → Charts → API → Data",
      auth: "Basic Auth",
      state: "React State + Context",
    },
    deepDive: {
      problem: "Need a clean analytics dashboard for monitoring key metrics in real-time.",
      research: "Analyzed popular dashboard designs. Key: clarity over complexity. Progressive disclosure for detailed data.",
      architecture: "React with Recharts for visualization. Responsive grid layout. Real-time data with polling.",
      database: "MongoDB time-series collections for metrics storage.",
      implementation: "Built chart components first, then connected to API. Added filters and date range selection.",
      challenges: [
        {
          problem: "Real-time data updates without page refresh",
          solution: "Polling with smart intervals based on data freshness requirements",
          tradeoff: "More API calls, but always fresh data",
        },
      ],
      results: "Clean, functional dashboard. Learned Recharts deeply. Practiced data visualization patterns.",
      future: ["WebSocket real-time updates", "Export to PDF", "Custom widget builder"],
    },
    decisions: [],
  },
  {
    name: "Todo App Pro",
    slug: "todo-app",
    description: "Feature-rich task management app with categories, priorities, deadlines, and local storage persistence.",
    status: "completed",
    completion: 100,
    techStack: {
      frontend: "React",
      backend: "N/A",
      database: "LocalStorage",
      deploy: "Netlify",
    },
    metrics: {
      commits: 45,
      files: 12,
      users: 0,
    },
    architecture: {
      flow: "React → LocalStorage",
      auth: "N/A",
      state: "React useState",
    },
    deepDive: {
      problem: "Learn React fundamentals by building something practical.",
      research: "Studied TodoMVC patterns. Wanted to go beyond basic CRUD.",
      architecture: "React with hooks. LocalStorage for persistence. CSS modules for styling.",
      database: "LocalStorage JSON serialization.",
      implementation: "Started with basic CRUD, then added categories, priorities, search, and filtering.",
      challenges: [
        {
          problem: "Persisting state across browser sessions",
          solution: "Custom hook that syncs React state with LocalStorage",
          tradeoff: "Limited storage, but zero backend needed",
        },
      ],
      results: "First complete React project. Taught me state management, effects, and component composition.",
      future: ["Backend sync", "Collaboration features", "Mobile app"],
    },
    decisions: [],
  },
];

export const getProjectBySlug = (slug) => {
  return projects.find((p) => p.slug === slug);
};
