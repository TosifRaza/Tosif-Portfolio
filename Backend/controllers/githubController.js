import { asyncHandler } from '../middleware/errorHandler.js';
import Profile from '../models/Profile.js';
import { fetchGitHubContributions, fetchGitHubProfile, fetchPublicGitHubContributions } from '../services/githubService.js';

const contributionCache = new Map();
const CONTRIBUTION_CACHE_MS = 6 * 60 * 60 * 1000;

// GET /api/github/contributions — fetch a fresh calendar from GitHub GraphQL.
export const getContributions = asyncHandler(async (_req, res) => {
  const profile = await Profile.getSingleton();
  const username = profile.socials?.github?.match(/github\.com\/([^/?#]+)/i)?.[1];
  if (!username) {
    return res.status(400).json({ message: 'Add a GitHub profile URL in the public profile settings first.' });
  }

  const cached = contributionCache.get(username.toLowerCase());
  if (cached && Date.now() - cached.savedAt < CONTRIBUTION_CACHE_MS) {
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.json(cached.data);
  }

  const token = process.env.GITHUB_TOKEN;
  let lastError;
  try {
    if (token) {
      const data = await fetchGitHubContributions(username, token);
      contributionCache.set(username.toLowerCase(), { data, savedAt: Date.now() });
      res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return res.json(data);
    }
  } catch (error) {
    lastError = error;
    console.warn('[github] Authenticated contribution lookup failed; trying the public profile calendar.');
  }

  try {
    const data = await fetchPublicGitHubContributions(username);
    contributionCache.set(username.toLowerCase(), { data, savedAt: Date.now() });
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.json(data);
  } catch (error) {
    console.error('[github] Public contribution lookup failed:', error.message);
    const stale = contributionCache.get(username.toLowerCase());
    if (stale) {
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
      return res.json({ ...stale.data, stale: true });
    }
    if (lastError) console.error('[github] Authenticated lookup reason:', lastError.message);
    return res.status(502).json({ message: 'Unable to fetch the public GitHub contribution calendar right now.' });
  }
});

// GET /api/github
// Returns real GitHub stats for the account saved in the public profile.
export const getStats = asyncHandler(async (_req, res) => {
  const profile = await Profile.getSingleton();
  const username = profile.socials?.github?.match(/github\.com\/([^/?#]+)/i)?.[1];
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return res.json({
      source: 'unconfigured',
      username: '',
      name: '',
      bio: '',
      followers: 0,
      following: 0,
      publicRepos: 0,
      totalStars: 0,
      languages: [],
      recentRepos: [],
      commitActivity: [],
    });
  }

  try {
    const data = await fetchGitHubProfile(username, token);
    res.json({ source: 'github-api', ...data });
  } catch (err) {
    res.status(502).json({ message: 'GitHub API error', error: err.message });
  }
});
