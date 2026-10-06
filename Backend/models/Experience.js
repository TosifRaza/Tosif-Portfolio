import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true, maxlength: 150 },
    role: { type: String, required: true, trim: true, maxlength: 150 },
    companyLogo: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' }, // free format: "Jan 2024"
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' },
    responsibilities: [{ type: String }],
    technologies: [{ type: String }],
    achievements: [{ type: String }],
    publishStatus: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Experience', experienceSchema);
