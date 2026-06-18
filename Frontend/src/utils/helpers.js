// ─────────────────────────────────────────────
// FOUNDER OS v3.0 — Helpers
// ─────────────────────────────────────────────

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Good morning, Recruiter";
  if (hour >= 12 && hour < 17) return "Good afternoon, Recruiter";
  if (hour >= 17 && hour < 21) return "Good evening, Recruiter";
  return "Late night explorer? Respect. 🌙";
}

export function getRelativeTime(timeStr) {
  return timeStr;
}

export function calculateMatch(requirements, weights) {
  const words = requirements.toLowerCase().split(/[\s,;]+/).filter(Boolean);
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const [skill, weight] of Object.entries(weights)) {
    totalWeight += weight;
    if (words.some((w) => skill.includes(w) || w.includes(skill))) {
      matchedWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.min(Math.round((matchedWeight / totalWeight) * 100), 100);
}

export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function debounce(
  fn,
  delay
) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
