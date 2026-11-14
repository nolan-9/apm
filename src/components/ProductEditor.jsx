import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import AppButton from './AppButton';
import AppScreen from './AppScreen';
import TextField from './TextField';
import useRequireAuth from '../hooks/useRequireAuth';
import theme from '../styles/theme';

const emptyProduct = { name: '', description: '', price: '', category: '' };

function productValues(product) {
  if (!product) return emptyProduct;
  return {
    name: product.name || '',
    description: product.description || '',
    price: String(product.price ?? ''),
    category: product.category || '',
  };
}

export default function ProductEditor({ title, product, onSave, saving }) {
  const { user, loading: authLoading } = useRequireAuth();
  const [values, setValues] = useState(() => productValues(product));
  const [error, setError] = useState('');

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    setError('');
    const price = Number(values.price);
    if (!values.name.trim()) return setError('Escribe el nombre del producto.');
    if (!Number.isFinite(price) || price < 0) return setError('Escribe un precio válido.');
    try {
      await onSave({
        name: values.name.trim(),
        description: values.description.trim(),
        price,
        category: values.category.trim() || 'General',
      });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  if (authLoading || !user) return <AppScreen />;

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppButton title="‹ Volver al catálogo" variant="outline" onPress={() => router.replace('/products')} style={styles.back} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Completa los datos básicos del producto.</Text>
        <TextField label="Nombre" value={values.name} onChangeText={(value) => update('name', value)} maxLength={100} />
        <TextField label="Descripción" value={values.description} onChangeText={(value) => update('description', value)} multiline maxLength={500} />
        <TextField label="Precio (MXN)" value={values.price} onChangeText={(value) => update('price', value)} keyboardType="decimal-pad" />
        <TextField label="Categoría" value={values.category} onChangeText={(value) => update('category', value)} placeholder="Ej. Tecnología" maxLength={60} />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <AppButton title={title.startsWith('Editar') ? 'Guardar cambios' : 'Crear producto'} onPress={submit} loading={saving} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, width: '100%', maxWidth: 560, alignSelf: 'center' },
  back: { alignSelf: 'flex-start', minHeight: 40, marginBottom: 22 },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, marginTop: 5, marginBottom: 22 },
  error: { color: theme.colors.danger, marginBottom: 14 },
});
