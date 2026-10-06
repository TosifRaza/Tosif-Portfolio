import mongoose from 'mongoose';

const learningSessionSchema = new mongoose.Schema(
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null, index: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningTopic', default: null },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    durationMinutes: { type: Number, min: 0, max: 1440, default: 0 },
    notes: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    confidence: { type: Number, min: 1, max: 5, default: 3 },
    resource: { type: String, default: '' }, // book / course / URL — free text
  },
  { timestamps: true }
);

learningSessionSchema.index({ date: -1 });

export default mongoose.model('LearningSession', learningSessionSchema);
