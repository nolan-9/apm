
import { Router } from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';

import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/', async (_req, res, next) => {
  try {
    // Cantidad total de productos.
    const totalProducts = await Product.countDocuments();

    // Cantidad total de usuarios.
    const totalUsers = await User.countDocuments();

    // Productos con y sin fotografía.
    const productsWithImage = await Product.countDocuments({
      imageKey: { $type: 'string', $ne: '' },
    });

    const productsWithoutImage =
      totalProducts - productsWithImage;

    // Estadísticas de precios.
    const [priceStats] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$price' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    // Cantidad de productos por categoría.
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
          _id: 1,
        },
      },
    ]);

    // Productos más caros.
    const mostExpensiveProducts = await Product.find()
      .sort({ price: -1 })
      .limit(5)
      .select('name price category')
      .lean();

    return res.json({
      summary: {
        totalProducts,
        totalUsers,
        productsWithImage,
        productsWithoutImage,
        totalValue: priceStats?.totalValue || 0,
        averagePrice: priceStats?.averagePrice || 0,
        minPrice: priceStats?.minPrice || 0,
        maxPrice: priceStats?.maxPrice || 0,
      },

      productsByCategory: productsByCategory.map(
        (category) => ({
          category: category._id || 'General',
          count: category.count,
        })
      ),

      mostExpensiveProducts,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
