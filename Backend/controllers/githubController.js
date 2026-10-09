import { asyncHandler } from '../middleware/errorHandler.js';
import Profile from '../models/Profile.js';
import { fetchGitHubContributions, fetchGitHubProfile } from '../services/githubService.js';

// GET /api/github/contributions — fetch a fresh calendar from GitHub GraphQL.
export const getContributions = asyncHandler(async (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(503).json({ message: 'Live GitHub contributions require GITHUB_TOKEN in the backend environment.' });
  }

  const profile = await Profile.getSingleton();
  const username = profile.socials?.github?.match(/github\.com\/([^/?#]+)/i)?.[1];
  if (!username) {
    return res.status(400).json({ message: 'Add a GitHub profile URL in the public profile settings first.' });
  }

  try {
    res.json(await fetchGitHubContributions(username, token));
  } catch (error) {
    console.error('[github] Live contribution lookup failed:', error.message);
    res.status(502).json({ message: 'Unable to fetch live contributions from GitHub.' });
  }
});

// GET /api/github
// Returns GitHub stats. If no token / username configured, returns a
// graceful mock payload so the UI keeps working.
export const getStats = asyncHandler(async (_req, res) => {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return res.json({
      source: 'mock',
      username: 'tosifraza',
      name: 'Tosif Raza',
      bio: 'MERN Stack Developer • Product Builder',
      followers: 142,
      following: 87,
      publicRepos: 38,
      totalStars: 215,
      languages: [
        { name: 'JavaScript', value: 58, color: '#f1e05a' },
        { name: 'HTML', value: 18, color: '#e34c26' },
        { name: 'CSS', value: 12, color: '#563d7c' },
        { name: 'Shell', value: 7, color: '#89e051' },
        { name: 'Other', value: 5, color: '#94a3b8' },
      ],
      recentRepos: [
        { name: 'founder-os', stars: 24, forks: 4, description: 'Futuristic portfolio OS — MERN stack' },
        { name: 'skillbridge', stars: 56, forks: 11, description: 'Skill-sharing marketplace with realtime chat' },
        { name: 'mern-auth-toolkit', stars: 31, forks: 7, description: 'Production-ready JWT auth boilerplate' },
        { name: 'devpulse-dashboard', stars: 18, forks: 3, description: 'Analytics dashboard for indie devs' },
      ],
      commitActivity: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        commits: Math.floor(Math.random() * 18) + 1,
      })),
    });
  }

  try {
    const data = await fetchGitHubProfile(username, token);
    res.json({ source: 'github-api', ...data });
  } catch (err) {
    res.status(502).json({ message: 'GitHub API error', error: err.message });
  }
});
