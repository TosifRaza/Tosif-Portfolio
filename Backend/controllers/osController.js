import { asyncHandler } from '../middleware/errorHandler.js';
import { estimateGoalTrajectory, estimateAllTrajectories } from '../services/trajectoryService.js';
import { buildDashboard } from '../services/dashboardService.js';
import { askInsight } from '../services/insightService.js';
import { requireFields } from '../middleware/validate.js';

// GET /api/predictions/trajectory/:goalId
export const goalTrajectory = asyncHandler(async (req, res) => {
  const result = await estimateGoalTrajectory(req.params.goalId);
  if (!result) return res.status(404).json({ message: 'Goal not found' });
  res.json(result);
});

// GET /api/predictions/trajectory — all active goals
export const allTrajectories = asyncHandler(async (_req, res) => {
  res.json(await estimateAllTrajectories());
});

// GET /api/dashboard — private dashboard intelligence
export const dashboard = asyncHandler(async (_req, res) => {
  res.json(await buildDashboard());
});

// POST /api/insights/ask { question } — private Personal AI
export const askInsightController = asyncHandler(async (req, res) => {
  requireFields(req.body, ['question']);
  const answer = await askInsight(String(req.body.question).slice(0, 500));
  res.json(answer);
});
