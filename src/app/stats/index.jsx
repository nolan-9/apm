
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';

import AppScreen from '../../components/AppScreen';
import useRequireAuth from '../../hooks/useRequireAuth';
import { apiRequest } from '../../services/api';
import theme from '../../styles/theme';

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MXN`;
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const {
    user,
    token,
    loading: authLoading,
  } = useRequireAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/stats', { token });
      setStats(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  if (authLoading || !user) {
    return (
      <AppScreen style={styles.center}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />
      </AppScreen>
    );
  }

  if (user.role !== 'admin') {
    return (
      <AppScreen style={styles.center}>
        <Text style={styles.title}>Acceso restringido</Text>
        <Text style={styles.subtitle}>
          Solo los administradores pueden consultar las estadísticas.
        </Text>
        <Pressable onPress={() => router.replace('/products')}>
          <Text style={styles.backLink}>Volver al catálogo</Text>
        </Pressable>
      </AppScreen>
    );
  }

  const summary = stats?.summary || {};
  const categories = stats?.productsByCategory || [];
  const expensiveProducts = stats?.mostExpensiveProducts || [];

  const maxCategoryCount = Math.max(
    1,
    ...categories.map((item) => item.count)
  );

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>FINazon</Text>
            <Text style={styles.title}>Estadísticas</Text>
            <Text style={styles.subtitle}>
              Panel de administración
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.spinner}
          />
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadStats}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && stats ? (
          <>
            <Text style={styles.sectionTitle}>
              Resumen general
            </Text>

            <View style={styles.metricGrid}>
              <MetricCard
                label="Productos"
                value={summary.totalProducts || 0}
              />
              <MetricCard
                label="Usuarios"
                value={summary.totalUsers || 0}
              />
              <MetricCard
                label="Con fotografía"
                value={summary.productsWithImage || 0}
              />
              <MetricCard
                label="Sin fotografía"
                value={summary.productsWithoutImage || 0}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Análisis de precios
            </Text>

            <View style={styles.metricGrid}>
              <MetricCard
                label="Valor del catálogo"
                value={formatMoney(summary.totalValue)}
              />
              <MetricCard
                label="Precio promedio"
                value={formatMoney(summary.averagePrice)}
              />
              <MetricCard
                label="Precio mínimo"
                value={formatMoney(summary.minPrice)}
              />
              <MetricCard
                label="Precio máximo"
                value={formatMoney(summary.maxPrice)}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Productos por categoría
            </Text>

            <View style={styles.panel}>
              {categories.length === 0 ? (
                <Text style={styles.emptyText}>
                  Todavía no hay categorías con productos.
                </Text>
              ) : (
                categories.map((item, index) => (
                  <View
                    key={`${item.category}-${index}`}
                    style={styles.categoryRow}
                  >
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>
                        {item.category}
                      </Text>
                      <Text style={styles.categoryCount}>
                        {item.count}
                      </Text>
                    </View>

                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${
                              (item.count / maxCategoryCount) * 100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.sectionTitle}>
              Productos más caros
            </Text>

            <View style={styles.panel}>
              {expensiveProducts.length === 0 ? (
                <Text style={styles.emptyText}>
                  Todavía no hay productos registrados.
                </Text>
              ) : (
                expensiveProducts.map((product, index) => (
                  <View
                    key={product._id}
                    style={[
                      styles.productRow,
                      index !== expensiveProducts.length - 1 &&
                        styles.productDivider,
                    ]}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {index + 1}. {product.name}
                      </Text>
                      <Text style={styles.productCategory}>
                        {product.category || 'General'}
                      </Text>
                    </View>

                    <Text style={styles.productPrice}>
                      {formatMoney(product.price)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.note}>
              El valor del catálogo corresponde a la suma de los
              precios registrados, no a ingresos por ventas.
            </Text>

            <Pressable
              onPress={loadStats}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshButtonText}>
                Actualizar estadísticas
              </Text>
            </Pressable>
          </>
        ) : null}

      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  brand: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  title: {
    color: theme.colors.text,
    fontSize: 27,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 14,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    minHeight: 100,
    justifyContent: 'center',
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  metricValue: {
    color: theme.colors.primary,
    fontSize: 19,
    fontWeight: '800',
    flexShrink: 1,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
  categoryRow: {
    marginBottom: 17,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
    gap: 10,
  },
  categoryName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  categoryCount: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  barBackground: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#E7EAE8',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    gap: 12,
  },
  productDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  productCategory: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  productPrice: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  note: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 18,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  spinner: {
    marginTop: 40,
  },
  errorBox: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.danger,
    marginBottom: 10,
  },
  retryText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
