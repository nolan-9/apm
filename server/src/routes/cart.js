import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);
const cartProductFields = 'name price category stock';

function validId(id) {
  return mongoose.isValidObjectId(id);
}

function cartResponse(cart) {
  return cart
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: Math.min(item.quantity, item.product.stock ?? 0)
    }));
}

router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product', cartProductFields);
    return res.json({ items: cartResponse(user.cart) });
  } catch (error) {
    return next(error);
  }
});

router.post('/:productId', async (req, res, next) => {
  try {
    if (!validId(req.params.productId)) return res.status(400).json({ message: 'El producto solicitado no es válido.' });
    const product = await Product.findById(req.params.productId).select(cartProductFields);
    if (!product) return res.status(404).json({ message: 'No se encontró el producto.' });
    const stock = product.stock ?? 0;
    if (stock === 0) return res.status(409).json({ message: 'Este producto está agotado.' });

    const productId = product._id;
    const userId = req.user.id;

    // Las condiciones se comprueban al escribir para evitar duplicados y excesos de stock.
    const added = await User.updateOne(
      { _id: userId, 'cart.product': { $ne: productId } },
      { $push: { cart: { product: productId, quantity: 1 } } }
    );
    if (added.modifiedCount) return res.json({ item: { product, quantity: 1 } });

    const user = await User.findOneAndUpdate(
      { _id: userId, cart: { $elemMatch: { product: productId, quantity: { $lt: stock } } } },
      { $inc: { 'cart.$.quantity': 1 } },
      { new: true }
    ).select('cart');

    if (!user) {
      return res.status(409).json({ message: 'No se pudo aumentar la cantidad. Revisa el stock disponible.' });
    }

    const item = user.cart.find((entry) => entry.product.equals(productId));
    return res.json({ item: { product, quantity: item.quantity } });
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

    const [user, product] = await Promise.all([
      User.findById(req.user.id),
      Product.findById(productId).select('stock'),
    ]);

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado.'
      });
    }

    const item = user.cart.find(
      (entry) => entry.product.equals(productId)
    );

    if (!item) {
      return res.status(404).json({
        message: 'El producto no está en el carrito.'
      });
    }

    const stock = product?.stock ?? 0;
    const quantity = Math.max(0, Math.min(item.quantity, stock) - 1);
    const removed = quantity === 0;
    const match = { product: item.product, quantity: item.quantity };
    const updated = await User.updateOne(
      { _id: user.id, cart: { $elemMatch: match } },
      removed
        ? { $pull: { cart: match } }
        : { $set: { 'cart.$.quantity': quantity } }
    );

    if (!updated.modifiedCount) {
      return res.status(409).json({ message: 'El carrito cambió. Intenta de nuevo.' });
    }

    return res.json({ removed, quantity, stock });

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
