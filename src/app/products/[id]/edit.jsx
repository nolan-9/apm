import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AppButton from '../../../components/AppButton';
import AppScreen from '../../../components/AppScreen';
import ProductEditor from '../../../components/ProductEditor';
import useRequireAuth from '../../../hooks/useRequireAuth';
import { apiRequest } from '../../../services/api';
import theme from '../../../styles/theme';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useRequireAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!token || typeof id !== 'string') return undefined;
    apiRequest(`/products/${id}`, { token })
      .then((data) => { if (active) setProduct(data.product); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, token]);

  async function saveProduct(values) {
    setSaving(true);
    try {
      await apiRequest(`/products/${id}`, { method: 'PUT', body: values, token });
      router.replace('/products');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AppScreen style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></AppScreen>;
  if (error || !product) {
    return (
      <AppScreen style={styles.errorPage}>
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>{error || 'No se encontró el producto.'}</Text>
          <AppButton title="Volver al catálogo" onPress={() => router.replace('/products')} />
        </View>
      </AppScreen>
    );
  }
  return <ProductEditor title="Editar producto" product={product} onSave={saveProduct} saving={saving} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  errorPage: { alignItems: 'center', justifyContent: 'center', padding: 22 },
  errorContent: { width: '100%', maxWidth: 440, gap: 14 },
  errorText: { color: theme.colors.danger, fontSize: 15, textAlign: 'center' },
});
