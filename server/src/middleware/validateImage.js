
import { fileTypeFromBuffer } from 'file-type';

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

export default async function validateImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Debes seleccionar una imagen.'
      });
    }

    const detectedType = await fileTypeFromBuffer(req.file.buffer);

    if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
      return res.status(400).json({
        message: 'El archivo no es una imagen JPG, PNG o WEBP válida.'
      });
    }

    // Usamos el tipo detectado en el contenido real.
    req.file.mimetype = detectedType.mime;

    next();
  } catch (error) {
    next(error);
  }
}
