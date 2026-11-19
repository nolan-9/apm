import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();
router.use(requireAuth);

function fieldsFrom(body = {}, { creating = false } = {}) {
  const fields = {};
  if (typeof body.name === 'string') fields.name = body.name.trim();
  if (typeof body.description === 'string') fields.description = body.description.trim();
  if (typeof body.category === 'string') fields.category = body.category.trim() || 'General';
  if (body.price !== undefined) {
    if ((typeof body.price !== 'number' && typeof body.price !== 'string') || (typeof body.price === 'string' && !body.price.trim())) {
      throw Object.assign(new Error('Escribe un precio válido.'), { status: 400 });
    }
    fields.price = Number(body.price);
    if (!Number.isFinite(fields.price)) throw Object.assign(new Error('Escribe un precio válido.'), { status: 400 });
  }
  if (creating && !fields.category) fields.category = 'General';
  return fields;
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

router.get('/', async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'El producto solicitado no es válido.' });
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'No se encontró el producto.' });
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.create(fieldsFrom(req.body || {}, { creating: true }));
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'El producto solicitado no es válido.' });
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: fieldsFrom(req.body || {}) }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'No se encontró el producto.' });
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'El producto solicitado no es válido.' });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'No se encontró el producto.' });
    await User.updateMany({}, { $pull: { cart: { product: product._id } } });
    return res.json({ message: 'Producto eliminado.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
