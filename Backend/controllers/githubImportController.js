import { asyncHandler } from '../middleware/errorHandler.js';
import GitHubRepoSuggestion from '../models/GitHubRepoSuggestion.js';
import Project from '../models/Project.js';
import { syncGitHubRepoSuggestions } from '../services/githubRepoImportService.js';

async function restoreStuckApprovals() {
  const cutoff = new Date(Date.now() - 10 * 60 * 1000);
  await GitHubRepoSuggestion.updateMany(
    { status: 'approving', updatedAt: { $lt: cutoff } },
    { $set: { status: 'pending' } }
  );
}

export const listSuggestions = asyncHandler(async (_req, res) => {
  await restoreStuckApprovals();
  const items = await GitHubRepoSuggestion.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();
  res.json(items);
});

export const pendingCount = asyncHandler(async (_req, res) => {
  await restoreStuckApprovals();
  const count = await GitHubRepoSuggestion.countDocuments({ status: 'pending' });
  res.json({ count });
});

export const syncNow = asyncHandler(async (_req, res) => {
  try {
    const result = await syncGitHubRepoSuggestions();
    res.json({
      ...result,
      message: result.enabled
        ? (result.baseline
          ? `Connected to @${result.username}. Existing repositories were recorded; new repositories will appear here.`
          : `GitHub checked. ${result.added} new ${result.added === 1 ? 'repository' : 'repositories'} added to review.`)
        : 'Add your GitHub profile URL in Profile settings to enable repository monitoring.',
    });
  } catch (error) {
    console.error('[github-imports] Repository sync failed:', error.message);
    res.status(502).json({ message: 'Could not check GitHub right now. Check the GitHub username and API rate limit, then try again.' });
  }
});

export const approveSuggestion = asyncHandler(async (req, res) => {
  let suggestion = await GitHubRepoSuggestion.findById(req.params.id);
  if (!suggestion) return res.status(404).json({ message: 'GitHub repository suggestion not found.' });

  if (suggestion.status === 'approved' && suggestion.projectId) {
    const existingProject = await Project.findById(suggestion.projectId);
    if (existingProject) return res.json({ suggestion, project: existingProject, alreadyApproved: true });
  }

  if (suggestion.status !== 'pending') {
    return res.status(409).json({ message: 'This repository suggestion has already been handled.' });
  }

  suggestion = await GitHubRepoSuggestion.findOneAndUpdate(
    { _id: suggestion._id, status: 'pending' },
    { $set: { status: 'approving' } },
    { new: true }
  );
  if (!suggestion) return res.status(409).json({ message: 'This repository suggestion is already being handled.' });

  try {
    let project = await Project.findOne({ githubUrl: suggestion.htmlUrl });
    if (!project) {
      const title = suggestion.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
      const image = `https://opengraph.githubassets.com/${suggestion.githubId}/${suggestion.fullName}`;
      const description = suggestion.description.trim()
        || 'Public GitHub project. Add a detailed project description and screenshots from the Admin Portal.';
      const stack = [...new Set([suggestion.language, ...suggestion.topics].filter(Boolean))];
      project = await Project.create({
        missionId: `MISSION-GH-${suggestion.githubId}`,
        title,
        tagline: suggestion.description.slice(0, 180),
        description,
        image,
        images: [image],
        stack,
        category: 'open-source',
        status: 'Active',
        difficulty: 'Medium',
        githubUrl: suggestion.htmlUrl,
        liveUrl: suggestion.homepage,
        featured: false,
        publishStatus: 'published',
      });
    }

    suggestion.status = 'approved';
    suggestion.projectId = project._id;
    await suggestion.save();
    return res.status(201).json({ suggestion, project });
  } catch (error) {
    await GitHubRepoSuggestion.updateOne({ _id: suggestion._id, status: 'approving' }, { $set: { status: 'pending' } });
    throw error;
  }
});

export const dismissSuggestion = asyncHandler(async (req, res) => {
  const item = await GitHubRepoSuggestion.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    { $set: { status: 'dismissed' } },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Pending GitHub suggestion not found.' });
  res.json({ message: 'Repository dismissed.', id: item._id });
});
