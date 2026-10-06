import mongoose from 'mongoose';

// One snapshot per goal per day — the historical record that powers the
// goal trajectory estimator. Upserted automatically when goal progress changes
// or when predictions/dashboard are requested.
const goalSnapshotSchema = new mongoose.Schema(
  {
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

goalSnapshotSchema.index({ goalId: 1, date: 1 }, { unique: true });

export default mongoose.model('GoalSnapshot', goalSnapshotSchema);
