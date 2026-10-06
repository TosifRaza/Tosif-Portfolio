import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    title: { type: String, default: '' },
    content: { type: String, required: true },
    mood: { type: String, default: '' }, // free text — e.g. "focused"
  },
  { timestamps: true }
);

export default mongoose.model('JournalEntry', journalEntrySchema);
