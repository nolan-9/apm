
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import AppButton from '../../../components/AppButton';
import AppScreen from '../../../components/AppScreen';
import ProductEditor from '../../../components/ProductEditor';

import useRequireAuth from '../../../hooks/useRequireAuth';
import { apiRequest } from '../../../services/api';
import { uploadProductImage } from '../../../services/productImages';
import theme from '../../../styles/theme';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();

  const {
    token,
    user,
    loading: authLoading,
  } = useRequireAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      router.replace('/products');
      return undefined;
    }

    let active = true;

    if (!token || typeof id !== 'string') {
      return undefined;
    }

    apiRequest(`/products/${id}`, { token })
      .then((data) => {
        if (active) {
          setProduct(data.product);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, token, authLoading, user?.role]);

  async function saveProduct(values, selectedImage) {
    setSaving(true);

    try {
      // 1. Actualizar los datos del producto en MongoDB.
      await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: values,
        token,
      });

      // 2. Reemplazar la imagen solo si se eligió una nueva.
      if (selectedImage) {
        try {
          await uploadProductImage(
            id,
            selectedImage,
            token
          );
        } catch (imageError) {
          throw new Error(
            `Los datos se actualizaron, pero no se pudo guardar la imagen: ${imageError.message}. ` +
            'Puedes volver a intentar seleccionarla.'
          );
        }
      }

      // 3. Regresar al catálogo.
      router.replace('/products');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppScreen style={styles.center}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />
      </AppScreen>
    );
  }

  if (error || !product) {
    return (
      <AppScreen style={styles.errorPage}>
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>
            {error || 'No se encontró el producto.'}
          </Text>

          <AppButton
            title="Volver al catálogo"
            onPress={() => router.replace('/products')}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <ProductEditor
      title="Editar producto"
      product={product}
      onSave={saveProduct}
      saving={saving}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorPage: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },

  errorContent: {
    width: '100%',
    maxWidth: 440,
    gap: 14,
  },

  errorText: {
    color: theme.colors.danger,
    fontSize: 15,
    textAlign: 'center',
  },
});
