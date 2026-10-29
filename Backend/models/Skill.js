import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Tools', 'Database', 'DevOps', 'Soft'],
      required: true,
    },
    // Optional self-assessment. Repository evidence does not imply a score.
    level: { type: Number, min: 0, max: 100, default: null },
    // Private learning-OS targets (0-100 scale to keep one unit).
    targetLevel: { type: Number, min: 0, max: 100, default: 0 },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

skillSchema.index({ category: 1, order: 1 });

export default mongoose.model('Skill', skillSchema);
