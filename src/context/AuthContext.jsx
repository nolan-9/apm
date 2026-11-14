import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { clearSessionToken, getSessionToken, saveSessionToken } from '../services/sessionStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const savedToken = await getSessionToken();
        if (!savedToken) return;
        const data = await apiRequest('/auth/me', { token: savedToken });
        if (active) {
          setToken(savedToken);
          setUser(data.user);
        }
      } catch {
        await clearSessionToken();
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    return () => { active = false; };
  }, []);

  async function authenticate(path, values) {
    const data = await apiRequest(path, { method: 'POST', body: values });
    await saveSessionToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function login(values) {
    return authenticate('/auth/login', values);
  }

  async function register(values) {
    return authenticate('/auth/register', values);
  }

  async function logout() {
    await clearSessionToken();
    setToken(null);
    setUser(null);
  }

  const value = { token, user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
