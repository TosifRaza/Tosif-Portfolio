import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    year: { type: String, required: true },
    phase: {
      type: String,
      enum: ['learning', 'student', 'developer', 'builder', 'founder'],
      required: true,
    },
    icon: { type: String, default: '🚀' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Timeline', timelineSchema);
