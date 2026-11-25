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
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const loadCart = useCallback(async () => {
    const data = await apiRequest('/cart', { token });
    return data.items || [];
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setItems([]);
      setError('');
      setLoading(Boolean(token));

      if (token) {
        loadCart()
          .then((cart) => {
            if (active) setItems(cart);
          })
          .catch((requestError) => {
            if (active) setError(requestError.message);
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      }

      return () => {
        active = false;
      };
    }, [loadCart, token])
  );

  async function changeItem(productId, method) {
    setUpdating(true);
    setError('');
    try {
      const data = await apiRequest(`/cart/${productId}`, { method, token });
      if (method === 'DELETE' || data.removed) {
        setItems((current) => current.filter((item) => item.product._id !== productId));
      } else {
        setItems((current) => current.map((item) => {
          if (item.product._id !== productId) return item;
          return data.item ?? {
            ...item,
            product: { ...item.product, stock: data.stock },
            quantity: data.quantity,
          };
        }));
      }
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.status === 409 || requestError.status === 404) {
        try {
          setItems(await loadCart());
        } catch (refreshError) {
          setError(refreshError.message);
        }
      }
    } finally {
      setUpdating(false);
    }
  }

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
            updating={updating}
            onAdd={() => changeItem(item.product._id, 'POST')}
            onSubtract={() => changeItem(item.product._id, 'PATCH')}
            onRemove={() => changeItem(item.product._id, 'DELETE')}
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
