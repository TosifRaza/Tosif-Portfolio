import mongoose from 'mongoose';

const githubRepoSuggestionSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true },
  owner: { type: String, required: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  htmlUrl: { type: String, required: true },
  description: { type: String, default: '' },
  language: { type: String, default: '' },
  topics: [{ type: String }],
  homepage: { type: String, default: '' },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  createdAtGitHub: { type: Date },
  updatedAtGitHub: { type: Date },
  status: { type: String, enum: ['pending', 'approving', 'approved', 'dismissed'], default: 'pending' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
}, { timestamps: true });

export default mongoose.model('GitHubRepoSuggestion', githubRepoSuggestionSchema);
