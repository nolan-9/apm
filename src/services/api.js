import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';
const API_URL = (process.env.EXPO_PUBLIC_API_URL || defaultHost).replace(/\/$/, '');

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida y la URL sea correcta.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Ocurrió un error. Intenta de nuevo.');
  return data;
}
