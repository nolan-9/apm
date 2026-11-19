import { Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../styles/theme';
import AppButton from './AppButton';

export default function ProductCard({ product, onAdd, onEdit, onDelete, isAdmin = false }) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.category}>{product.category || 'General'}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description || 'Sin descripción.'}</Text>
        <Text style={styles.price}>${Number(product.price).toLocaleString('es-MX')} MXN</Text>
        {isAdmin ? (
          <>
            <AppButton title="Agregar al carrito" variant="accent" onPress={onAdd} style={styles.addButton} />
            <View style={styles.actions}>
              <Pressable onPress={onEdit} accessibilityRole="button" style={styles.textAction}><Text style={styles.actionLabel}>Editar</Text></Pressable>
              <Pressable onPress={onDelete} accessibilityRole="button" style={styles.textAction}><Text style={[styles.actionLabel, styles.deleteLabel]}>Eliminar</Text></Pressable>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  content: { padding: 13 },
  category: { color: theme.colors.muted, fontSize: 12, textTransform: 'capitalize', marginBottom: 4 },
  name: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  description: { color: theme.colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  price: { color: theme.colors.text, fontSize: 17, fontWeight: '800', marginTop: 8 },
  addButton: { minHeight: 40, marginTop: 10 },
  actions: { flexDirection: 'row', marginTop: 8, gap: 18 },
  textAction: { paddingVertical: 5 },
  actionLabel: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
  deleteLabel: { color: theme.colors.danger },
});
