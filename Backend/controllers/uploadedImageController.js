import { asyncHandler } from '../middleware/errorHandler.js';
import UploadedImage from '../models/UploadedImage.js';

const VALID_IMAGE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,200}\.(?:jpe?g|png|gif|webp|avif)$/i;

export const getUploadedImage = asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  if (!VALID_IMAGE_NAME.test(filename)) return res.status(404).end();

  const image = await UploadedImage.findOne({ filename }).select('+data');
  if (!image) return res.status(404).end();

  res.set({
    'Content-Type': image.contentType,
    'Content-Length': String(image.size),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(image.data);
});
