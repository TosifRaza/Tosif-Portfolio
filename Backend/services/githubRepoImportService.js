import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import GitHubRepoSync from '../models/GitHubRepoSync.js';
import GitHubRepoSuggestion from '../models/GitHubRepoSuggestion.js';
import { fetchGitHubRepositories } from './githubService.js';

let syncInFlight;

export function syncGitHubRepoSuggestions() {
  if (syncInFlight) return syncInFlight;
  syncInFlight = runSync().finally(() => { syncInFlight = null; });
  return syncInFlight;
}

async function runSync() {
  const profile = await Profile.getSingleton();
  const profileUsername = profile.socials?.github?.match(/github\.com\/([^/?#]+)/i)?.[1];
  const username = (profileUsername || process.env.GITHUB_USERNAME || '').trim();
  if (!username) return { enabled: false, added: 0, pending: 0, username: '' };

  const repos = await fetchGitHubRepositories(username, process.env.GITHUB_TOKEN);
  const publicRepos = repos.filter((repo) => !repo.private && !repo.fork);
  const knownIds = publicRepos.map((repo) => repo.id);
  let state = await GitHubRepoSync.findOne({ username: username.toLowerCase() });

  // The first successful fetch records the current account as a baseline.
  // New repositories created from now on become reviewable suggestions.
  if (!state) {
    try {
      await GitHubRepoSync.create({ username, knownRepoIds: knownIds });
      return { enabled: true, baseline: true, added: 0, pending: 0, username };
    } catch (error) {
      if (error.code !== 11000) throw error;
      state = await GitHubRepoSync.findOne({ username: username.toLowerCase() });
    }
  }

  const seen = new Set((state?.knownRepoIds || []).map(Number));
  const newlySeen = publicRepos.filter((repo) => !seen.has(repo.id));
  let added = 0;

  for (const repo of newlySeen) {
    const url = repo.html_url.replace(/\/$/, '');
    const alreadyInPortfolio = await Project.exists({
      githubUrl: { $regex: `${escapeRegex(url)}\\/?$`, $options: 'i' },
    });
    if (alreadyInPortfolio) continue;

    const result = await GitHubRepoSuggestion.updateOne(
      { githubId: repo.id },
      { $setOnInsert: {
        githubId: repo.id,
        owner: repo.owner?.login || username,
        name: repo.name,
        fullName: repo.full_name,
        htmlUrl: url,
        description: repo.description || '',
        language: repo.language || '',
        topics: Array.isArray(repo.topics) ? repo.topics : [],
        homepage: repo.homepage || '',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        createdAtGitHub: repo.created_at,
        updatedAtGitHub: repo.updated_at,
        status: 'pending',
      } },
      { upsert: true }
    );
    if (result.upsertedCount) added += 1;
  }

  await GitHubRepoSync.updateOne(
    { username: username.toLowerCase() },
    {
      $addToSet: { knownRepoIds: { $each: knownIds } },
      $set: { lastSyncedAt: new Date() },
    }
  );

  const pending = await GitHubRepoSuggestion.countDocuments({ status: 'pending' });
  return { enabled: true, baseline: false, added, pending, username };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
