import mongoose from 'mongoose';

// SiteConfig is the master switchboard of the public website:
// hero content, section visibility/order, navigation, current mission,
// global reach, statistics mode and AI behaviour.
const sectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // home | about | experience | ...
    label: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const navItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    target: { type: String, required: true }, // section key or URL
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    scope: { type: String, enum: ['public', 'os', 'both'], default: 'public' },
  },
  { _id: false }
);

const ctaSchema = new mongoose.Schema(
  { label: { type: String, default: '' }, target: { type: String, default: '' } },
  { _id: false }
);

const siteConfigSchema = new mongoose.Schema(
  {
    hero: {
      badge: { type: String, default: 'SYSTEM ONLINE' },
      heading: { type: String, default: 'Tosif Raza' },
      subtitle: { type: String, default: 'Software Engineer & Founder' },
      description: { type: String, default: '' },
      primaryCta: { type: ctaSchema, default: () => ({}) },
      secondaryCta: { type: ctaSchema, default: () => ({}) },
      showStats: { type: Boolean, default: true },
      showCurrentMission: { type: Boolean, default: true },
    },
    currentMission: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      progressLabel: { type: String, default: '' }, // free text, e.g. "MVP Phase"
    },
    sections: { type: [sectionSchema], default: [] },
    nav: { type: [navItemSchema], default: [] },
    globalReach: [
      { region: { type: String }, note: { type: String, default: '' } },
    ],
    // 'auto' = stats calculated from real DB counts. 'manual' = admin-entered.
    statsMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    manualStats: [{ label: { type: String }, value: { type: String } }],
    footer: { text: { type: String, default: '' } },
    ai: {
      publicEnabled: { type: Boolean, default: true },
      privateEnabled: { type: Boolean, default: true },
      publicIntro: { type: String, default: 'Ask anything about my work, skills and experience.' },
      privateIntro: {
        type: String,
        default: 'Ask about your goals, learning, time and progress.',
      },
    },
  },
  { timestamps: true }
);

siteConfigSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      sections: DEFAULT_SECTIONS,
      nav: DEFAULT_NAV,
    });
  }
  return doc;
};

export const DEFAULT_SECTIONS = [
  { key: 'home', label: 'Home', enabled: true, order: 1 },
  { key: 'about', label: 'About', enabled: true, order: 2 },
  { key: 'experience', label: 'Experience', enabled: true, order: 3 },
  { key: 'skills', label: 'Skills', enabled: true, order: 4 },
  { key: 'engineeringlab', label: 'Engineering Lab', enabled: true, order: 5 },
  { key: 'projects', label: 'Projects', enabled: true, order: 6 },
  { key: 'products', label: 'Products', enabled: true, order: 7 },
  { key: 'achievements', label: 'Achievements', enabled: true, order: 8 },
  { key: 'journey', label: 'Journey', enabled: true, order: 9 },
  { key: 'resume', label: 'Resume', enabled: true, order: 10 },
  { key: 'contact', label: 'Contact', enabled: true, order: 11 },
  { key: 'globalreach', label: 'Global Reach', enabled: false, order: 12 },
];

export const DEFAULT_NAV = [
  { label: 'Home', target: 'home', enabled: true, order: 1, scope: 'public' },
  { label: 'Projects', target: 'projects', enabled: true, order: 2, scope: 'public' },
  { label: 'Skills', target: 'skills', enabled: true, order: 3, scope: 'public' },
  { label: 'Experience', target: 'experience', enabled: true, order: 4, scope: 'public' },
  { label: 'Engineering Lab', target: 'engineeringlab', enabled: true, order: 5, scope: 'public' },
  { label: 'Resume', target: 'resume', enabled: true, order: 6, scope: 'public' },
  { label: 'Contact', target: 'contact', enabled: true, order: 7, scope: 'public' },
  { label: 'About', target: 'about', enabled: false, order: 8, scope: 'public' },
  { label: 'Achievements', target: 'achievements', enabled: false, order: 9, scope: 'public' },
  { label: 'Journey', target: 'journey', enabled: false, order: 10, scope: 'public' },
  { label: 'Products', target: 'products', enabled: false, order: 11, scope: 'public' },
  { label: 'Enter TOSIF OS', target: '/os', enabled: true, order: 12, scope: 'public' },
];

export default mongoose.model('SiteConfig', siteConfigSchema);
