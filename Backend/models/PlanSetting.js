import mongoose from 'mongoose';
import { TIME_CATEGORIES } from './TimeEntry.js';

// Weekly plan targets per category — powers "Plan vs Actual".
// weeklyTargetMinutes = 0 means "no plan for this category yet".
const planSettingSchema = new mongoose.Schema(
  {
    category: { type: String, enum: TIME_CATEGORIES, required: true, unique: true },
    weeklyTargetMinutes: { type: Number, min: 0, max: 10080, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('PlanSetting', planSettingSchema);
