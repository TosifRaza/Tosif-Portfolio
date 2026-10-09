import mongoose from 'mongoose';

const githubRepoSyncSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  knownRepoIds: [{ type: Number }],
  initializedAt: { type: Date, default: Date.now },
  lastSyncedAt: { type: Date, default: Date.now },
});

export default mongoose.model('GitHubRepoSync', githubRepoSyncSchema);
