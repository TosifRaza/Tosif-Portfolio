import mongoose from 'mongoose';

export const ACTIVITY_TYPES = [
  'work',
  'learning',
  'coding',
  'exercise',
  'reading',
  'sleep',
  'personal',
  'other',
];

// DailyActivity is the "Daily Log" — a record of what was actually done,
// for how long, and which goal/skill it served.
const dailyActivitySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    title: { type: String, required: true, trim: true, maxlength: 250 },
    type: { type: String, enum: ACTIVITY_TYPES, default: 'work' },
    durationMinutes: { type: Number, min: 0, max: 1440, default: 0 },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

dailyActivitySchema.index({ date: -1 });

export default mongoose.model('DailyActivity', dailyActivitySchema);

