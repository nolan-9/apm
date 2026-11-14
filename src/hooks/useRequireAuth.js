import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function useRequireAuth() {
  const auth = useAuth();
  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace('/auth/login');
  }, [auth.loading, auth.user]);
  return auth;
}
