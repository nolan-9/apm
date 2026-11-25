import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AppButton from '../../components/AppButton';
import AppScreen from '../../components/AppScreen';
import ProductCard from '../../components/ProductCard';
import TextField from '../../components/TextField';
import useRequireAuth from '../../hooks/useRequireAuth';
import { apiRequest } from '../../services/api';
import theme from '../../styles/theme';

export default function ProductsScreen() {
  const { user, token, logout, loading: authLoading } = useRequireAuth();
  const [products, setProducts] = useState([]);
  const [cartQuantities, setCartQuantities] = useState({});
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [productData, cartData] = await Promise.all([
        apiRequest('/products', { token }),
        apiRequest('/cart', { token }),
      ]);
      setProducts(productData.products);
      setCartQuantities(Object.fromEntries(
        cartData.items.map((item) => [item.product._id, item.quantity])
      ));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    loadProducts();
  }, [loadProducts]));

  async function addToCart(product) {
    setAdding(true);
    setError('');
    try {
      const { item } = await apiRequest(`/cart/${product._id}`, { method: 'POST', token });
      setCartQuantities((current) => ({ ...current, [product._id]: item.quantity }));
      setProducts((current) => current.map((entry) =>
        entry._id === product._id ? { ...entry, stock: item.product.stock } : entry
      ));
    } catch (requestError) {
      if (requestError.status === 409 || requestError.status === 404) {
        await loadProducts();
      }
      setError(requestError.message);
    } finally {
      setAdding(false);
    }
  }

  async function deleteProduct(product) {
    const remove = async () => {
      try {
        await apiRequest(`/products/${product._id}`, { method: 'DELETE', token });
        setProducts((current) => current.filter((item) => item._id !== product._id));
      } catch (requestError) {
        Alert.alert('No se pudo eliminar', requestError.message);
      }
    };

    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`¿Eliminar “${product.name}”?`)) await remove();
      return;
    }
    Alert.alert('Eliminar producto', `¿Quieres eliminar “${product.name}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: remove },
    ]);
  }

  async function signOut() {
    await logout();
    router.replace('/auth/login');
  }

  const visibleProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();
    return !query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query);
  });
  const cartCount = Object.values(cartQuantities).reduce((sum, quantity) => sum + quantity, 0);

  if (authLoading || !user) return <AppScreen style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></AppScreen>;
  const isAdmin = user.role === 'admin';

  return (
    <AppScreen>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={(
          <View>
            <View style={styles.header}>
              <View style={styles.greeting}>
                <Text style={styles.eyebrow}>FINazon</Text>
                <Text style={styles.welcome}>Hola, {user.name}</Text>
            </View>

             {/* El carrito está disponible para todos los usuarios */}
            <Pressable
              onPress={() => router.push('/cart')}
              accessibilityRole="button"
              style={styles.cartButton}
            >
              <Text style={styles.cartText}>
                Carrito · {cartCount}
              </Text>
            </Pressable>
          </View>

            <View style={styles.toolbar}>
  {isAdmin ? (
    <>
      <AppButton
        title="＋ Producto"
        variant="primary"
        onPress={() => router.push('/products/new')}
        style={styles.createButton}
      />

      <Pressable
        onPress={() => router.push('/stats')}
        accessibilityRole="button"
        style={styles.statsButton}
      >
        <Text style={styles.statsButtonText}>
          Estadísticas
        </Text>
      </Pressable>
    </>
  ) : null}

  <Pressable
    onPress={signOut}
    accessibilityRole="button"
    style={styles.logout}
  >
    <Text style={styles.logoutText}>Salir</Text>
  </Pressable>
</View>
            <Text style={styles.heading}>Catálogo</Text>
            <Text style={styles.subtitle}>Explora y administra los productos.</Text>
            <TextField label="Buscar" value={search} onChangeText={setSearch} placeholder="Nombre, categoría…" returnKeyType="search" style={styles.search} />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {loading ? <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} /> : null}
            {!loading && visibleProducts.length === 0 ? <Text style={styles.empty}>{search ? 'No encontramos productos con esa búsqueda.' : 'Todavía no hay productos. Agrega el primero.'}</Text> : null}
          </View>
        )}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            cartQuantity={cartQuantities[item._id] ?? 0}
            addingDisabled={adding || loading}
            onAdd={() => addToCart(item)}
            onEdit={() => router.push(`/products/${item._id}/edit`)}
            onDelete={() => deleteProduct(item)}
            isAdmin={isAdmin}
          />
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 28, maxWidth: 760, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14 },
  greeting: { flex: 1 },
  eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  welcome: { color: theme.colors.text, fontSize: 20, fontWeight: '800', marginTop: 3 },
  cartButton: { paddingHorizontal: 13, paddingVertical: 11, backgroundColor: theme.colors.surface, borderRadius: 12, borderColor: theme.colors.border, borderWidth: 1 },
  cartText: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  toolbar: { flexDirection: 'row', alignItems: 'center',  flexWrap: 'wrap', gap: 14, marginBottom: 20 },
  createButton: { minHeight: 42, paddingHorizontal: 13 },
  logout: { paddingVertical: 10, paddingHorizontal: 5 },
  logoutText: { color: theme.colors.muted, fontWeight: '600' },
  heading: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, fontSize: 14, marginTop: 3, marginBottom: 18 },
  search: { marginBottom: 6 },
  error: { color: theme.colors.danger, marginBottom: 12 },
  spinner: { marginVertical: 24 },
  empty: { color: theme.colors.muted, textAlign: 'center', paddingVertical: 26, lineHeight: 21 },
  statsButton: {
  paddingHorizontal: 12,
  paddingVertical: 11,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 12,
  backgroundColor: theme.colors.surface,
},

statsButtonText: {
  color: theme.colors.primary,
  fontSize: 13,
  fontWeight: '700',
},
});
