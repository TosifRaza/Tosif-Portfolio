import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
