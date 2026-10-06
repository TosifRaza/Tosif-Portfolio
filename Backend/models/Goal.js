import mongoose from 'mongoose';

const GOAL_CATEGORIES = ['career', 'founder', 'learning', 'financial', 'health', 'personal'];

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '' },
    category: { type: String, enum: GOAL_CATEGORIES, default: 'career' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    targetDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
    },
    // progress is recomputed from milestones when progressMode = 'auto'.
    // 'manual' lets the owner set their own percentage (0-100).
    progress: { type: Number, min: 0, max: 100, default: 0 },
    progressMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    metrics: [{ label: { type: String }, value: { type: String } }],
    relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    relatedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    completedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

goalSchema.index({ status: 1, category: 1 });

export default mongoose.model('Goal', goalSchema);
export { GOAL_CATEGORIES };
