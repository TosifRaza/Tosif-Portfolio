import mongoose from 'mongoose';

export const TIME_CATEGORIES = [
  'work',
  'learning',
  'coding',
  'exercise',
  'reading',
  'sleep',
  'personal',
  'other',
];

// A TimeEntry with endedAt = null is a RUNNING timer.
// Minutes are stored for manual/finished entries; for finished timers the
// duration is computed from startedAt/endedAt if minutes is 0.
const timeEntrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    category: { type: String, enum: TIME_CATEGORIES, default: 'work' },
    minutes: { type: Number, min: 0, default: 0 },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    source: { type: String, enum: ['manual', 'timer'], default: 'manual' },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

timeEntrySchema.index({ date: -1, category: 1 });

export default mongoose.model('TimeEntry', timeEntrySchema);

