import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AppButton from '../components/AppButton';
import AppScreen from '../components/AppScreen';
import CartItem from '../components/CartItem';
import useRequireAuth from '../hooks/useRequireAuth';
import { apiRequest } from '../services/api';
import theme from '../styles/theme';

export default function CartScreen() {
  const { token, user, loading: authLoading } = useRequireAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


useFocusEffect(
  useCallback(() => {
    let active = true;

    // Limpiar datos de la sesión anterior.
    setItems([]);
    setError('');
    setLoading(true);

    if (!token) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    async function fetchCart() {
      try {
        const data = await apiRequest('/cart', { token });

        if (active) {
          setItems(data.items || []);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchCart();

    return () => {
      active = false;
    };
  }, [token])
);

  async function addAnother(productId) {
    try {
      const data = await apiRequest(`/cart/${productId}`, { method: 'POST', token });
      setItems((current) => current.map((item) => item.product._id === productId ? { ...item, quantity: data.item.quantity } : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }


async function subtractOne(productId) {
  try {
    const data = await apiRequest(`/cart/${productId}`, {
      method: 'PATCH',
      token
    });

    if (data.removed) {
      // Eliminar el producto de la pantalla
      setItems((current) =>
        current.filter(
          (item) => item.product._id !== productId
        )
      );
    } else {
      // Actualizar la cantidad en la pantalla
      setItems((current) =>
        current.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: data.quantity }
            : item
        )
      );
    }

    setError('');
  } catch (requestError) {
    setError(requestError.message);
  }
}


  async function removeItem(productId) {
    try {
      await apiRequest(`/cart/${productId}`, { method: 'DELETE', token });
      setItems((current) => current.filter((item) => item.product._id !== productId));
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  
  const total = items.reduce((suma, item) => {
    return suma + Number(item.product?.price || 0) * Number(item.quantity || 0);
  }, 0);

  if (authLoading || !user) return <AppScreen style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></AppScreen>;

  return (
    <AppScreen>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={(
          <View>
            <AppButton title="‹ Volver al catálogo" variant="outline" onPress={() => router.replace('/products')} style={styles.back} />
            <Text style={styles.title}>Tu carrito</Text>
            <Text style={styles.subtitle}>Aquí puedes revisar, agregar o quitar productos.</Text>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {loading ? <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} /> : null}
            {!loading && items.length === 0 ? <Text style={styles.empty}>Tu carrito está vacío. Agrega productos desde el catálogo.</Text> : null}
          </View>
        )}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onAdd={() => addAnother(item.product._id)}
            onSubtract={() => subtractOne(item.product._id)}
            onRemove={() => removeItem(item.product._id)}
          />

        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 28, maxWidth: 760, width: '100%', alignSelf: 'center' },
  back: { alignSelf: 'flex-start', minHeight: 40, marginBottom: 20 },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, marginTop: 4, marginBottom: 20 },
  error: { color: theme.colors.danger, marginBottom: 12 },
  spinner: { marginVertical: 22 },
  empty: { color: theme.colors.muted, lineHeight: 21, paddingVertical: 24, textAlign: 'center' },
});
