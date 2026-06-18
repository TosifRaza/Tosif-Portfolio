import { asyncHandler } from '../middleware/errorHandler.js';
import { fetchGitHubProfile } from '../services/githubService.js';

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
