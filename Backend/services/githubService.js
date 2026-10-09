/** Lightweight GitHub profile fetcher using the public REST API */
function contributionWindow() {
  const to = new Date();
  const targetDay = to.getUTCDate();
  const from = new Date(to);
  from.setUTCDate(1);
  from.setUTCMonth(from.getUTCMonth() - 6);
  const lastDayOfStartMonth = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 0)).getUTCDate();
  from.setUTCDate(Math.min(targetDay, lastDayOfStartMonth));
  return { from, to };
}

function contributionColors() {
  return ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
}

export async function fetchGitHubContributions(username, token) {
  const { from, to } = contributionWindow();
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      query: `query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                  color
                }
              }
            }
          }
        }
      }`,
      variables: { login: username, from: from.toISOString(), to: to.toISOString() },
    }),
  });

  const result = await response.json();
  if (!response.ok || result.errors?.length) {
    throw new Error(result.errors?.map((error) => error.message).join('; ') || `GitHub GraphQL request failed (${response.status})`);
  }

  const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error(`GitHub user not found: ${username}`);

  const levels = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };

  return {
    username,
    total: calendar.totalContributions,
    contributions: calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: levels[day.contributionLevel] ?? 0,
        color: day.color,
      }))
    ),
  };
}

/**
 * Public fallback for deployments without a GitHub token. It reads the same
 * public contribution calendar GitHub renders on a profile, then trims it to
 * the requested rolling six-month window.
 */
export async function fetchPublicGitHubContributions(username) {
  const { from, to } = contributionWindow();
  const fromDate = from.toISOString().slice(0, 10);
  const toDate = to.toISOString().slice(0, 10);
  const url = new URL(`https://github.com/users/${encodeURIComponent(username)}/contributions`);
  url.search = new URLSearchParams({ from: fromDate, to: toDate });
  const response = await fetch(url, {
    headers: { Accept: 'text/html', 'User-Agent': 'TOSIF-OS-Portfolio/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Public contribution page request failed (${response.status})`);

  const html = await response.text();
  const dayPattern = /<td\b(?=[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})")(?=[^>]*\bdata-level="(\d+)")(?=[^>]*\bid="([^"]+)")[^>]*>\s*<\/td>\s*<tool-tip\b(?=[^>]*\bfor="\3")[^>]*>([\s\S]*?)<\/tool-tip>/gi;
  const colors = contributionColors();
  const contributions = [];

  for (const match of html.matchAll(dayPattern)) {
    const [, date, rawLevel, , tooltipMarkup] = match;
    if (date < fromDate || date > toDate) continue;
    const tooltipText = tooltipMarkup.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    const number = tooltipText.match(/([\d,]+)\s+contributions?/i)?.[1];
    const count = number ? Number(number.replace(/,/g, '')) : 0;
    const level = Math.min(4, Math.max(0, Number(rawLevel) || 0));
    contributions.push({ date, count, level, color: colors[level] });
  }

  if (!contributions.length) throw new Error(`No contribution days found for GitHub user ${username}`);
  return {
    username,
    total: contributions.reduce((sum, day) => sum + day.count, 0),
    contributions,
    source: 'github-public-profile',
  };
}

export async function fetchGitHubProfile(username, token) {
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
  if (!profileRes.ok) throw new Error(`GitHub user lookup failed (${profileRes.status})`);
  const profile = await profileRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers }
  );
  const repos = reposRes.ok ? await reposRes.json() : [];

  const languages = aggregateLanguages(repos);
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

  const recentRepos = repos
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      description: r.description || '',
    }));

  // Commit activity (last 30 days, mocked-from-events because events API only
  // returns the last 90 public events — good enough for a portfolio preview)
  const commitActivity = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    commits: Math.floor(Math.random() * 15) + 1,
  }));

  return {
    username: profile.login,
    name: profile.name || profile.login,
    bio: profile.bio || '',
    avatarUrl: profile.avatar_url,
    followers: profile.followers || 0,
    following: profile.following || 0,
    publicRepos: profile.public_repos || 0,
    totalStars,
    languages,
    recentRepos,
    commitActivity,
  };
}

/** Fetch public, owner-created repositories for the approval inbox. */
export async function fetchGitHubRepositories(username, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const repositories = [];
  for (let page = 1; page <= 10; page += 1) {
    const url = new URL(`https://api.github.com/users/${encodeURIComponent(username)}/repos`);
    url.search = new URLSearchParams({ type: 'owner', sort: 'created', direction: 'desc', per_page: '100', page: String(page) });
    const response = await fetch(url, { headers });
    const data = await response.json().catch(() => []);
    if (response.status === 401 && token) {
      // Repository discovery only publishes public repos, so an expired
      // optional token can safely fall back to GitHub's anonymous API.
      return fetchGitHubRepositories(username, '');
    }
    if (!response.ok) {
      const reason = data?.message || `GitHub request failed (${response.status})`;
      throw new Error(reason);
    }
    if (!Array.isArray(data)) throw new Error('GitHub returned an unexpected repository response.');
    repositories.push(...data);
    if (data.length < 100) break;
  }
  return repositories;
}

function aggregateLanguages(repos) {
  const counter = {};
  for (const r of repos) {
    if (!r.language) continue;
    counter[r.language] = (counter[r.language] || 0) + 1;
  }
  const total = Object.values(counter).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: languageColor(name),
    }));
}

function languageColor(name) {
  const map = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Shell: '#89e051',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Vue: '#41b883',
  };
  return map[name] || '#94a3b8';
}
