import Experience from '../models/Experience.js';
import Product, { PRODUCT_STATUSES } from '../models/Product.js';
import Habit from '../models/Habit.js';
import JournalEntry from '../models/JournalEntry.js';
import { makeCrud } from '../utils/crudFactory.js';
import { requireFields, oneOf } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { isValidDay } from '../middleware/validate.js';

// ── Experience ──────────────────────────────────────────────────────
function validateExperience(body) {
  requireFields(body, ['company', 'role']);
  oneOf(body.publishStatus, ['draft', 'published', 'archived'], 'publishStatus');
}

export const experienceCrud = makeCrud(Experience, 'Experience', {
  publicFilter: { publishStatus: 'published' },
  defaultSort: { order: 1, current: -1 },
});

export const createExperience = asyncHandler(async (req, res) => {
  validateExperience(req.body);
  const item = await Experience.create(experienceCrud.clean(req.body));
  res.status(201).json(item);
});

export const updateExperience = asyncHandler(async (req, res) => {
  validateExperience(req.body);
  const item = await Experience.findByIdAndUpdate(req.params.id, experienceCrud.clean(req.body), {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Experience not found' });
  res.json(item);
});

// ── Products (Founder Lab) ──────────────────────────────────────────
function validateProduct(body) {
  requireFields(body, ['name', 'description']);
  oneOf(body.status, PRODUCT_STATUSES, 'status');
  oneOf(body.publishStatus, ['draft', 'published', 'archived'], 'publishStatus');
}

export const productCrud = makeCrud(Product, 'Product', {
  publicFilter: { publishStatus: 'published' },
  defaultSort: { order: 1, createdAt: -1 },
});

export const createProduct = asyncHandler(async (req, res) => {
  validateProduct(req.body);
  const item = await Product.create(productCrud.clean(req.body));
  res.status(201).json(item);
});

export const updateProduct = asyncHandler(async (req, res) => {
  validateProduct(req.body);
  const item = await Product.findByIdAndUpdate(req.params.id, productCrud.clean(req.body), {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Product not found' });
  res.json(item);
});

// ── Habits ──────────────────────────────────────────────────────────
export const habitCrud = makeCrud(Habit, 'Habit', {
  defaultSort: { createdAt: 1 },
});

// PATCH /api/habits/:id/toggle?date=YYYY-MM-DD
export const toggleHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) return res.status(404).json({ message: 'Habit not found' });
  const date = req.query.date || req.body?.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'date query param (YYYY-MM-DD) required' });
  }
  const existing = habit.log.find((l) => l.date === date);
  if (existing) {
    habit.log = habit.log.filter((l) => l.date !== date);
  } else {
    habit.log.push({ date, done: true });
  }
  await habit.save();
  res.json(habit);
});

// ── Journal ─────────────────────────────────────────────────────────
function validateJournal(body) {
  requireFields(body, ['content']);
  isValidDay(body.date, 'date');
}

export const journalCrud = makeCrud(JournalEntry, 'Journal entry', {
  defaultSort: { date: -1, createdAt: -1 },
});

export const createJournal = asyncHandler(async (req, res) => {
  validateJournal(req.body);
  const item = await JournalEntry.create(req.body);
  res.status(201).json(item);
});

export const updateJournal = asyncHandler(async (req, res) => {
  validateJournal(req.body);
  const item = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Journal entry not found' });
  res.json(item);
});
