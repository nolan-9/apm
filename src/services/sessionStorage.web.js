const TOKEN_KEY = 'mercado-simple-token';

export async function getSessionToken() {
  return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
}

export async function saveSessionToken(token) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

export async function clearSessionToken() {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}
