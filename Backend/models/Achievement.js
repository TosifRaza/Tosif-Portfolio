import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    icon: { type: String, default: '🏆' },
    color: { type: String, default: '#00d4ff' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Achievement', achievementSchema);
