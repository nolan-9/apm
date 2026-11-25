
import { Router } from 'express';
import mongoose from 'mongoose';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

import Product from '../models/Product.js';
import User from '../models/User.js';

import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';
import uploadImage from '../middleware/uploadImage.js';
import validateImage from '../middleware/validateImage.js';

import s3, {
  subirImagenS3,
  obtenerUrlImagen,
} from '../services/s3.js';

const router = Router();

// Todas las rutas de productos requieren autenticación.
router.use(requireAuth);

// Preparar los campos permitidos de un producto.
function fieldsFrom(body = {}, { creating = false } = {}) {
  const fields = {};

  if (typeof body.name === 'string') {
    fields.name = body.name.trim();
  }

  if (typeof body.description === 'string') {
    fields.description = body.description.trim();
  }

  if (typeof body.category === 'string') {
    fields.category = body.category.trim() || 'General';
  }

  if (body.price !== undefined) {
    if (
      (typeof body.price !== 'number' &&
        typeof body.price !== 'string') ||
      (typeof body.price === 'string' && !body.price.trim())
    ) {
      throw Object.assign(
        new Error('Escribe un precio válido.'),
        { status: 400 }
      );
    }

    fields.price = Number(body.price);

    if (!Number.isFinite(fields.price)) {
      throw Object.assign(
        new Error('Escribe un precio válido.'),
        { status: 400 }
      );
    }
  }

  if (creating && !fields.category) {
    fields.category = 'General';
  }

  if (body.stock !== undefined) {
    const value = body.stock;
    const stock = typeof value === 'string' && /^\d+$/.test(value.trim())
      ? Number(value)
      : value;

    if (!Number.isSafeInteger(stock) || stock < 0) {
      throw Object.assign(
        new Error('El stock debe ser un número entero mayor o igual a 0.'),
        { status: 400 }
      );
    }

    fields.stock = stock;
  }

  return fields;
}

// Verificar que el ID sea válido para MongoDB.
function validId(id) {
  return mongoose.isValidObjectId(id);
}

// --------------------------------------------------
// OBTENER TODOS LOS PRODUCTOS
// --------------------------------------------------

router.get('/', async (_req, res, next) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();

    const productsWithImages = await Promise.all(
      products.map(async (product) => ({
        ...product,
        stock: product.stock ?? 0,
        imageUrl: product.imageKey
          ? await obtenerUrlImagen(product.imageKey)
          : null,
      }))
    );

    return res.json({
      products: productsWithImages,
    });
  } catch (error) {
    return next(error);
  }
});

// --------------------------------------------------
// OBTENER UN PRODUCTO POR ID
// --------------------------------------------------

router.get('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: 'El producto solicitado no es válido.',
      });
    }

    const product = await Product.findById(
      req.params.id
    ).lean();

    if (!product) {
      return res.status(404).json({
        message: 'No se encontró el producto.',
      });
    }

    return res.json({
      product: {
        ...product,
        stock: product.stock ?? 0,
        imageUrl: product.imageKey
          ? await obtenerUrlImagen(product.imageKey)
          : null,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// --------------------------------------------------
// CREAR PRODUCTO (SOLO ADMINISTRADOR)
// --------------------------------------------------

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.create(
      fieldsFrom(req.body || {}, { creating: true })
    );

    return res.status(201).json({
      product,
    });
  } catch (error) {
    return next(error);
  }
});

// --------------------------------------------------
// EDITAR PRODUCTO (SOLO ADMINISTRADOR)
// --------------------------------------------------

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: 'El producto solicitado no es válido.',
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: fieldsFrom(req.body || {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: 'No se encontró el producto.',
      });
    }

    return res.json({
      product,
    });
  } catch (error) {
    return next(error);
  }
});

// --------------------------------------------------
// ELIMINAR PRODUCTO (SOLO ADMINISTRADOR)
// --------------------------------------------------


router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    // 1. Validar el ID del producto.
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: 'El producto solicitado no es válido.',
      });
    }

    // 2. Buscar el producto antes de eliminarlo.
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'No se encontró el producto.',
      });
    }

    // 3. Guardar la referencia de la imagen.
    const imageKey = product.imageKey;

    // 4. Eliminar el producto de MongoDB.
    await Product.findByIdAndDelete(product._id);

    // 5. Eliminar el producto de los carritos.
    await User.updateMany(
      {},
      {
        $pull: {
          cart: {
            product: product._id,
          },
        },
      }
    );

    // 6. Eliminar su fotografía de Amazon S3.
    if (imageKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: imageKey,
          })
        );

        console.log(
          'Imagen eliminada de Amazon S3:',
          imageKey
        );
      } catch (s3Error) {
        // El producto ya se eliminó de MongoDB.
        // Registramos el fallo para revisar el archivo
        // pendiente de eliminación en S3.
        console.error(
          'No se pudo eliminar la imagen de S3:',
          imageKey,
          s3Error
        );
      }
    }

    console.log('Producto eliminado:', product._id);

    return res.json({
      message: 'Producto eliminado.',
    });
  } catch (error) {
    return next(error);
  }
});


// --------------------------------------------------
// SUBIR IMAGEN A AMAZON S3 (SOLO ADMINISTRADOR)
// --------------------------------------------------

router.post(
  '/:id/image',

  requireAdmin,

  // DIAGNÓSTICO 1:
  // Comprobar si la petición llega desde React Native.
  (req, res, next) => {
    console.log('\n================================');
    console.log('PETICIÓN DE IMAGEN RECIBIDA');
    console.log('================================');

    console.log('Producto:', req.params.id);

    console.log(
      'Content-Type:',
      req.headers['content-type']
    );

    console.log(
      'Content-Length:',
      req.headers['content-length']
    );

    next();
  },

  // Recibir el archivo con multer.
  uploadImage.single('image'),

  // Validar que sea una imagen real.
  validateImage,

  async (req, res, next) => {
    try {
      // DIAGNÓSTICO 2:
      // Comprobar que multer y la validación terminaron.
      console.log('\n=== ARCHIVO PROCESADO ===');

      console.log('ID del producto:', req.params.id);

      console.log(
        'Archivo recibido:',
        req.file
          ? {
              nombre: req.file.originalname,
              tipo: req.file.mimetype,
              tamaño: req.file.size,
            }
          : 'NINGUNO'
      );

      // Validar ID.
      if (!validId(req.params.id)) {
        return res.status(400).json({
          message: 'El producto solicitado no es válido.',
        });
      }

      // Verificar que se haya recibido un archivo.
      if (!req.file) {
        return res.status(400).json({
          message: 'Debes seleccionar una imagen.',
        });
      }

      // Buscar producto.
      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).json({
          message: 'No se encontró el producto.',
        });
      }

      // DIAGNÓSTICO 3:
      // Intentar subir a Amazon S3.
      console.log('\n=== SUBIENDO A AMAZON S3 ===');

      const nuevaImageKey = await subirImagenS3(
        req.file
      );

      console.log(
        'Imagen subida a S3:',
        nuevaImageKey
      );

      const imagenAnterior = product.imageKey;

      // Guardar la referencia en MongoDB.
      try {
        product.imageKey = nuevaImageKey;
        await product.save();

        console.log(
          'imageKey guardado en MongoDB:',
          product.imageKey
        );
      } catch (error) {
        // Si falla MongoDB, intentar eliminar
        // la imagen nueva para evitar archivos huérfanos.
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: nuevaImageKey,
          })
        ).catch((cleanupError) => {
          console.error(
            'Error al limpiar la imagen nueva:',
            cleanupError
          );
        });

        throw error;
      }

      // Eliminar la imagen anterior si se reemplazó.
      if (
        imagenAnterior &&
        imagenAnterior !== nuevaImageKey
      ) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: imagenAnterior,
            })
          );

          console.log(
            'Imagen anterior eliminada de S3:',
            imagenAnterior
          );
        } catch (error) {
          console.error(
            'No se pudo eliminar la imagen anterior:',
            error
          );
        }
      }

      console.log('\n=== IMAGEN GUARDADA CORRECTAMENTE ===');

      return res.json({
        message: 'Imagen subida correctamente.',
        imageKey: nuevaImageKey,
        product,
      });
    } catch (error) {
      console.error(
        'ERROR AL SUBIR IMAGEN:',
        error
      );

      return next(error);
    }
  }
);

export default router;
