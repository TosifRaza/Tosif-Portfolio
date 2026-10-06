import mongoose from 'mongoose';

const learningTopicSchema = new mongoose.Schema(
  {
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: ['todo', 'done'], default: 'todo' },
    completedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('LearningTopic', learningTopicSchema);
