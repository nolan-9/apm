
import { useState } from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
  StatusBar,
} from 'react-native';

import theme from '../styles/theme';
import AppButton from './AppButton';

export default function ProductCard({
  product,
  cartQuantity,
  addingDisabled,
  onAdd,
  onEdit,
  onDelete,
  isAdmin = false,
}) {
  const [imageVisible, setImageVisible] = useState(false);
  const stock = product.stock ?? 0;
  const atLimit = cartQuantity >= stock;

  return (
    <View style={styles.card}>
      <View style={styles.content}>

        {/* Categoría */}
        <Text style={styles.category}>
          {product.category || 'General'}
        </Text>

        {/* Fotografía del producto */}
        {product.imageUrl ? (
          <Pressable
            onPress={() => setImageVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Ver imagen de ${product.name}`}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />

            <View style={styles.imageHint}>
              <Text style={styles.imageHintText}>
                Ver imagen completa
              </Text>
            </View>
          </Pressable>
        ) : null}

        {/* Nombre del producto */}
        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Descripción */}
        <Text
          style={styles.description}
          numberOfLines={2}
        >
          {product.description || 'Sin descripción.'}
        </Text>

        {/* Precio */}
        <Text style={styles.price}>
          ${Number(product.price).toLocaleString('es-MX')} MXN
        </Text>

        <View
          accessibilityLabel={
            stock > 0
              ? `Disponible: ${stock} unidades`
              : 'Agotado'
          }
          accessibilityRole="text"
          style={[
            styles.stockBadge,
            stock > 0 ? styles.stockAvailable : styles.stockExhausted,
          ]}
        >
          <Text
            style={[
              styles.stockText,
              stock > 0
                ? styles.stockAvailableText
                : styles.stockExhaustedText,
            ]}
          >
            {stock > 0 ? `Disponible · ${stock} unidades` : 'Agotado'}
          </Text>
        </View>

        {/* Agregar al carrito */}
        <AppButton
          title={
            stock === 0
              ? 'Agotado'
              : atLimit
                ? 'Límite alcanzado'
                : 'Agregar al carrito'
          }
          variant="accent"
          onPress={onAdd}
          disabled={atLimit || addingDisabled}
          style={styles.addButton}
        />

        {/* Opciones del administrador */}
        {isAdmin && (
          <View style={styles.actions}>

            <Pressable
              onPress={onEdit}
              accessibilityRole="button"
              style={styles.textAction}
            >
              <Text style={styles.actionLabel}>
                Editar
              </Text>
            </Pressable>

            <Pressable
              onPress={onDelete}
              accessibilityRole="button"
              style={styles.textAction}
            >
              <Text
                style={[
                  styles.actionLabel,
                  styles.deleteLabel,
                ]}
              >
                Eliminar
              </Text>
            </Pressable>

          </View>
        )}

      </View>

      {/* VISOR DE IMAGEN COMPLETA */}
      <Modal
        visible={imageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>

          <StatusBar
            barStyle="light-content"
            backgroundColor="#000000"
          />

          {/* Botón cerrar */}
          <Pressable
            onPress={() => setImageVisible(false)}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar imagen"
          >
            <Text style={styles.closeText}>
              ✕
            </Text>
          </Pressable>

          {/* Fotografía completa */}
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          ) : null}

          {/* Nombre del producto */}
          <View style={styles.modalFooter}>
            <Text
              style={styles.modalProductName}
              numberOfLines={2}
            >
              {product.name}
            </Text>
          </View>

        </View>
      </Modal>

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
    borderColor: theme.colors.border,
  },

  content: {
    padding: 13,
  },

  category: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'capitalize',
    marginBottom: 8,
  },

  // Imagen en la tarjeta
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 14,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  imageHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
  },

  imageHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  price: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 8,
  },

  stockBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
  },

  stockAvailable: {
    backgroundColor: '#E8F3EC',
  },

  stockExhausted: {
    backgroundColor: '#FCE9E8',
  },

  stockText: {
    fontSize: 13,
    fontWeight: '700',
  },

  stockAvailableText: {
    color: theme.colors.success,
  },

  stockExhaustedText: {
    color: theme.colors.danger,
  },

  addButton: {
    minHeight: 40,
    marginTop: 10,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },

  textAction: {
    paddingVertical: 5,
    marginRight: 18,
  },

  actionLabel: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  deleteLabel: {
    color: theme.colors.danger,
  },

  // Fondo del visor
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Fotografía completa sin recorte
  fullImage: {
    width: '100%',
    height: '78%',
  },

  // Botón de cerrar
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '600',
  },

  // Información inferior
  modalFooter: {
    position: 'absolute',
    bottom: 45,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  modalProductName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});
