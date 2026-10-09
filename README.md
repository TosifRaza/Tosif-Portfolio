# TOSIF OS v6.0 — Personal Operating System + Professional Portfolio

> **"A professional portfolio on the outside and a personal operating system on the inside."**

TOSIF OS is a fully dynamic, database-driven MERN application with two modes:

- **PUBLIC MODE** — a clean, professional multi-page portfolio (navy/blue design, dark + light theme):
  Home · Projects · Skills · Experience · Engineering Lab · Resume · Contact,
  plus CMS-gated About / Products / Achievements / Journey / Global Reach pages,
  a **Recruiter View (HIRE ME)** and an **ENTER TOSIF OS** gateway.
- **PRIVATE MODE** (`/os`, JWT-protected) — a personal operating system:
  Dashboard intelligence · Goals → Milestones → Tasks · Daily Log · Time tracking with a live timer ·
  Learning sessions & topics · Skills with current/target levels · Analytics (daily/weekly/monthly/yearly)
  · Plan vs Actual · Estimated goal trajectories · Founder Lab · Achievements · Personal AI · Settings.
- **ADMIN CONTROL CENTER** (`Admin-Portal`, JWT + admin-role protected) — manages the **entire public
  website and the personal OS without touching React code**: Profile, Hero, section visibility & order,
  Navigation, About, Experience, Skills, Projects (draft/publish), Products, Achievements, Timeline,
  Resume, Messages, Goals, Tasks, Activities, Time, Learning, Analytics, AI configuration, Settings.

Stack: **MongoDB · Express · React (Vite) · Node.js** — pure JavaScript, Tailwind CSS, Framer Motion,
GSAP, Recharts. No TypeScript, no Next.js.

---

## Quick start

Prerequisites: Node.js 18+ (Node 20/22/24 recommended). A local MongoDB is **optional**.

From the repository root, install all three apps with `npm run install:all` before starting them. Running `npm install` at the root installs only the root development tools.

```bash
# 1 — Backend (port 5000)
cd Backend
npm install
cp .env.example .env        # optionally set MONGO_URI; development uses a temporary JWT secret otherwise
npm run dev                 # an in-memory MongoDB is used only for local development

# 2 — Public portfolio (port 3000)
cd ../Frontend
npm install
npm run dev

# 3 — Admin Control Center (port 5174)
cd ../Admin-Portal
npm install
npm run dev
```

Open http://localhost:3000 (portfolio) and http://localhost:5174 (Control Center).

On boot the backend **ensures the configured admin exists** (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`) — an existing admin's password is never overwritten. Forgot your password? Run:

```bash
cd Backend
npm run reset-admin          # or: node reset-admin.js <email> <newpassword>
```

The same account unlocks the private OS at http://localhost:3000/os.

### Production builds

```bash
cd Frontend && npm run build      # → Frontend/dist
cd Admin-Portal && npm run build  # → Admin-Portal/dist
```

Serve `dist/` behind any static host and point `/api` + `/uploads` at the backend
(same Vite proxy paths, or set `VITE_API_URL` before building).

### Backend deployment

The repository includes a Docker deployment. Copy `Backend/.env.production.example` to `Backend/.env.production`, fill in the values below, then run from the repository root:

```bash
docker compose -f compose.production.yaml up --build -d
docker compose -f compose.production.yaml ps
```

The image uses Node 22, starts with `npm start`, and the Compose file keeps uploads in a named persistent volume. MongoDB must be a persistent external MongoDB service; the container does not launch an unauthenticated database. Docker and Docker Compose must be installed on the deployment host.

For non-Docker Node.js hosting, deploy the `Backend` directory with Node 20 or newer, install production dependencies with `npm ci --omit=dev`, and use `npm start`. Set the following variables in the hosting provider or `Backend/.env.production` (never commit production secrets):

- `NODE_ENV=production` and the provider supplied `PORT`.
- `MONGO_URI` for a persistent MongoDB database.
- `JWT_SECRET` with at least 32 random bytes.
- `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters. The admin is created at first startup if the database has no users.
- `CORS_ORIGINS` as comma-separated exact HTTPS origins for the public site and admin portal, with no paths or wildcard domains.
- `UPLOAD_DIR` as the absolute path of a persistent mounted volume. Resume files and legacy disk uploads use this volume; new portfolio images are stored in MongoDB. On startup, referenced local images are migrated into MongoDB when their files are present.
- `GITHUB_TOKEN` is optional for the contribution calendar. When it is missing or invalid, the backend falls back to the public GitHub contribution calendar and caches the result.

For Docker Compose, set `UPLOAD_DIR` automatically to `/data/uploads`; the named volume persists it across container replacements. Set `HOST_PORT` only if the host should expose the API on a port other than 5000. Keep the environment file private; `.env.production` is Git-ignored.

The service listens on the provider's `PORT`, binds to `0.0.0.0`, and exposes `GET /health`. The health check returns HTTP 503 until MongoDB is connected. Production startup fails when a required variable is missing or invalid. Copy `Backend/.env.example` for the variable names; it contains no production credentials.

For the deployed public frontend, set Vercel's `VITE_API_URL` environment variable to the backend origin (for example, `https://api.your-domain.com`, with no `/api` suffix), then redeploy the frontend. The backend CORS list already includes `https://tosif.site` and the stable `https://tosif-portfolio-frontend.vercel.app` domain. If the Admin Portal is deployed at another domain, add that exact HTTPS origin to `CORS_ORIGINS` and set the same `VITE_API_URL` for its build. Templates are in `Frontend/.env.production.example` and `Admin-Portal/.env.production.example`.

---

## Architecture

```
tosif-os/
├── Backend/          Express API (port 5000)
│   ├── models/       23 Mongoose models:
│   │                 public CMS: Project, Skill, Timeline, Achievement, Experience, Product,
│   │                 Profile, AboutContent, SiteConfig, Resume, Contact
│   │                 personal OS: Goal, Milestone, Task, DailyActivity, TimeEntry,
│   │                 LearningSession, LearningTopic, PlanSetting, GoalSnapshot, Habit, JournalEntry
│   │                 auth: User
│   ├── services/     progressService (task→milestone→goal rollup + snapshots),
│   │                 analyticsService (time/learning aggregates, plan-vs-actual, consistency),
│   │                 trajectoryService (estimated goal ETA from real history),
│   │                 dashboardService (dashboard intelligence), insightService (Personal AI)
│   ├── routes/       public: /api/site /api/profile /api/about /api/stats /api/projects
│   │                 /api/skills /api/timeline /api/achievements /api/experience /api/products
│   │                 /api/resume /api/contact /api/github /api/ai-recruiter
│   │                 private (JWT): /api/goals /api/milestones /api/tasks /api/activities
│   │                 /api/time /api/learning /api/analytics /api/predictions /api/dashboard
│   │                 /api/insights /api/habits /api/journal  + /api/upload (admin)
│   └── middleware/   protect (JWT), adminOnly (role), validate.js, errorHandler, rate limiting
│
├── Frontend/         Public portfolio + Private OS (port 3000)
│   ├── components/   OS-styled public sections (CMS-driven), TopBar, BootSequence (skip,
│   │                 once per session), Terminal easter egg, RecruiterMode, FounderAI
│   └── src/os/       Private OS: lazy-loaded /os route tree with its own layout, auth guard,
│                     dashboard, goals, tasks, daily log, time, learning, skills, analytics,
│                     timeline, founder lab, achievements, personal AI, settings
│
└── Admin-Portal/     TOSIF OS CONTROL CENTER (port 5174)
    └── pages/        Grouped CMS: Public Website / Personal OS / Analytics / AI / Settings,
                      generic ResourceManager with draft→publish and ordering support
```

### Key behaviours

- **Single source of truth** — the database. The public frontend and the private OS are API
  consumers; the Admin Portal is the content controller. No business content is hardcoded.
- **Section visibility & order** — `SiteConfig.sections` controls which public sections render and
  in what order (rendering-level, not CSS-hiding). Navigation labels/order come from `SiteConfig.nav`.
- **Draft → Published → Archived** — Projects, Products and Experience. The public API only ever
  returns published documents; admins see everything.
- **Honest numbers** — stats are calculated from real collection counts (`/api/stats`), analytics are
  aggregated from real logs, and when there is not enough data the UI says "Not enough data yet."
  Product metrics are empty by default; admins enter real numbers.
- **Goal trajectory** — computed from the goal's daily progress snapshots (pace per week over the
  observation window) and scenario ETAs from the observed progress-per-hour ratio. Always labelled
  as an estimate; returns "insufficient data" below two recorded days.
- **Personal AI** — rule-based insight engine answering from the owner's records (what did I learn
  today, which goal is behind, where is my time going, what to focus on next, …). Optionally, setting
  `AI_BASE_URL` + `AI_API_KEY` + `AI_MODEL` in `Backend/.env` lets any OpenAI-compatible model rephrase
  the computed answer — the numbers still come from the database.

### Security

- JWT auth (fail-fast if `JWT_SECRET` is missing), `adminOnly` role guard on all CMS writes,
  backend authorization on every private route (the React guard is convenience, not security).
- Rate limiting (global + strict on auth/contact), CORS whitelist (env-driven), mass-assignment
  protection (field whitelists), input validation on all mutations, private data never exposed
  through public endpoints.
- No credentials are shipped: `.env` files are sanitized, the login screens have no prefills and the
  README/seed no longer publish admin passwords. **Rotate any credentials you had in the old archive.**

---

## Testing

The backend ships with a full API test suite covering the six user flows (goal→milestone→task rollups,
learning analytics, time tracking, plan vs actual, trajectory, public/private isolation) plus the
CMS acceptance tests (create → publish → update → disable → ordering):

```bash
cd Backend
node ../../scripts/test_backend.js   # or copy the script anywhere; needs the API running
```

Frontend and Admin production builds must both succeed (`npm run build` in each).

---

## Changelog v4.0 → v5.0

- Public/Private architecture with JWT-protected `/os` mode and professional recruiter-first site.
- 16 new models, 20+ new API route groups, progress rollup engine, analytics aggregations,
  plan-vs-actual, goal trajectory estimator, dashboard intelligence, personal AI insight engine.
- Full CMS control of the public site (sections, navigation, hero, about, profile, experience,
  products, publish states, ordering, stats mode, global reach, AI toggles).
- Boot sequence: shortened, skippable, once per session. Terminal kept as an easter egg.
- Fixed from the security audit: leaked Atlas credentials removed, JWT secret enforced, adminOnly
  enforced, CORS whitelist repaired, rate limiting added, dead VIEW RESUME button wired, Vision Board
  nav mismatch removed, login prefills removed.
- Unused heavy dependencies (three/@react-three, @mdxeditor, zustand, etc.) left declared but
  unimported in the bundle — the private OS is lazy-loaded so public visitors never download it.

---

## Changelog v5.0 → v6.0 (professional redesign)

- **New design system** — professional navy + blue palette replacing the purple/cyan OS theme,
  applied consistently across the public site, private OS and Admin Control Center.
- **Dark + light theme** — moon/sun toggle in the public navbar; every screen is theme-aware via
  CSS design tokens (Tailwind `darkMode: 'class'`). Choice persists in localStorage.
- **Multi-page public site** — real routes instead of a single scrolling page:
  `/` · `/projects` · `/skills` · `/experience` · `/engineering-lab` · `/resume` · `/contact`,
  plus `/about`, `/products`, `/achievements`, `/journey`, `/globalreach` — every route is
  CMS-gated (disable the section in Admin and the page disappears, nav included).
- **New Engineering Lab page** — "Learn · Build · Improve": projects categorised as
  `learning` / `open-source` (or any `lab:` prefix) with category filters and detail modals.
- **CMS still controls everything** — navigation labels/order/targets, section visibility + order,
  hero (badge/heading/subtitle/description/CTAs), current mission, stats mode, footer.
- **Fixed a silent theme bug** — the old Tailwind config defined `purple`/`cyan` as single strings,
  which silently disabled every `purple-500`-style shade class. Both are now full blue scales.
- **Migrated ~250 hardcoded hex colours to design tokens** across 126 files, so light/dark themes
  and future re-themes are one-line changes.
- **Admin bootstrap hardening** — the admin account is now ensured on every boot (previously only
  created when the users collection was empty, which silently skipped it on non-empty databases),
  and `npm run reset-admin` force-creates/resets credentials.
- **Vercel/Docker deployment (from your fork) preserved** — `Backend/Dockerfile`,
  `compose.production.yaml`, Vercel SPA rewrite, production CORS whitelist all untouched.
- **Testing** — 15-check backend API suite (`scripts/test_backend.mjs`), production builds for
  Frontend and Admin, browser E2E across all public pages, both themes, mobile (390×844),
  private OS login → dashboard, and CMS → public reflection. Zero console errors.
