import { asyncHandler } from '../middleware/errorHandler.js';
import { badRequest } from '../middleware/validate.js';

/**
 * Generic CRUD controller factory — matches the existing controller
 * conventions (list/get/create/update/remove) while adding:
 *  - optional public filter for published content
 *  - optional field whitelist (mass-assignment protection)
 *  - afterSave / afterDelete hooks (progress cascade etc.)
 *
 * Usage:
 *   export default makeCrud(Experience, 'Experience', {
 *     publicFilter: { publishStatus: 'published' },
 *     allowed: ['company', 'role', ...],
 *     afterSave: async (doc) => {...},
 *   });
 */
export function makeCrud(Model, name, opts = {}) {
  const { publicFilter = null, allowed = null, afterSave = null, afterDelete = null, defaultSort = { order: 1, createdAt: 1 } } = opts;

  const clean = (body) => (allowed ? pick(body, allowed) : body);

  function pick(body, keys) {
    const out = {};
    for (const k of keys) if (body[k] !== undefined) out[k] = body[k];
    return out;
  }

  const list = asyncHandler(async (req, res) => {
    // Admin sees everything (with ?all=1), public sees only filtered docs.
    const isAdmin = req.user && (req.query.all === '1' || req.path === '/admin');
    const filter = publicFilter && !isAdmin ? publicFilter : {};
    const items = await Model.find(filter).sort(defaultSort);
    res.json(items);
  });

  const get = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ message: `${name} not found` });
    res.json(item);
  });

  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(clean(req.body));
    if (afterSave) await afterSave(item, req.body);
    res.status(201).json(item);
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, clean(req.body), {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: `${name} not found` });
    if (afterSave) await afterSave(item, req.body);
    res.json(item);
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ message: `${name} not found` });
    await item.deleteOne();
    if (afterDelete) await afterDelete(item);
    res.json({ message: 'Deleted' });
  });

  return { list, get, create, update, remove, clean };
}

/** Validates an id param as a Mongo ObjectId, else throws a 400. */
export function ensureObjectId(id) {
  if (!/^[0-9a-fA-F]{24}$/.test(id || '')) throw badRequest('Invalid id format');
}
