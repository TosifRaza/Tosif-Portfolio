# Performance check — 29 October 2026

Changes: render the public shell without the blocking boot sequence; lazy-load public routes, individual legacy sections, private OS routes, terminal, AI/recruiter views and project Markdown. Preserve tool state after first use. Keep the terminal keyboard shortcut in the shell. Share concurrent anonymous API reads without retaining stale responses or caching authenticated requests. Avoid unnecessary JSON Content-Type headers on GET requests. Use React 18-compatible fetchpriority spelling. Remove terminal's redundant conditional AnimatePresence wrapper, which triggered a React ref warning in the installed motion dependency.

Results on this machine:

- Main production JavaScript: 695.90 KB → 364.78 KB (gzip 225.76 KB → 117.45 KB). Production browser trace confirmed only the 364,782-byte entry script loads initially; feature chunks load on demand.
- Fresh browser-context development homepage heading visible: baseline 5,248 ms; after changes 497–597 ms. These are local heading-visibility checks, not Lighthouse scores or guaranteed network load times.
- Frontend production build passes without the previous >500 KB chunk warning.
- Browser smoke check: home, projects, skills, experience, engineering lab, resume, contact, about, products, achievements, journey and OS login. No console errors/warnings or HTTP failures in the final run. Terminal open/close/reopen passes; 390px mobile viewport has no horizontal overflow.
- Production-preview route checks pass for home, skills, projects, experience, journey and OS login. Production API requests were redirected to the local backend for this check; hosted backend latency was not measured.
- API checks verify concurrent reads are shared, subsequent reads remain fresh, and failed requests can retry.

No deployment performed. External images, GitHub services, fonts and hosted backend response times remain network dependent. Existing design/content retained; the introductory blocking boot animation is bypassed on public pages for immediate access.
