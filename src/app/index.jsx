import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AppScreen from '../components/AppScreen';
import { useAuth } from '../context/AuthContext';
import theme from '../styles/theme';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) router.replace(user ? '/products' : '/auth/login');
  }, [loading, user]);

  return <AppScreen style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></AppScreen>;
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
