import mongoose from 'mongoose';

const toNullableObjectId = (v) => {
  if (v === '' || v === undefined) return null;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    return trimmed === '' ? null : trimmed;
  }
  return v;
};

const toNullableDate = (v) => {
  if (v === '' || v === undefined) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return v;
};

const taskSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
      set: toNullableObjectId,
      index: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
      set: toNullableObjectId,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 250 },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    estimateMinutes: { type: Number, min: 0, default: 0 },
    dueDate: { type: Date, default: null, set: toNullableDate },
    completedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },

    // ── Knowledge & Resource Vault ─────────────────────────────────
    notes: { type: String, default: '' },
    resources: [
      {
        title: { type: String, default: '' },
        url: { type: String, default: '' },
        type: { type: String, default: 'link' }, // doc, repo, design, tool, article, link
      },
    ],
    contacts: [
      {
        name: { type: String, default: '' },
        role: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        link: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
    ],
    attachments: [
      {
        title: { type: String, default: '' },
        url: { type: String, default: '' },
        type: { type: String, default: 'image' },
      },
    ],
    checklist: [
      {
        text: { type: String, default: '' },
        done: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model('Task', taskSchema);
