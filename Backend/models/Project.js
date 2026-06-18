import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    missionId: { type: String, required: true, unique: true }, // e.g. MISSION-001
    title: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true, default: '' },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    stack: [{ type: String }],
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived', 'In Progress'],
      default: 'Active',
    },
    difficulty: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Extreme'],
      default: 'Medium',
    },
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
