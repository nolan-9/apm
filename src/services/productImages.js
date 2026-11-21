
import * as FileSystem from 'expo-file-system/legacy';
import { getApiUrl } from './api';

export async function uploadProductImage(productId, image, token) {
  if (!image?.uri) {
    throw new Error('No se seleccionó una imagen válida.');
  }

  if (!productId) {
    throw new Error('No se encontró el ID del producto.');
  }

  const mimeType = image.mimeType || 'image/jpeg';

  console.log('=== ENVIANDO IMAGEN ===');
  console.log('Producto:', productId);
  console.log('Tipo:', mimeType);
  console.log('URI:', image.uri);

  let response;

  try {
    response = await FileSystem.uploadAsync(
      getApiUrl(`/products/${productId}/image`),
      image.uri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'image',
        mimeType,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
  } catch (error) {
    throw new Error(
      `No se pudo enviar la imagen: ${error.message}`
    );
  }

  let data = {};

  try {
    data = JSON.parse(response.body || '{}');
  } catch {
    throw new Error(
      `El servidor devolvió una respuesta no válida (HTTP ${response.status}).`
    );
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      data.message || `Error HTTP ${response.status} al subir la imagen.`
    );
  }

  return data;
}
