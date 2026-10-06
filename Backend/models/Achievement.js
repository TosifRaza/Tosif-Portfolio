import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    icon: { type: String, default: '🏆' },
    color: { type: String, default: '#00d4ff' },
    image: { type: String, default: '' },
    // Professional (jobs, certifications, launches) vs personal (streaks, habits)
    category: { type: String, enum: ['professional', 'personal'], default: 'professional' },
    featured: { type: Boolean, default: false },
    relatedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    relatedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Achievement', achievementSchema);
