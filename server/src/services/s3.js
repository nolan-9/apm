import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function subirImagenS3(archivo) {
  if (!archivo?.buffer) {
    throw new Error("No se recibió ninguna imagen");
  }

  const extensiones = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension = extensiones[archivo.mimetype];

  if (!extension) {
    throw new Error("Formato de imagen no permitido");
  }

  const nombreArchivo = `${randomUUID()}.${extension}`;
  const imageKey = `productos/${nombreArchivo}`;

  const comando = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: imageKey,
    Body: archivo.buffer,
    ContentType: archivo.mimetype,
  });

  await s3.send(comando);

  return imageKey;
}


export async function obtenerUrlImagen(imageKey) {
  if (!imageKey) return null;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: imageKey,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 3600,
  });
}

export default s3;
