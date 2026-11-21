
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import CategorySelector from './CategorySelector';
import AppButton from './AppButton';
import AppScreen from './AppScreen';
import TextField from './TextField';

import useRequireAuth from '../hooks/useRequireAuth';
import { apiRequest } from '../services/api';
import theme from '../styles/theme';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: 'General',
};

function productValues(product) {
  if (!product) return { ...emptyProduct };

  return {
    name: product.name || '',
    description: product.description || '',
    price: String(product.price ?? ''),
    category: product.category || 'General',
  };
}

export default function ProductEditor({
  title,
  product,
  onSave,
  saving,
}) {
  const { token, user, loading: authLoading } = useRequireAuth();

  const [values, setValues] = useState(() => productValues(product));

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'admin') return;

    let active = true;

    async function loadCategories() {
      setLoadingCategories(true);

      try {
        const data = await apiRequest('/categories', { token });

        if (!active) return;

        const received = data.categories || [];
        setCategories(received);

        setValues((current) => {
          const exists = received.some(
            (category) => category.name === current.category
          );

          if (exists || !received.length) return current;

          return {
            ...current,
            category: received[0].name,
          };
        });
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoadingCategories(false);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, [token, user?.role]);

  function update(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function selectImage() {
    setError('');

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          'Necesitas permitir el acceso a tus fotografías para seleccionar una imagen.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const image = result.assets[0];

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
      ];

      const mimeType = image.mimeType?.toLowerCase();

      if (!mimeType || !allowedTypes.includes(mimeType)) {
        setError(
          'Selecciona una imagen JPG, PNG o WEBP.'
        );
        return;
      }

      if (
        typeof image.fileSize === 'number' &&
        image.fileSize > MAX_IMAGE_SIZE
      ) {
        setError(
          'La imagen no debe superar los 5 MB.'
        );
        return;
      }

      setSelectedImage({
        uri: image.uri,
        fileName:
          image.fileName ||
          `producto.${mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1]}`,
        mimeType,
        fileSize: image.fileSize,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo seleccionar la imagen.'
      );
    }
  }

  async function createCategory() {
    setError('');

    const name = newCategory.trim();

    if (name.length < 2 || name.length > 60) {
      setError('La categoría debe tener entre 2 y 60 caracteres.');
      return;
    }

    setSavingCategory(true);

    try {
      const data = await apiRequest('/categories', {
        method: 'POST',
        token,
        body: { name },
      });

      const category = data.category;

      setCategories((current) =>
        [...current, category].sort((a, b) =>
          a.name.localeCompare(b.name, 'es')
        )
      );

      update('category', category.name);
      setNewCategory('');
      setCreatingCategory(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingCategory(false);
    }
  }

  async function submit() {
    setError('');

    const price = Number(values.price);

    if (!values.name.trim()) {
      setError('Escribe el nombre del producto.');
      return;
    }

    if (
      !values.price.trim() ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError('Escribe un precio válido.');
      return;
    }

    if (!values.category) {
      setError('Selecciona una categoría.');
      return;
    }

    try {
      await onSave(
        {
          name: values.name.trim(),
          description: values.description.trim(),
          price,
          category: values.category,
        },
        selectedImage
      );
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  if (authLoading || !user) {
    return <AppScreen />;
  }

  const previewUri = selectedImage?.uri || product?.imageUrl;

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AppButton
          title="‹ Volver al catálogo"
          variant="outline"
          onPress={() => router.replace('/products')}
          style={styles.back}
        />

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle}>
          Completa los datos básicos del producto.
        </Text>

        <TextField
          label="Nombre"
          value={values.name}
          onChangeText={(value) => update('name', value)}
          maxLength={100}
        />

        <TextField
          label="Descripción"
          value={values.description}
          onChangeText={(value) => update('description', value)}
          multiline
          maxLength={500}
        />

        <TextField
          label="Precio (MXN)"
          value={values.price}
          onChangeText={(value) => update('price', value)}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Categoría</Text>

        {loadingCategories ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={styles.loader}
          />
        ) : (
          <View style={styles.categorySelectorContainer}>
            <CategorySelector
              categories={categories}
              value={values.category}
              onChange={(category) => update('category', category)}
              disabled={saving || savingCategory}
            />
          </View>
        )}

        {!creatingCategory ? (
          <View style={styles.categoryButton}>
            <AppButton
              title="＋ Crear nueva categoría"
              variant="outline"
              onPress={() => {
                setError('');
                setCreatingCategory(true);
              }}
            />
          </View>
        ) : (
          <View style={styles.newCategoryBox}>
            <Text style={styles.label}>Nueva categoría</Text>

            <TextInput
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Ej. Deportes"
              placeholderTextColor={theme.colors.muted}
              maxLength={60}
              editable={!savingCategory}
            />

            <AppButton
              title="Guardar categoría"
              onPress={createCategory}
              loading={savingCategory}
            />

            <View style={styles.cancelButton}>
              <AppButton
                title="Cancelar"
                variant="outline"
                onPress={() => {
                  setCreatingCategory(false);
                  setNewCategory('');
                  setError('');
                }}
              />
            </View>
          </View>
        )}

        {/* Imagen del producto */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>
            Imagen del producto
          </Text>

          <Text style={styles.imageHint}>
            Formatos JPG, PNG o WEBP. Máximo 5 MB.
          </Text>

          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.emptyImage}>
              <Text style={styles.emptyImageText}>
                Sin imagen seleccionada
              </Text>
            </View>
          )}

          <AppButton
            title={
              selectedImage
                ? 'Cambiar imagen'
                : 'Seleccionar imagen'
            }
            variant="outline"
            onPress={selectImage}
            disabled={saving}
          />

          {selectedImage ? (
            <View style={styles.imageInfo}>
              <Text
                style={styles.imageFileName}
                numberOfLines={2}
              >
                {selectedImage.fileName}
              </Text>

              <AppButton
                title="Quitar selección"
                variant="outline"
                onPress={() => setSelectedImage(null)}
                disabled={saving}
              />
            </View>
          ) : null}
        </View>

        {error ? (
          <Text
            accessibilityRole="alert"
            style={styles.error}
          >
            {error}
          </Text>
        ) : null}

        <View style={styles.saveButton}>
          <AppButton
            title={
              title.startsWith('Editar')
                ? 'Guardar cambios'
                : 'Crear producto'
            }
            onPress={submit}
            loading={saving}
            disabled={
              loadingCategories ||
              savingCategory ||
              !categories.length
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },

  back: {
    alignSelf: 'flex-start',
    minHeight: 40,
    marginBottom: 22,
  },

  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '800',
  },

  subtitle: {
    color: theme.colors.muted,
    marginTop: 5,
    marginBottom: 22,
  },

  label: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },

  categorySelectorContainer: {
    marginBottom: 12,
  },

  loader: {
    marginVertical: 18,
  },

  categoryButton: {
    marginBottom: 14,
  },

  newCategoryBox: {
    marginTop: 8,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 12,
  },

  cancelButton: {
    marginTop: 8,
  },

  imageSection: {
    marginTop: 12,
    marginBottom: 20,
  },

  imageHint: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: 12,
  },

  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },

  emptyImage: {
    height: 180,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },

  emptyImageText: {
    color: theme.colors.muted,
  },

  imageInfo: {
    marginTop: 10,
    gap: 10,
  },

  imageFileName: {
    color: theme.colors.muted,
    fontSize: 13,
  },

  error: {
    color: theme.colors.danger,
    marginBottom: 14,
  },

  saveButton: {
    marginTop: 10,
    marginBottom: 20,
  },
});
