import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
  {
    paragraphs: [{ type: String }],
    highlights: [{ title: { type: String }, description: { type: String, default: '' } }],
    values: [{ title: { type: String }, description: { type: String, default: '' } }],
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

aboutSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

export default mongoose.model('AboutContent', aboutSchema);
