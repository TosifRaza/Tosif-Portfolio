import mongoose from 'mongoose';

export const PRODUCT_STATUSES = [
  'idea',
  'planning',
  'development',
  'mvp',
  'live',
  'maintenance',
  'archived',
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    tagline: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    description: { type: String, required: true },
    problem: { type: String, default: '' },
    solution: { type: String, default: '' },
    founderRole: { type: String, default: '' },
    technologies: [{ type: String }],
    status: { type: String, enum: PRODUCT_STATUSES, default: 'idea' },
    launchDate: { type: String, default: '' },
    roadmap: [
      {
        phase: { type: String },
        status: { type: String, enum: ['completed', 'current', 'upcoming'], default: 'upcoming' },
        quarter: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    milestones: [
      { title: { type: String }, date: { type: String, default: '' }, done: { type: Boolean, default: false } },
    ],
    url: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    images: [{ type: String }],
    caseStudy: { type: String, default: '' },
    // Admin-entered metrics. EMPTY BY DEFAULT — no invented numbers.
    metrics: [{ label: { type: String }, value: { type: String } }],
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

export default mongoose.model('Product', productSchema);

