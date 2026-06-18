# Founder OS v4.0 — Pure MERN Stack Edition

> **"Most developers build websites. I build products, businesses, and systems."** — Tosif Raza

A unique, recruiter-memorable, futuristic **operating-system-themed** portfolio built **strictly** with the MERN stack (MongoDB · Express.js · React.js · Node.js · JavaScript).

**This is the converted version of Founder OS v3.0.** The original was built with Next.js + TypeScript + Prisma — this version keeps every feature, animation, and section, but uses pure MERN (no TypeScript, no Next.js, no Prisma).

![Stack](https://img.shields.io/badge/stack-pure%20MERN-00D4FF) ![No TS](https://img.shields.io/badge/TypeScript-none-success) ![No Next](https://img.shields.io/badge/Next.js-none-success) ![Version](https://img.shields.io/badge/version-4.0.0-7C6AFF)

---

## 📦 Project Architecture

The project is split into **three independent applications**, exactly as required:

```
Founder-OS-MERN/
├── Backend/              # Express API + MongoDB + Mongoose + JWT auth
│   ├── config/           # DB connection (real MongoDB OR in-memory fallback)
│   ├── controllers/      # Business logic for each resource
│   ├── middleware/       # protect (JWT), errorHandler, asyncHandler
│   ├── models/           # User, Project, Skill, Timeline, Achievement, Contact, Resume
│   ├── routes/           # /auth /projects /skills /timeline /achievements /contact /resume /github /ai-recruiter
│   ├── services/         # GitHub API service
│   ├── utils/            # seed.js (re-seed) + seedData.js (auto-bootstrap data)
│   ├── uploads/          # Multer destination for resume files
│   └── server.js         # Express entry point
│
├── Frontend/             # Public React portfolio (Vite + Tailwind + Framer Motion + GSAP + Three.js)
│   └── src/
│       ├── components/BootSequence/   # 4-phase cinematic boot animation
│       ├── components/HomePage/       # Hero + system metrics + 8-module sidebar
│       ├── components/MissionHub/     # Sprint dashboard, OKRs, today's priorities
│       ├── components/SkillConstellation/  # 11 skills, proficiency rings, learning paths
│       ├── components/MissionDeck/    # Project deep-dives with ADRs & challenges
│       ├── components/LaunchControl/  # Startup dashboard with metrics & roadmap
│       ├── components/ChronoScroll/   # GSAP horizontal-scroll timeline
│       ├── components/RecruiterMode/  # Skill match engine
│       ├── components/FounderAI/      # AI assistant chat overlay
│       ├── components/TrophyRoom/     # Achievements with rarity system
│       ├── components/ContactPortal/  # 3-step launch form
│       ├── components/GlobalMap/      # SVG map with interactive markers
│       ├── components/Terminal/       # Ctrl+` Easter egg terminal
│       ├── components/Layout/         # Shared Sidebar (fixed nav bug from v3.0)
│       ├── components/ui/             # 48 shadcn/ui components (converted to JSX)
│       ├── context/                   # AppContext (useReducer) + ThemeContext
│       ├── data/                      # 10 data files (kept for static fallback)
│       ├── hooks/                     # useTypewriter, useCountUp, useKonamiCode, etc.
│       ├── lib/                       # cn() utility
│       └── utils/                     # constants, helpers, animations
│
├── Admin-Portal/         # Separate React app for CMS (Vite + Tailwind + JWT)
│   └── src/
│       ├── components/                # Layout, ProtectedRoute, ResourceManager
│       ├── context/AuthContext        # JWT token storage + auto-refresh
│       ├── pages/                     # Login, Dashboard, ProjectsManager, …
│       └── utils/api.js               # Admin API client
│
└── Documentation/        # Extra notes
```

---

## 🚀 Quick Start

### One-command dev (all three apps at once)

```bash
cd Founder-OS-MERN
npm install                       # installs concurrently at root
npm run install:all               # installs deps for all three sub-apps
npm run dev                       # starts Backend(:5000), Frontend(:3000), Admin(:5174)
```

Then visit:
- 🌐 **Public portfolio** → http://localhost:3000
- 🔐 **Admin portal** → http://localhost:5174 (login: `admin@founderos.dev` / `admin123`)
- ⚙️ **API** → http://localhost:5000/api/projects

### MongoDB? No setup required.

The backend uses [`mongodb-memory-server`](https://github.com/nodkz/mongodb-memory-server) when no `MONGO_URI` is set — so it boots instantly with no external dependencies. Data is wiped on restart, but seed data is auto-inserted on every boot.

To use a real MongoDB instead, copy `Backend/.env.example` to `Backend/.env` and set:
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/founder-os
```

---

## 🛠️ Tech Stack

**Strictly MERN — exactly as requested:**

| Layer       | Tech                                                            |
|-------------|-----------------------------------------------------------------|
| Database    | MongoDB (via Mongoose)                                          |
| API server  | Express.js 4                                                    |
| Auth        | JWT (jsonwebtoken + bcryptjs)                                   |
| Frontend    | React 18 (Vite) + Tailwind CSS 3 + Framer Motion 12 + GSAP + Three.js |
| Admin       | React 18 (Vite) + Tailwind CSS 3 + React Router 6              |
| Language    | **JavaScript only** — no TypeScript anywhere                    |

**Not used:** TypeScript, Next.js, Nuxt.js, Angular, Vue, PHP, Python, Laravel, Django, Firebase, Supabase, Prisma.

---

## 📚 API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                    | Auth  | Description                              |
|--------|-----------------------------|-------|------------------------------------------|
| POST   | `/auth/login`               | —     | Login, returns JWT                       |
| GET    | `/auth/me`                  | JWT   | Current user                             |
| GET    | `/projects`                 | —     | List all projects (missions)             |
| POST/PUT/DELETE | `/projects[/:id]`    | JWT   | CRUD                                     |
| GET    | `/skills`                   | —     | List skills (grouped by category)        |
| POST/PUT/DELETE | `/skills[/:id]`      | JWT   | CRUD                                     |
| GET    | `/timeline`                 | —     | List timeline entries                    |
| POST/PUT/DELETE | `/timeline[/:id]`     | JWT   | CRUD                                     |
| GET    | `/achievements`             | —     | List achievements                        |
| POST/PUT/DELETE | `/achievements[/:id]` | JWT   | CRUD                                     |
| POST   | `/contact`                  | —     | Public contact form submission           |
| GET    | `/contact`                  | JWT   | List all messages                        |
| PATCH  | `/contact/:id/read`         | JWT   | Mark message as read                     |
| DELETE | `/contact/:id`              | JWT   | Delete message                           |
| GET    | `/resume`                   | —     | Get active resume                        |
| GET    | `/resume/download`          | —     | Download active resume PDF               |
| POST   | `/resume`                   | JWT   | Upload new resume (multipart)            |
| GET    | `/github`                   | —     | GitHub stats (real API or mock fallback) |
| POST   | `/ai-recruiter/ask`         | —     | Ask the AI recruiter assistant           |

---

## 🎨 Frontend Sections (11 total)

1. **Boot Sequence** — 4-phase cinematic boot: Void → Pulse → Scan → Text → Dashboard
2. **HomePage** — Hero with orbital rings, system metrics, 6 feature cards, 8-module sidebar
3. **Mission Hub** — Sprint dashboard, Q3 OKRs, Today's Priorities, Vision 2030, Recent Activity
4. **Skill Constellation** — 11 skills across 4 categories with proficiency rings + learning paths
5. **Mission Deck** — Project cards with ADRs, challenges, architecture diagrams, live metrics
6. **Launch Control** — Startup dashboard with revenue chart, roadmap, business model canvas
7. **Chrono Scroll** — GSAP horizontal-scroll timeline
8. **Recruiter Mode** — Skill match engine that calculates job-fit %
9. **Trophy Room** — Achievements with rarity system (Common/Rare/Epic/Legendary)
10. **Contact Portal** — 3-step launch form: Hire Me / Join Team / Share Idea
11. **Global Map** — SVG India outline with interactive location markers

**Plus overlays:** Terminal Easter egg (Ctrl+`), Founder AI assistant, Konami code Easter egg.

---

## 🔐 Admin Portal Features

The Admin Portal is a **completely separate** React app with its own routing, auth context, and JWT-protected routes:

- **JWT login** with token persistence (localStorage) and auto-validation on mount
- **Dashboard** with live metrics pulled from every collection
- **Projects** — full CRUD with tags, difficulty, status, featured flag
- **Skills** — full CRUD with category, level, order
- **Timeline** — full CRUD with phase, year, icon
- **Achievements** — full CRUD with custom colors and emoji icons
- **Resume** — drag-and-drop upload, replaces active version, multi-version history
- **Messages** — view, mark as read, delete contact submissions

---

## 🔧 What Was Converted (v3.0 Next.js → v4.0 MERN)

| Original (v3.0)                     | Converted (v4.0)                          |
|-------------------------------------|-------------------------------------------|
| Next.js 16 app router               | Vite + React 18 (plain React, no Next.js) |
| TypeScript (67 TSX + 20 TS files)   | JavaScript (67 JSX + 20 JS files)         |
| Prisma + SQLite                     | Mongoose + MongoDB (in-memory for dev)    |
| `next/image`                        | Plain `<img>`                             |
| `next/navigation`                   | React Router (Admin) / Vite routing       |
| Next.js API routes (`/api/contact`) | Express route `/api/contact`              |
| Tailwind v4 `@theme` syntax         | Tailwind v3 standard `theme.extend`       |
| `"use client"` directives           | Removed (Vite doesn't need them)          |
| Sidebar only on HomePage/MissionHub | Sidebar on ALL sections (fixed bug)       |

**Conversion approach:** Used [Sucrase](https://github.com/alangpierce/sucrase) with `transforms: ['typescript', 'jsx']` and `jsxRuntime: 'preserve'` to strip TypeScript types while keeping JSX syntax intact. All 87 source files converted with 0 failures.

---

## 📜 License

MIT © 2026 Tosif Raza

Built with ☕, ⚡, and a relentless obsession with shipping.
