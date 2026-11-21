import { Router } from 'express';
import Category from '../models/Category.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();

// Todas las rutas requieren iniciar sesión
router.use(requireAuth);

// Consultar categorías: usuarios y administradores
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();

    return res.json({ categories });
  } catch (error) {
    return next(error);
  }
});

// Crear categorías: únicamente administradores
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const name =
      typeof req.body?.name === 'string'
        ? req.body.name.trim()
        : '';

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({
        message: 'La categoría debe tener entre 2 y 60 caracteres.'
      });
    }

    const normalizedName = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const exists = await Category.exists({ normalizedName });

    if (exists) {
      return res.status(409).json({
        message: 'Esta categoría ya existe.'
      });
    }

    const category = await Category.create({
      name,
      normalizedName
    });

    return res.status(201).json({ category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Esta categoría ya existe.'
      });
    }

    return next(error);
  }
});

export default router;
