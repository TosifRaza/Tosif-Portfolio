import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    year: { type: String, required: true },
    date: { type: String, default: '' }, // optional precise date
    phase: {
      type: String,
      enum: ['learning', 'student', 'developer', 'builder', 'founder'],
      required: true,
    },
    category: {
      type: String,
      enum: ['career', 'learning', 'product', 'achievement', 'project', 'personal'],
      default: 'career',
    },
    image: { type: String, default: '' },
    relatedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    visible: { type: Boolean, default: true },
    icon: { type: String, default: '🚀' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Timeline', timelineSchema);
