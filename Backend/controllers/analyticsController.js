import { asyncHandler } from '../middleware/errorHandler.js';
import { badRequest, oneOf } from '../middleware/validate.js';
import { dailyView, weeklyView, monthlyView, yearlyView, planVsActual, weekStart } from '../services/analyticsService.js';
import PlanSetting from '../models/PlanSetting.js';
import { TIME_CATEGORIES } from '../models/TimeEntry.js';

// GET /api/analytics/daily?date=
export const daily = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  if (Number.isNaN(date.getTime())) throw badRequest('date must be a valid date');
  res.json(await dailyView(date));
});

// GET /api/analytics/weekly?date=
export const weekly = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  if (Number.isNaN(date.getTime())) throw badRequest('date must be a valid date');
  res.json(await weeklyView(date));
});

// GET /api/analytics/monthly?date=
export const monthly = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  if (Number.isNaN(date.getTime())) throw badRequest('date must be a valid date');
  res.json(await monthlyView(date));
});

// GET /api/analytics/yearly?year=
export const yearly = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  res.json(await yearlyView(new Date(year, 0, 1)));
});

// GET /api/analytics/plan-vs-actual?date=
export const planVsActualView = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  if (Number.isNaN(date.getTime())) throw badRequest('date must be a valid date');
  res.json(await planVsActual(weekStart(date), date));
});

// ── Plan settings (weekly targets) ──────────────────────────────────
// GET /api/analytics/plan
export const getPlan = asyncHandler(async (_req, res) => {
  const plans = await PlanSetting.find().sort({ category: 1 });
  res.json(TIME_CATEGORIES.map((category) =>
    plans.find((plan) => plan.category === category)
      || { category, weeklyTargetMinutes: 0, enabled: true }
  ));
});

// PUT /api/analytics/plan/:category
export const updatePlan = asyncHandler(async (req, res) => {
  oneOf(req.params.category, TIME_CATEGORIES, 'category');
  const minutes = Number(req.body.weeklyTargetMinutes);
  if (Number.isNaN(minutes) || minutes < 0 || minutes > 10080) {
    throw badRequest('weeklyTargetMinutes must be between 0 and 10080');
  }
  const plan = await PlanSetting.findOneAndUpdate(
    { category: req.params.category },
    { weeklyTargetMinutes: minutes, enabled: req.body.enabled ?? true },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(plan);
});
