import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null, index: true },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 250 },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    estimateMinutes: { type: Number, min: 0, default: 0 },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model('Task', taskSchema);
