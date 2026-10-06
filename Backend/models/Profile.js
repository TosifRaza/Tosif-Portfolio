import mongoose from 'mongoose';

// Public identity — single source of truth for the whole portfolio.
const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Tosif Raza' },
    title: { type: String, default: 'Software Engineer & Founder' },
    roles: [{ type: String }],
    tagline: { type: String, default: '' },
    shortBio: { type: String, default: '' },
    longBio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    availability: {
      status: { type: String, default: 'Open to opportunities' },
      type: { type: String, default: 'Full-time / Contract' },
      location: { type: String, default: 'Remote' },
      notice: { type: String, default: 'Immediate' },
    },
    socials: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    // Used by the AI recruiter for the "why hire" answer — editable, not hardcoded.
    pitch: { type: String, default: '' },
  },
  { timestamps: true }
);

profileSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

export default mongoose.model('Profile', profileSchema);
