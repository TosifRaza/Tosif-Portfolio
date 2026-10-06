import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    cadence: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
    targetPerWeek: { type: Number, min: 1, max: 7, default: 7 },
    archived: { type: Boolean, default: false },
    log: [
      {
        date: { type: String, required: true }, // YYYY-MM-DD
        done: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Habit', habitSchema);
