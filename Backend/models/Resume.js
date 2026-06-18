import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: 'resume.pdf' },
    version: { type: String, default: 'v1.0' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
