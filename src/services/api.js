import { Platform } from 'react-native';

const defaultHost =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api'
    : 'http://192.168.68.107:4000/api';

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || defaultHost
).replace(/\/$/, '');

export function getApiUrl(path) {
  return `${API_URL}${path}`;
}

export async function apiRequest(
  path,
  { method = 'GET', body, token } = {}
) {
  let response;

  // Detectar si estamos enviando una imagen u otros archivos.
  const isFormData = body instanceof FormData;
  const hasBody = body !== undefined && body !== null;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',

        // FormData necesita que fetch genere automáticamente
        // el Content-Type con su multipart boundary.
        ...(hasBody && !isFormData
          ? { 'Content-Type': 'application/json' }
          : {}),

        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },

      ...(hasBody
        ? {
            body: isFormData
              ? body
              : JSON.stringify(body),
          }
        : {}),
    });
  
} catch (error) {
  console.error('Error de red en apiRequest:', {
    path,
    method,
    message: error?.message,
  });

  throw new Error(
    `No se pudo completar la petición ${method} ${path}: ${
      error?.message || 'Error de red desconocido'
    }`

  );
}


  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || 'Ocurrió un error. Intenta de nuevo.'
    );
  }

  return data;
}
