import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    missionId: { type: String, required: true, unique: true }, // e.g. MISSION-001
    title: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true, default: '' },
    description: { type: String, required: true },
    problem: { type: String, default: '' },
    solution: { type: String, default: '' },
    role: { type: String, default: '' }, // e.g. "Solo developer", "Backend lead"
    caseStudy: { type: String, default: '' },
    image: { type: String, default: '' },
    images: [{ type: String }],
    stack: [{ type: String }],
    relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    category: {
      // Mission Deck grouping: professional / personal / learning / open-source
      type: String,
      enum: ['professional', 'personal', 'learning', 'open-source'],
      default: 'professional',
    },
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
    publishStatus: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
