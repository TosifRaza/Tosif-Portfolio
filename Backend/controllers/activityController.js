import DailyActivity, { ACTIVITY_TYPES } from '../models/DailyActivity.js';
import { makeCrud } from '../utils/crudFactory.js';
import { requireFields, oneOf, isNumberInRange, isValidDay } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dayKey } from '../services/progressService.js';

function validateActivity(body) {
  requireFields(body, ['title']);
  oneOf(body.type, ACTIVITY_TYPES, 'type');
  isNumberInRange(body.durationMinutes, 0, 1440, 'durationMinutes');
  isValidDay(body.date, 'date');
}

export const activityCrud = makeCrud(DailyActivity, 'Activity', {
  defaultSort: { date: -1, createdAt: -1 },
});

export const createActivity = asyncHandler(async (req, res) => {
  validateActivity(req.body);
  const activity = await DailyActivity.create({ ...req.body, date: req.body.date || dayKey() });
  res.status(201).json(activity);
});

export const updateActivity = asyncHandler(async (req, res) => {
  validateActivity(req.body);
  const activity = await DailyActivity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!activity) return res.status(404).json({ message: 'Activity not found' });
  res.json(activity);
});

// GET /api/activities?from=YYYY-MM-DD&to=YYYY-MM-DD&goalId=&skillId=
export const listActivities = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = req.query.from;
    if (req.query.to) filter.date.$lte = req.query.to;
  }
  if (req.query.date) filter.date = req.query.date;
  if (req.query.goalId) filter.goalId = req.query.goalId;
  if (req.query.skillId) filter.skillId = req.query.skillId;
  if (req.query.type) filter.type = req.query.type;
  const items = await DailyActivity.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .populate('goalId', 'title category')
    .populate('skillId', 'name');
  res.json(items);
});

export { activityCrud as crud };
