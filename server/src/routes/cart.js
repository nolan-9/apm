import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

function validId(id) {
  return mongoose.isValidObjectId(id);
}

function cartResponse(cart) {
  return cart
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));
}

router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product', 'name price category');
    return res.json({ items: cartResponse(user.cart) });
  } catch (error) {
    return next(error);
  }
});

router.post('/:productId', async (req, res, next) => {
  try {
    if (!validId(req.params.productId)) return res.status(400).json({ message: 'El producto solicitado no es válido.' });
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'No se encontró el producto.' });
    const user = await User.findById(req.user.id);
    const item = user.cart.find((entry) => String(entry.product) === String(product._id));
    if (item) item.quantity += 1;
    else user.cart.push({ product: product._id, quantity: 1 });
    await user.save();
    await user.populate('cart.product', 'name price category');
    const saved = user.cart.find((entry) => String(entry.product?._id || entry.product) === String(product._id));
    return res.json({ item: { product: saved.product, quantity: saved.quantity } });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:productId', async (req, res, next) => {
  try {
    const productId = req.params.productId;

    if (!validId(productId)) {
      return res.status(400).json({
        message: 'El producto solicitado no es válido.'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado.'
      });
    }

    const item = user.cart.find(
      (entry) => String(entry.product) === String(productId)
    );

    if (!item) {
      return res.status(404).json({
        message: 'El producto no está en el carrito.'
      });
    }

    if (item.quantity <= 1) {
      user.cart = user.cart.filter(
        (entry) => String(entry.product) !== String(productId)
      );

      await user.save();

      return res.json({
        removed: true,
        quantity: 0
      });
    }

    item.quantity -= 1;

    await user.save();

    return res.json({
      removed: false,
      quantity: item.quantity
    });

  } catch (error) {
    return next(error);
  }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    if (!validId(req.params.productId)) return res.status(400).json({ message: 'El producto solicitado no es válido.' });
    await User.findByIdAndUpdate(req.user.id, { $pull: { cart: { product: req.params.productId } } });
    return res.json({ message: 'Producto quitado del carrito.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
