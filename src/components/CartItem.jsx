
import { StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';
import theme from '../styles/theme';

export default function CartItem({
  item,
  updating,
  onAdd,
  onSubtract,
  onRemove
}) {
  const product = item.product;
  const stock = product.stock ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.details}>

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.price}>
          Precio unitario: ${Number(product.price).toLocaleString('es-MX')} MXN
        </Text>

        <Text style={styles.price}>
          Total: ${(Number(product.price) * item.quantity).toLocaleString('es-MX')} MXN
        </Text>

        <Text style={styles.quantity}>
          Cantidad: {item.quantity}
        </Text>

        <Text style={styles.quantity}>
          Stock disponible: {stock} unidades
        </Text>

        <View style={styles.actions}>

          <AppButton
            title="−"
            variant="outline"
            onPress={onSubtract}
            disabled={updating || item.quantity === 0}
            style={styles.smallButton}
          />

          <AppButton
            title="＋"
            variant="accent"
            onPress={onAdd}
            disabled={updating || item.quantity >= stock}
            style={styles.smallButton}
          />

          <AppButton
            title="Quitar"
            variant="outline"
            onPress={onRemove}
            disabled={updating}
            style={styles.smallButton}
          />

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border
  },

  details: {
    padding: 13
  },

  name: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15
  },

  price: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 5
  },

  quantity: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: 3
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },

  smallButton: {
    minHeight: 38,
    paddingHorizontal: 15
  }
});
